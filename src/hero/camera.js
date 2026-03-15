import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const ORTHO_SIZE = 5

function lerp(a, b, t)    { return a + (b - a) * t }
function easeOut(t)       { return 1 - (1 - t) * (1 - t) }
function easeInOut(t)     { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }

export class CameraRig {
    constructor(width, height, canvas) {
        this.width    = width
        this.height   = height
        this._mode    = 'ortho'
        this._canvas  = canvas
        this.camera   = this._makeOrtho(width, height)
        this._controls = null

        // Zoom animation state (for 0D dramatic zoom-out)
        this._zoomAnim = null   // { from, to, elapsed, dur }

        // Delayed orbit enable (for 3D reveal)
        this._revealDelay = null  // seconds remaining

        // Smooth camera position lerp between stages
        this._cameraLerp = null  // { from, to, elapsed, dur }
    }

    // ── Camera creation ───────────────────────────────────────────────────────

    _makeOrtho(width, height) {
        const aspect = width / height
        const cam = new THREE.OrthographicCamera(
            -ORTHO_SIZE * aspect,
             ORTHO_SIZE * aspect,
             ORTHO_SIZE,
            -ORTHO_SIZE,
            0.1, 500
        )
        cam.position.set(0, 0, 10)
        cam.lookAt(0, 0, 0)
        return cam
    }

    _makePerspective(width, height) {
        const cam = new THREE.PerspectiveCamera(50, width / height, 0.1, 500)
        cam.position.set(0, 0, 14)
        cam.lookAt(0, 0, 0)
        return cam
    }

    // ── Public API ────────────────────────────────────────────────────────────

    onResize(width, height) {
        this.width  = width
        this.height = height
        if (this._mode === 'ortho') {
            const aspect = width / height
            this.camera.left   = -ORTHO_SIZE * aspect
            this.camera.right  =  ORTHO_SIZE * aspect
            this.camera.top    =  ORTHO_SIZE
            this.camera.bottom = -ORTHO_SIZE
        } else {
            this.camera.aspect = width / height
        }
        this.camera.updateProjectionMatrix()
    }

    toOrtho() {
        if (this._mode === 'ortho') return
        this._mode = 'ortho'
        if (this._controls) {
            this._controls.dispose()
            this._controls = null
        }
        this._zoomAnim    = null
        this._revealDelay = null
        this._cameraLerp  = null
        this.camera = this._makeOrtho(this.width, this.height)
    }

    toPerspective() {
        if (this._mode === 'perspective') return
        this._mode  = 'perspective'
        this.camera = this._makePerspective(this.width, this.height)

        if (this._canvas) {
            this._controls = new OrbitControls(this.camera, this._canvas)
            this._controls.enableDamping   = true
            this._controls.dampingFactor   = 0.05
            this._controls.enablePan       = false
            this._controls.autoRotate      = false  // each stage sets this explicitly
            this._controls.autoRotateSpeed = 1.5
            // First interaction stops auto-rotate permanently
            this._controls.addEventListener('start', () => {
                this._controls.autoRotate = false
                this._revealDelay = null
                this._zoomAnim    = null
                this._cameraLerp  = null
                // Release zoom lock
                this._controls.minDistance = 1
                this._controls.maxDistance = Infinity
            })
        }
    }

    reframe(size) {
        const maxExtent = Math.max(size.x, size.y, size.z ?? 0)
        if (this._mode === 'ortho') {
            const padding = 1.2
            const half    = (maxExtent / 2) * padding
            const aspect  = this.width / this.height
            this.camera.left   = -half * aspect
            this.camera.right  =  half * aspect
            this.camera.top    =  half
            this.camera.bottom = -half
            this.camera.updateProjectionMatrix()
        } else {
            const dist = maxExtent * 1.4
            this.camera.position.setLength(dist * Math.sqrt(3))
            this.camera.updateProjectionMatrix()
            if (this._controls) this._controls.update()
        }
    }

    // Smooth lerp of camera to a new position (used on stage transitions)
    _lerpTo(target, dur = 0.5) {
        this._cameraLerp = { from: this.camera.position.clone(), to: target.clone(), elapsed: 0, dur }
    }

    // Position camera at radius, angled slightly down
    startOrbit(radius, { autoRotate = true } = {}) {
        if (this._mode !== 'perspective') return
        this._zoomAnim    = null
        this._revealDelay = null
        if (this._controls) {
            this._controls.autoRotate  = autoRotate
            this._controls.minDistance = 1
            this._controls.maxDistance = Infinity
        }
        this._lerpTo(new THREE.Vector3(0, radius * 0.6, radius))
    }

    stopOrbit() {
        if (this._controls) this._controls.autoRotate = false
    }

    // Position camera straight at +Z face (no orbit), for 2D/reveal stages
    setHeadOn(radius) {
        if (!this._controls) return
        const r = radius ?? this.camera.position.length()
        this._controls.autoRotate = false
        this._lerpTo(new THREE.Vector3(0, 0, r))
    }

    // Dramatic zoom-out: start camera very close (fromRadius), animate to toRadius over dur seconds
    animateZoomOut(fromRadius, toRadius, dur) {
        if (!this._controls) return
        this._cameraLerp           = null
        this._controls.autoRotate  = false
        this._controls.minDistance = fromRadius
        this._controls.maxDistance = fromRadius
        this.camera.position.set(0, 0, fromRadius)
        this._controls.update()
        this._zoomAnim = { from: fromRadius, to: toRadius, elapsed: 0, dur }
    }

    // Enable auto-rotate after `delay` seconds (used for 3D reveal)
    startRevealOrbit(delay) {
        this._revealDelay = delay
    }

    update(dt) {
        if (this._mode !== 'perspective' || !this._controls) return

        // Stage-transition camera lerp — pauses OrbitControls until complete
        if (this._cameraLerp) {
            const a = this._cameraLerp
            a.elapsed += dt
            const t = easeInOut(Math.min(a.elapsed / a.dur, 1))
            this.camera.position.lerpVectors(a.from, a.to, t)
            this.camera.lookAt(0, 0, 0)
            if (t >= 1) {
                this._cameraLerp = null
                this._controls.update()  // sync controls to final position
            }
            return  // don't let controls fight the lerp
        }

        // Zoom animation
        if (this._zoomAnim) {
            const anim = this._zoomAnim
            anim.elapsed += dt
            const t = Math.min(anim.elapsed / anim.dur, 1)
            const r = lerp(anim.from, anim.to, easeOut(t))
            this._controls.minDistance = r
            this._controls.maxDistance = r
            if (t >= 1) {
                this._controls.minDistance = 1
                this._controls.maxDistance = Infinity
                this._zoomAnim = null
            }
        }

        // Delayed orbit reveal
        if (this._revealDelay !== null) {
            this._revealDelay -= dt
            if (this._revealDelay <= 0) {
                this._controls.autoRotate = true
                this._revealDelay = null
            }
        }

        this._controls.update()
    }
}

import * as THREE from 'three'
import { CameraRig } from './camera.js'

export class HeroScene {
    constructor(canvas) {
        this.canvas = canvas
        this.scene = new THREE.Scene()

        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
        })
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)

        this.cameraRig = new CameraRig(canvas.clientWidth, canvas.clientHeight, canvas)

        this._setupLighting()

        this._running = false
        this._rafId = null
        this._lastTime = 0

        this._resizeObserver = new ResizeObserver(() => this._onResize())
        this._resizeObserver.observe(canvas)
    }

    _setupLighting() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.5)
        this.scene.add(ambient)

        const key = new THREE.DirectionalLight(0xffffff, 0.8)
        key.position.set(5, 10, 8)
        this.scene.add(key)

        const fill = new THREE.DirectionalLight(0xffffff, 0.3)
        fill.position.set(-5, -2, -4)
        this.scene.add(fill)
    }

    _onResize() {
        const w = this.canvas.clientWidth
        const h = this.canvas.clientHeight
        this.renderer.setSize(w, h, false)
        this.cameraRig.onResize(w, h)
    }

    start() {
        this._running = true
        this._tick(0)
        return this
    }

    stop() {
        this._running = false
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId)
            this._rafId = null
        }
    }

    _tick(time) {
        if (!this._running) return
        this._rafId = requestAnimationFrame(t => this._tick(t))

        const dt = Math.min((time - this._lastTime) / 1000, 0.1)  // seconds, capped
        this._lastTime = time

        this.cameraRig.update(dt)
        this._update(dt, time)
        this.renderer.render(this.scene, this.cameraRig.camera)
    }

    // Override in subclasses or patch for per-frame logic
    _update(/* dt, time */) {}

    dispose() {
        this.stop()
        this._resizeObserver.disconnect()
        this.renderer.dispose()
    }
}

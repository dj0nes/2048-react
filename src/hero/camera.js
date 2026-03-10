import * as THREE from 'three'

// Half-height of the orthographic frustum
const ORTHO_SIZE = 5

export class CameraRig {
    constructor(width, height) {
        this.width = width
        this.height = height
        this._mode = 'ortho'
        this.camera = this._makeOrtho(width, height)
    }

    _makeOrtho(width, height) {
        const aspect = width / height
        const cam = new THREE.OrthographicCamera(
            -ORTHO_SIZE * aspect,
             ORTHO_SIZE * aspect,
             ORTHO_SIZE,
            -ORTHO_SIZE,
            0.1,
            200
        )
        cam.position.set(0, 0, 10)
        cam.lookAt(0, 0, 0)
        return cam
    }

    _makePerspective(width, height) {
        const cam = new THREE.PerspectiveCamera(50, width / height, 0.1, 200)
        cam.position.set(8, 8, 14)
        cam.lookAt(0, 0, 0)
        return cam
    }

    onResize(width, height) {
        this.width = width
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

    // Switch to perspective (called when adding the 3rd dimension)
    toPerspective() {
        if (this._mode === 'perspective') return
        this._mode = 'perspective'
        this.camera = this._makePerspective(this.width, this.height)
    }

    // Reframe the camera to fit a bounding box centered at origin
    // size: { x, y, z } — extent in world units
    reframe(size) {
        const maxExtent = Math.max(size.x, size.y, size.z ?? 0)
        if (this._mode === 'ortho') {
            const padding = 1.2
            const half = (maxExtent / 2) * padding
            const aspect = this.width / this.height
            this.camera.left   = -half * aspect
            this.camera.right  =  half * aspect
            this.camera.top    =  half
            this.camera.bottom = -half
            this.camera.updateProjectionMatrix()
        } else {
            const dist = maxExtent * 1.4
            this.camera.position.setLength(dist * Math.sqrt(3))
            this.camera.updateProjectionMatrix()
        }
    }

    update(/* time */) {
        // future: tween transitions
    }
}

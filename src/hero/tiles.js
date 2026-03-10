/**
 * tiles.js — Three.js tile renderer for the 2048 hero
 *
 * TileRenderer  — one mesh per tile, owns tween state
 * BoardRenderer — manages the full set of TileRenderers, diffs frames
 */

import * as THREE from 'three'

const TILE_SIZE     = 0.9
const TILE_SPACING  = 1.1
const SLIDE_DUR     = 0.10   // seconds
const POP_DUR       = 0.12
const SPAWN_DUR     = 0.10

// Palette from 2D.css
const COLORS = {
    2:    0xeee4da,
    4:    0xede0c8,
    8:    0xf2b179,
    16:   0xf59563,
    32:   0xf67c5f,
    64:   0xf65e3b,
    128:  0xedcf72,
    256:  0xedcc61,
    512:  0xedc850,
    1024: 0xedc53f,
    2048: 0xedc22e,
    4096: 0xffcc29,
}

function tileColor(value) {
    return COLORS[value] ?? 0x3be1ff
}

function makeLabelTexture(value) {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')

    const color = tileColor(value)
    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`
    ctx.fillRect(0, 0, size, size)

    ctx.fillStyle = value <= 4 ? '#211e1d' : '#f9f6f2'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const text = String(value)
    const fs = text.length >= 5 ? 60 : text.length === 4 ? 76 : text.length === 3 ? 92 : 116
    ctx.font = `bold ${fs}px "Clear Sans", "Helvetica Neue", Arial, sans-serif`
    ctx.fillText(text, size / 2, size / 2)

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
}

// allFaces: true for 3D stages where any face may point toward the camera
function makeMaterials(value, allFaces = false) {
    const color = tileColor(value)
    const label = makeLabelTexture(value)
    // MeshBasicMaterial: unlit so the texture shows exactly as drawn (no lighting dimming)
    const face  = new THREE.MeshBasicMaterial({ map: label })
    if (allFaces) return [face, face, face, face, face, face]
    const side  = new THREE.MeshLambertMaterial({ color })
    // BoxGeometry face order: +x, -x, +y, -y, +z (front), -z (back)
    return [side, side, side, side, face, side]
}

// Convert board coordinates to centered world position
export function coordToWorld(coord, dims) {
    return new THREE.Vector3(
        ((coord.x ?? 0) - ((dims.x ?? 1) - 1) / 2) * TILE_SPACING,
       -((coord.y ?? 0) - ((dims.y ?? 1) - 1) / 2) * TILE_SPACING,
        ((coord.z ?? 0) - ((dims.z ?? 1) - 1) / 2) * TILE_SPACING,
    )
}

// ─────────────────────────────────────────────────────────────────────────────

class TileRenderer {
    constructor(scene, value, worldPos, allFaces = false) {
        this.scene    = scene
        this.value    = value
        this.dead     = false
        this.allFaces = allFaces

        const geo = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, TILE_SIZE)
        this.mesh = new THREE.Mesh(geo, makeMaterials(value, allFaces))
        this.mesh.position.copy(worldPos)
        scene.add(this.mesh)

        this._posTween   = null
        this._scaleTween = null
        this._onSlide    = null
    }

    slideTo(target, onComplete) {
        this._posTween = { from: this.mesh.position.clone(), to: target.clone(), t: 0 }
        this._onSlide  = onComplete ?? null
    }

    spawnIn() {
        this.mesh.scale.setScalar(0.01)
        this._scaleTween = { kind: 'spawn', t: 0 }
    }

    pop() {
        this._scaleTween = { kind: 'pop', t: 0 }
    }

    updateValue(newValue) {
        this.value = newValue
        const mats = Array.isArray(this.mesh.material) ? this.mesh.material : [this.mesh.material]
        mats.forEach(m => { m.map?.dispose(); m.dispose() })
        this.mesh.material = makeMaterials(newValue, this.allFaces)
    }

    update(dt) {
        if (this._posTween) {
            const tw = this._posTween
            tw.t = Math.min(tw.t + dt, SLIDE_DUR)
            const p = easeInOut(tw.t / SLIDE_DUR)
            this.mesh.position.lerpVectors(tw.from, tw.to, p)
            if (tw.t >= SLIDE_DUR) {
                this._posTween = null
                if (this._onSlide) { this._onSlide(); this._onSlide = null }
            }
        }

        if (this._scaleTween) {
            const tw = this._scaleTween
            const dur = tw.kind === 'pop' ? POP_DUR : SPAWN_DUR
            tw.t = Math.min(tw.t + dt, dur)
            const p = tw.t / dur

            if (tw.kind === 'pop') {
                const s = p < 0.5
                    ? 1 + 0.35 * (p / 0.5)
                    : 1.35 - 0.35 * ((p - 0.5) / 0.5)
                this.mesh.scale.setScalar(s)
            } else {
                this.mesh.scale.setScalar(easeOut(p))
            }

            if (tw.t >= dur) {
                this.mesh.scale.setScalar(1)
                this._scaleTween = null
            }
        }
    }

    get isAnimating() {
        return !!(this._posTween || this._scaleTween)
    }

    dispose() {
        this.dead = true
        this.scene.remove(this.mesh)
        this.mesh.geometry.dispose()
        const mats = Array.isArray(this.mesh.material) ? this.mesh.material : [this.mesh.material]
        mats.forEach(m => { m.map?.dispose(); m.dispose() })
    }
}

// ─────────────────────────────────────────────────────────────────────────────

const BOARD_BG_COLOR      = 0xbbada0
const PLACEHOLDER_COLOR   = 0xeee4da
const PLACEHOLDER_OPACITY = 0.35

function makeBoardBackground(scene, dims) {
    const nx = dims.x ?? 1
    const ny = dims.y ?? 1
    const pad = TILE_SPACING * 0.45
    const w = nx * TILE_SPACING - (TILE_SPACING - TILE_SIZE) + pad * 2
    const h = ny * TILE_SPACING - (TILE_SPACING - TILE_SIZE) + pad * 2
    const geo = new THREE.BoxGeometry(w, h, 0.04)
    const mat = new THREE.MeshLambertMaterial({ color: BOARD_BG_COLOR })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.z = -0.62   // behind everything
    scene.add(mesh)
    return mesh
}

function makePlaceholders(scene, dims) {
    const meshes = []
    const nx = dims.x ?? 1
    const ny = dims.y ?? 1
    // Thin slab at z=0: front face at z=+0.01, tiles front face at z=+0.45
    // Tiles fully occlude placeholders when present; placeholders show in empty cells
    const geo = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE, 0.02)
    const mat = new THREE.MeshLambertMaterial({
        color: PLACEHOLDER_COLOR,
        transparent: true,
        opacity: PLACEHOLDER_OPACITY,
    })
    for (let x = 0; x < nx; x++) {
        for (let y = 0; y < ny; y++) {
            const mesh = new THREE.Mesh(geo, mat)
            const pos = coordToWorld({ x, y }, dims)
            mesh.position.set(pos.x, pos.y, -0.50)
            scene.add(mesh)
            meshes.push(mesh)
        }
    }
    return { geo, mat, meshes }
}

export class BoardRenderer {
    // allFaces: label every side of each cube (use for 3D where any face may face the camera)
    constructor(scene, dims, { allFaces = false } = {}) {
        this.scene    = scene
        this.dims     = dims
        this.allFaces = allFaces
        this._tiles   = new Map()   // tileId → TileRenderer
        this._dying   = []          // TileRenderers animating out

        // Board background and placeholder cells (2D/1D only — 3D is a cube stack)
        this._boardBg      = null
        this._placeholders = null
        if (!allFaces) {
            this._boardBg      = makeBoardBackground(scene, dims)
            this._placeholders = makePlaceholders(scene, dims)
        }
    }

    applyFrame(frame) {
        const contents = frame.board.getContents()
        const seenIds  = new Set()

        for (const [keyStr, tiles] of Object.entries(contents)) {
            const coords   = frame.board.getCoordinatesFromKey(keyStr)
            const worldPos = coordToWorld(coords, this.dims)

            for (const tile of tiles) {
                seenIds.add(tile.id)

                if (tile.remove) {
                    // Consumed tile: slide to merge destination, then destroy
                    const tr = this._tiles.get(tile.id)
                    if (tr) {
                        this._tiles.delete(tile.id)
                        tr.slideTo(worldPos, () => tr.dispose())
                        this._dying.push(tr)
                    }
                    continue
                }

                if (tile.new_tile) {
                    const tr = new TileRenderer(this.scene, tile.value, worldPos, this.allFaces)
                    tr.spawnIn()
                    this._tiles.set(tile.id, tr)
                    continue
                }

                const tr = this._tiles.get(tile.id)
                if (tr) {
                    const atTarget = tr.mesh.position.distanceTo(worldPos) < 0.001
                    if (!atTarget) {
                        tr.slideTo(worldPos, tile.merged_to
                            ? () => { tr.updateValue(tile.merged_to); tr.pop() }
                            : null)
                    } else if (tile.merged_to) {
                        tr.updateValue(tile.merged_to)
                        tr.pop()
                    }
                } else {
                    // First frame: tile exists without new_tile flag
                    const tr = new TileRenderer(this.scene, tile.value, worldPos, this.allFaces)
                    tr.spawnIn()
                    this._tiles.set(tile.id, tr)
                }
            }
        }

        // Remove tiles that vanished without a remove flag (safety)
        for (const [id, tr] of this._tiles) {
            if (!seenIds.has(id)) { tr.dispose(); this._tiles.delete(id) }
        }

        this._dying = this._dying.filter(tr => !tr.dead)
    }

    update(dt) {
        for (const tr of this._tiles.values()) tr.update(dt)
        for (const tr of this._dying) tr.update(dt)
        this._dying = this._dying.filter(tr => !tr.dead)
    }

    get isAnimating() {
        if (this._dying.length) return true
        for (const tr of this._tiles.values()) {
            if (tr.isAnimating) return true
        }
        return false
    }

    dispose() {
        for (const tr of this._tiles.values()) tr.dispose()
        for (const tr of this._dying) tr.dispose()
        this._tiles.clear()
        this._dying = []

        if (this._boardBg) {
            this.scene.remove(this._boardBg)
            this._boardBg.geometry.dispose()
            this._boardBg.material.dispose()
            this._boardBg = null
        }
        if (this._placeholders) {
            for (const m of this._placeholders.meshes) this.scene.remove(m)
            this._placeholders.geo.dispose()
            this._placeholders.mat.dispose()
            this._placeholders = null
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────

function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

function easeOut(t) {
    return 1 - (1 - t) * (1 - t)
}

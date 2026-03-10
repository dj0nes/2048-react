/**
 * hero.js — entry point for the 2048 hero experience
 *
 * Usage (standalone embed):
 *   import { initHero } from './hero.js'
 *   initHero(document.querySelector('#hero-canvas'))
 *
 * Or via hero.html for dev.
 */

import * as THREE from 'three'
import { HeroScene } from './scene.js'

export function initHero(canvas) {
    const hero = new HeroScene(canvas)

    // --- Stage 0 scaffold: single cube to verify the pipeline ---
    const geo = new THREE.BoxGeometry(0.9, 0.9, 0.9)
    const mat = new THREE.MeshLambertMaterial({ color: 0xf4b860 })
    const cube = new THREE.Mesh(geo, mat)
    hero.scene.add(cube)

    // Gentle spin so it's obviously alive
    hero._update = (dt) => {
        cube.rotation.y += dt * 0.5
        cube.rotation.x += dt * 0.2
    }

    hero.start()

    return hero
}

// Auto-mount if running as a standalone page
if (typeof document !== 'undefined') {
    const canvas = document.querySelector('#hero-canvas')
    if (canvas) initHero(canvas)
}

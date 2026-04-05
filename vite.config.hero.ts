import { defineConfig } from 'vitest/config'

// Hero-only build that outputs directly into dillonjones.com's static dir.
// Usage: npm run build:hero
export default defineConfig({
  base: '/2048-hero/',
  publicDir: false,
  build: {
    outDir: '../dillonjones.com/static/2048-hero',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        hero: 'hero.html',
      },
    },
  },
})

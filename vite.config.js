import { defineConfig } from 'vite';

// ============================================================
// vite.config.js
// Descripción: Configuración de Vite para desarrollo y build.
//
// BASE PATH para GitHub Pages:
//   GitHub Pages sirve desde https://guardian-gus.github.io/
//   guardianes-de-la-vida-action-rpg/
//   Por eso el 'base' debe ser el nombre del repositorio.
//   En desarrollo local Vite ignora esto automáticamente.
//
// Fecha: 2026-05-25 | Versión: 1.0.0
// ============================================================

export default defineConfig({
  // Base path para GitHub Pages.
  // Cambia esto si el nombre del repo cambia.
  // En desarrollo local (npm run dev) Vite usa '/' automáticamente.
  base: '/guardianes-de-la-vida-action-rpg/',

  build: {
    // Carpeta de salida del build
    outDir: 'dist',

    // Limpiar dist antes de cada build
    emptyOutDir: true,
  },
});

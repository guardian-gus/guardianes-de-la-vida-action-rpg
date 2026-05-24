// ============================================================
// main.js
// Descripción: Punto de entrada del juego.
//   Este archivo es el primero que ejecuta Vite.
//   Su única responsabilidad es crear la instancia de Phaser
//   con la configuración definida en gameConfig.js.
//
//   Todo lo demás (escenas, sistemas, entidades) se gestiona
//   desde las escenas importadas en gameConfig.js.
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import gameConfig from './config/gameConfig.js';

// Crear la instancia principal del juego de Phaser.
// Phaser se monta automáticamente en el elemento 'game-canvas' del HTML.
// A partir de aquí, Phaser toma el control y arranca con BootScene.
const game = new Phaser.Game(gameConfig);

// Exportamos 'game' por si algún módulo necesita acceder a la instancia global.
// En general se evita usar esto; la comunicación entre escenas
// se hace con this.scene.get() o eventos.
export default game;

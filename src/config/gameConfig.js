// ============================================================
// gameConfig.js
// Descripción: Configuración central de Phaser 3.
//   Este archivo define cómo se inicializa el motor del juego:
//   tamaño de pantalla, física, escalado y lista de escenas.
//
// Es importado únicamente desde src/main.js.
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';

// Importamos todas las escenas del juego.
// Cada escena es una "pantalla" o "estado" del juego.
import BootScene    from '../scenes/BootScene.js';
import PreloadScene from '../scenes/PreloadScene.js';
import MenuScene    from '../scenes/MenuScene.js';
import WorldScene   from '../scenes/WorldScene.js';
import UIScene      from '../scenes/UIScene.js';
import DialogueScene from '../scenes/DialogueScene.js';
import PauseScene   from '../scenes/PauseScene.js';
import GameOverScene from '../scenes/GameOverScene.js';
import VictoryScene from '../scenes/VictoryScene.js';

import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

// ============================================================
// CONFIGURACIÓN PRINCIPAL DE PHASER
// ============================================================
const gameConfig = {
  // Tipo de renderizado.
  // Phaser.AUTO elige WebGL si el navegador lo soporta,
  // o Canvas como respaldo. WebGL es más rápido.
  type: Phaser.AUTO,

  // Resolución lógica del juego.
  // El juego "piensa" en 480x270 pero se ve escalado en pantalla.
  width:  GAME_WIDTH,
  height: GAME_HEIGHT,

  // El elemento HTML donde se monta el juego.
  // 'game-canvas' debe existir en index.html.
  parent: 'game-canvas',

  // Configuración del escalado.
  // Esto hace que el juego se vea nítido en cualquier tamaño de pantalla.
  scale: {
    mode: Phaser.Scale.FIT,       // Escala manteniendo la proporción
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centra horizontal y verticalmente
  },

  // Renderizado pixel art: desactivar suavizado para que los píxeles
  // se vean nítidos y no difuminados.
  render: {
    pixelArt: true,               // Activar modo pixel art
    antialias: false,             // Sin suavizado de bordes
    antialiasGL: false,           // Sin suavizado OpenGL
  },

  // Sistema de física.
  // Arcade es el más simple y eficiente para un Action RPG 2D.
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },         // Sin gravedad (vista top-down)
      debug: false,               // Cambiar a true para ver hitboxes durante desarrollo
    },
  },

  // Color de fondo cuando no hay mapa cargado.
  // Negro durante la carga, el mapa lo reemplaza después.
  backgroundColor: '#000000',

  // Lista de escenas en orden de registro.
  // La PRIMERA escena de la lista es la que arranca automáticamente.
  // El orden importa para el registro interno de Phaser.
  scene: [
    BootScene,      // 1. Configuración mínima inicial
    PreloadScene,   // 2. Carga de assets con barra de progreso
    MenuScene,      // 3. Menú principal
    WorldScene,     // 4. Escena principal del juego
    UIScene,        // 5. HUD (corre en paralelo a WorldScene)
    DialogueScene,  // 6. Caja de diálogo
    PauseScene,     // 7. Menú de pausa
    GameOverScene,  // 8. Pantalla de game over
    VictoryScene,   // 9. Pantalla de victoria
  ],
};

export default gameConfig;

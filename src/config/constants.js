// ============================================================
// constants.js
// Descripción: Constantes globales del juego. Aquí se definen
//   todos los valores que se usan en múltiples archivos y que
//   NO deben cambiar durante la ejecución del juego.
//
// Cómo usarlo:
//   import { TILE_SIZE, GAME_WIDTH } from './constants.js';
//
// Regla de oro: Si un número "mágico" aparece más de una vez
//   en el código, se convierte en una constante aquí.
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

// --- RESOLUCIÓN Y PANTALLA ---
// La resolución lógica del juego. Se escala al tamaño real de la ventana.
// 1920x1080 permite que la UI y los textos se rendericen en alta resolución,
// mientras que la cámara del mundo de juego usará zoom para el estilo pixel art.
export const GAME_WIDTH  = 1920;
export const GAME_HEIGHT = 1080;

// --- TILES ---
// Tamaño en píxeles de cada tile del mapa.
// Todos los sprites y colisiones se basan en este valor.
export const TILE_SIZE = 32;

// --- CÁMARA ---
// Suavizado de la cámara al seguir al jugador.
// 0.08 = suave y natural. 0 = instantáneo. 1 = muy rígido.
export const CAMERA_LERP = 0.08;

// --- JUGADOR ---
// Velocidad base del jugador (píxeles por segundo).
export const PLAYER_DEFAULT_SPEED = 120;

// Multiplicador de velocidad al correr (tecla S).
// 1.7 = 70% más rápido que caminar.
export const PLAYER_RUN_MULTIPLIER = 1.7;

// --- COMBATE ---
// Tiempo en milisegundos que dura el efecto de "golpeado" (flash rojo).
export const HIT_FLASH_DURATION = 200;

// Tiempo en milisegundos que el enemigo permanece empujado (knockback).
export const KNOCKBACK_DURATION = 150;

// Velocidad del empuje en píxeles por segundo.
export const KNOCKBACK_SPEED = 200;

// --- COLORES (paleta Guardianes de la Vida) ---
// Se usan para placeholders y para la UI.
// Formato: 0xRRGGBB (hexadecimal de Phaser)
export const COLOR_LYNFA     = 0x9B59B6; // Violeta — Lynfa (Plasmocito)
export const COLOR_ERI       = 0xE74C3C; // Rojo    — Eri (Eritrocito)
export const COLOR_ENEMY     = 0x2ECC71; // Verde   — Virus / Bacteria
export const COLOR_BOSS      = 0xE67E22; // Naranja — Patógeno Alfa
export const COLOR_NPC       = 0x3498DB; // Azul    — NPCs
export const COLOR_HP_BAR    = 0xE74C3C; // Rojo    — Barra de vida
export const COLOR_EN_BAR    = 0x3498DB; // Azul    — Barra de energía
export const COLOR_XP_BAR    = 0xF39C12; // Amarillo — Barra de XP
export const COLOR_FLOOR     = 0x8B4567; // Rosa oscuro — Suelo del ganglio
export const COLOR_WALL      = 0x4A235A; // Violeta oscuro — Paredes

// --- CAPAS DE PROFUNDIDAD (Depth / Z-index en Phaser) ---
// Un número mayor se dibuja encima de uno menor.
export const DEPTH_FLOOR     = 0;   // Suelo del mapa
export const DEPTH_OBJECTS   = 10;  // Objetos y triggers
export const DEPTH_ENEMIES   = 20;  // Enemigos
export const DEPTH_PLAYER    = 30;  // Jugador (siempre encima de enemigos)
export const DEPTH_EFFECTS   = 40;  // Efectos visuales (explosiones, flashes)
export const DEPTH_UI        = 100; // HUD (siempre al frente)

// --- ESTADOS DEL JUGADOR ---
// Las posibles estados del personaje jugable.
// Se usan para controlar animaciones y lógica de movimiento.
export const PLAYER_STATE = {
  IDLE:     'idle',     // Quieto, sin moverse
  WALK:     'walk',     // Caminando
  RUN:      'run',      // Corriendo (tecla S)
  ATTACK:   'attack',   // Ejecutando ataque básico
  HIT:      'hit',      // Recibiendo daño (invulnerable brevemente)
  DEFEATED: 'defeated', // Sin vida — game over
};

// --- DIRECCIONES ---
// Se usan para saber hacia dónde mira el jugador y los enemigos.
export const DIRECTION = {
  UP:    'up',
  DOWN:  'down',
  LEFT:  'left',
  RIGHT: 'right',
};

// --- ESCENAS (nombres internos de Phaser) ---
// Centralizar los nombres evita errores de tipeo al llamar
// this.scene.start('WorldScene') vs this.scene.start('worldScene').
export const SCENE = {
  BOOT:      'BootScene',
  PRELOAD:   'PreloadScene',
  MENU:      'MenuScene',
  WORLD:     'WorldScene',
  UI:        'UIScene',
  DIALOGUE:  'DialogueScene',
  PAUSE:     'PauseScene',
  GAME_OVER: 'GameOverScene',
  VICTORY:   'VictoryScene',
};

// --- EVENTOS PERSONALIZADOS ---
// Eventos que se emiten entre escenas mediante el EventBus de Phaser.
export const EVENTS = {
  PLAYER_HP_CHANGED:     'player-hp-changed',
  PLAYER_ENERGY_CHANGED: 'player-energy-changed',
  PLAYER_XP_CHANGED:     'player-xp-changed',
  PLAYER_LEVEL_UP:       'player-level-up',
  ENEMY_DIED:            'enemy-died',
  QUEST_STARTED:         'quest-started',
  QUEST_UPDATED:         'quest-updated',
  QUEST_COMPLETED:       'quest-completed',
  DIALOGUE_START:        'dialogue-start',
  DIALOGUE_END:          'dialogue-end',
  BOSS_SPAWNED:          'boss-spawned',
  BOSS_HP_CHANGED:       'boss-hp-changed',
  BOSS_DIED:             'boss-died',
};

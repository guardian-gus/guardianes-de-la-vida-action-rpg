// ============================================================
// PauseScene.js
// Descripción: Menú de pausa del juego (Enter para abrir/cerrar).
//   Se lanza encima de WorldScene con scene.launch().
//   WorldScene se pausa mientras PauseScene está activa.
//
//   Contenido planeado (fase futura):
//   - Estadísticas del jugador
//   - Inventario
//   - Puntos de habilidad ganados
//   - Opciones
//   Inspirado en el menú de pausa de DBZ: Buu's Fury (GBA).
//
//   En Fase 1: solo un placeholder.
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import { SCENE, GAME_WIDTH, GAME_HEIGHT, DEPTH_UI } from '../config/constants.js';

class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.PAUSE });
  }

  create() {
    console.log('[PauseScene] Juego pausado.');

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Fondo semitransparente oscuro
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(DEPTH_UI);

    // Panel central
    this.add.rectangle(cx, cy, 160, 120, 0x1A0A2E, 0.95)
      .setScrollFactor(0).setDepth(DEPTH_UI);

    this.add.text(cx, cy - 45, 'PAUSA', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#9B59B6',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_UI);

    // Opciones del menú (placeholders)
    const options = ['📊 Estadísticas', '🎒 Inventario', '⚙️  Opciones', '↩  Continuar'];
    options.forEach((opt, i) => {
      this.add.text(cx, cy - 20 + i * 18, opt, {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: i === 3 ? '#9B59B6' : '#BDC3C7',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_UI);
    });

    this.add.text(cx, cy + 48, 'Enter para continuar', {
      fontFamily: 'monospace',
      fontSize: '5px',
      color: '#555555',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_UI);

    // NOTE: Las opciones de menú de pausa completas se implementan en una fase futura.
    // TODO: Implementar estadísticas de jugador (HP, EN, nivel, XP, ADN, fotones).
    // TODO: Implementar inventario.
    // TODO: Implementar puntos de habilidad (estilo DBZ Buu's Fury).

    // Enter para cerrar el menú de pausa
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
      .once('down', () => {
        this.scene.resume(SCENE.WORLD);
        this.scene.stop(SCENE.PAUSE);
      });

    // Escape también cierra el menú
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
      .once('down', () => {
        this.scene.resume(SCENE.WORLD);
        this.scene.stop(SCENE.PAUSE);
      });
  }
}

export default PauseScene;

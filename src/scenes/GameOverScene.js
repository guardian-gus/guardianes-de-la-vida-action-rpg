// ============================================================
// GameOverScene.js
// Descripción: Pantalla que aparece cuando el jugador pierde
//   toda su vida (HP llega a 0).
//
//   Opciones:
//   - Reintentar (volver a WorldScene con los mismos datos)
//   - Volver al menú principal
//
// Datos recibidos al iniciar:
//   - guardianId: string — guardián que estaba usando el jugador
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import { SCENE, GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.GAME_OVER });
  }

  init(data) {
    this._guardianId = data.guardianId || 'lynfa';
  }

  create() {
    console.log('[GameOverScene] Game Over.');

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Fondo oscuro
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0A0015);

    // Texto principal
    this.add.text(cx, cy - 40, 'FIN DE LA MISIÓN', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#E74C3C',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 20, 'El ganglio ha caído...', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#BDC3C7',
    }).setOrigin(0.5);

    // Botones
    const retryText = this.add.text(cx, cy + 10, '▶ REINTENTAR', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#9B59B6',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const menuText = this.add.text(cx, cy + 30, '↩ MENÚ PRINCIPAL', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#7F8C8D',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retryText.on('pointerdown', () => {
      this.scene.start(SCENE.WORLD, { guardianId: this._guardianId, isNewGame: true });
      this.scene.launch(SCENE.UI);
    });

    menuText.on('pointerdown', () => {
      this.scene.start(SCENE.MENU);
    });

    // Teclado: Enter para reintentar, Escape para menú
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
      .once('down', () => {
        this.scene.start(SCENE.WORLD, { guardianId: this._guardianId, isNewGame: true });
        this.scene.launch(SCENE.UI);
      });

    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
      .once('down', () => this.scene.start(SCENE.MENU));
  }
}

export default GameOverScene;

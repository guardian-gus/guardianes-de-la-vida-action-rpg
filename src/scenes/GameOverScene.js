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
import SaveSystem from '../systems/SaveSystem.js';

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
    this.add.text(cx, cy - 200, 'FIN DE LA MISIÓN', {
      fontFamily: 'monospace',
      fontSize: '100px',
      color: '#E74C3C',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 60, 'El ganglio ha caído...', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#BDC3C7',
    }).setOrigin(0.5);

    // Botones
    const retryText = this.add.text(cx, cy + 100, '▶ REINTENTAR', {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: '#9B59B6',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const menuText = this.add.text(cx, cy + 220, '↩ MENÚ PRINCIPAL', {
      fontFamily: 'monospace',
      fontSize: '64px',
      color: '#7F8C8D',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // Efectos Hover
    retryText.on('pointerover', () => retryText.setColor('#FFFFFF').setScale(1.1));
    retryText.on('pointerout', () => retryText.setColor('#9B59B6').setScale(1));
    menuText.on('pointerover', () => menuText.setColor('#FFFFFF').setScale(1.1));
    menuText.on('pointerout', () => menuText.setColor('#7F8C8D').setScale(1));

    retryText.on('pointerdown', () => {
      this._retryGame();
    });

    menuText.on('pointerdown', () => {
      this.scene.start(SCENE.MENU);
    });

    // Teclado: Enter para reintentar, Escape para menú
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
      .once('down', () => {
        this._retryGame();
      });

    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
      .once('down', () => this.scene.start(SCENE.MENU));
  }

  _retryGame() {
    const savedData = SaveSystem.load();
    if (savedData) {
      console.log('[GameOverScene] Cargando partida guardada...', savedData);
      this.scene.start(SCENE.WORLD, savedData);
    } else {
      console.log('[GameOverScene] No hay partida guardada, empezando de cero.');
      this.scene.start(SCENE.WORLD, { guardianId: this._guardianId, isNewGame: true });
    }
    this.scene.launch(SCENE.UI);
  }
}

export default GameOverScene;

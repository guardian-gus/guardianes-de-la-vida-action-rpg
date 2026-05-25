import Phaser from 'phaser';
import { SCENE, GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.VICTORY });
  }

  create() {
    console.log('[VictoryScene] Escena de victoria iniciada.');

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Fondo blanco con opacidad para desvanecerse
    this.cameras.main.fadeIn(2000, 255, 255, 255);

    // Texto de victoria
    this.add.text(cx, cy - 50, '¡GANGLIO PURIFICADO!', {
      fontFamily: 'monospace',
      fontSize: '80px',
      color: '#F1C40F',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 40, 'El Patógeno Alfa ha sido destruido.', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    // Botón para volver al menú
    const btn = this.add.text(cx, cy + 150, '▶ VOLVER AL MENÚ', {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#BDC3C7'
    }).setOrigin(0.5);

    btn.setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setStyle({ color: '#E8DAEF', fontSize: '48px' }));
    btn.on('pointerout', () => btn.setStyle({ color: '#BDC3C7', fontSize: '40px' }));
    btn.on('pointerdown', () => {
      this.scene.start(SCENE.MENU);
    });
  }
}

export default VictoryScene;

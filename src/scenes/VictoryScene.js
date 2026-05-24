// ============================================================
// VictoryScene.js
// Descripción: Pantalla de victoria que aparece al derrotar
//   al mini jefe (Patógeno Alfa) o completar la demo.
//
//   Muestra: mensaje de éxito, recompensas obtenidas, y opciones.
//   En Fase 6: se conecta al sistema de misiones para mostrar
//   las recompensas reales (XP, ADN, Fotones).
//
// Datos recibidos al iniciar:
//   - rewards: object — { xp, adn, fotones }
//   - guardianId: string
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import { SCENE, GAME_WIDTH, GAME_HEIGHT, COLOR_LYNFA } from '../config/constants.js';

class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.VICTORY });
  }

  init(data) {
    this._rewards    = data.rewards    || { xp: 50, adn: 5, fotones: 10 };
    this._guardianId = data.guardianId || 'lynfa';
  }

  create() {
    console.log('[VictoryScene] ¡Victoria!');

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Fondo (colores de victoria: violeta/dorado)
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0A0015);

    // Destellos decorativos (programáticos)
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(10, GAME_WIDTH - 10);
      const y = Phaser.Math.Between(10, GAME_HEIGHT - 10);
      this.add.star(x, y, 5, 2, 5, 0xF39C12, Phaser.Math.FloatBetween(0.3, 0.8));
    }

    // Título
    this.add.text(cx, cy - 55, '¡MISIÓN CUMPLIDA!', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#F39C12',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 38, 'El Ganglio Linfático ha sido purificado', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#D7BDE2',
    }).setOrigin(0.5);

    // Separador
    this.add.rectangle(cx, cy - 25, 150, 1, COLOR_LYNFA, 0.5);

    // Recompensas obtenidas
    this.add.text(cx, cy - 15, 'RECOMPENSAS', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#9B59B6',
    }).setOrigin(0.5);

    const rewardLines = [
      `+${this._rewards.xp} Experiencia`,
      `+${this._rewards.adn} ADN`,
      `+${this._rewards.fotones} Fotones`,
    ];

    rewardLines.forEach((line, i) => {
      this.add.text(cx, cy + i * 10, line, {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#F9E79F',
      }).setOrigin(0.5);
    });

    // Mensaje educativo breve
    this.add.text(cx, cy + 40, '"Los anticuerpos reconocen y neutralizan patógenos específicos."', {
      fontFamily: 'monospace',
      fontSize: '5px',
      color: '#7FB3D3',
      wordWrap: { width: GAME_WIDTH - 20 },
      align: 'center',
    }).setOrigin(0.5);

    // Botón de continuar
    const continueText = this.add.text(cx, cy + 60, '▶  CONTINUAR', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#9B59B6',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueText.on('pointerdown', () => this.scene.start(SCENE.MENU));

    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
      .once('down', () => this.scene.start(SCENE.MENU));
  }
}

export default VictoryScene;

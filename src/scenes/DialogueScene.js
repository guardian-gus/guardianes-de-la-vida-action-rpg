// ============================================================
// DialogueScene.js
// Descripción: Escena para mostrar diálogos de NPCs.
//   Se lanza encima de WorldScene con scene.launch().
//   Pausa el movimiento del jugador mientras hay diálogo activo.
//
//   En Fase 1: estructura base lista pero sin contenido.
//   En Fase 5: se implementa completamente con datos de dialogues.json.
//
// Datos recibidos al iniciar:
//   - dialogueId: string — ID del diálogo en dialogues.json
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import { SCENE, GAME_WIDTH, GAME_HEIGHT, DEPTH_UI, EVENTS } from '../config/constants.js';

class DialogueScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.DIALOGUE });

    this._dialogueData = null; // Datos del diálogo activo
    this._currentLine  = 0;   // Índice de la línea actual
    this._isTyping     = false; // ¿El texto se está escribiendo letra por letra?
  }

  /**
   * init(): Recibe el ID del diálogo a mostrar.
   * @param {Object} data - { dialogueId: string }
   */
  init(data) {
    this._dialogueId = data.dialogueId;
    this._currentLine = 0;
  }

  create() {
    console.log(`[DialogueScene] Iniciando diálogo: ${this._dialogueId}`);

    // TODO: Implementar en Fase 5:
    //   1. Cargar datos del diálogo desde this.cache.json.get('dialogues')
    //   2. Crear caja de diálogo visual (pixel art)
    //   3. Mostrar retrato del hablante
    //   4. Animar el texto letra por letra (typewriter effect)
    //   5. Al terminar, emitir onComplete (activar misión, etc.)

    // Placeholder: caja de diálogo básica
    this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT - 30,
      GAME_WIDTH - 10, 50,
      0x000000, 0.85
    ).setDepth(DEPTH_UI).setScrollFactor(0);

    this.add.text(10, GAME_HEIGHT - 52, 'Centinela Linfático', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#AED6F1',
    }).setDepth(DEPTH_UI).setScrollFactor(0);

    this.add.text(10, GAME_HEIGHT - 40, '¡Guardiana, al fin llegas! El ganglio\nestá detectando señales de infección.', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#ECF0F1',
    }).setDepth(DEPTH_UI).setScrollFactor(0);

    this.add.text(GAME_WIDTH - 25, GAME_HEIGHT - 8, '[D] continuar', {
      fontFamily: 'monospace',
      fontSize: '5px',
      color: '#7F8C8D',
    }).setDepth(DEPTH_UI).setScrollFactor(0);

    // Cerrar con D
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      .on('down', () => this.scene.stop(SCENE.DIALOGUE));

    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
      .on('down', () => this.scene.stop(SCENE.DIALOGUE));
  }
}

export default DialogueScene;

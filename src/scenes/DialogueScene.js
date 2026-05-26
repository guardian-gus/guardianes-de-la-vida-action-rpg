// ============================================================
// DialogueScene.js
// Descripción: Escena para mostrar diálogos de NPCs interactivos.
//   Soporta condicionales y ramas de diálogo.
//
// Fecha: 2026-05-24 | Versión: 2.0.0
// ============================================================

import Phaser from 'phaser';
import { SCENE, GAME_WIDTH, GAME_HEIGHT, DEPTH_UI } from '../config/constants.js';

class DialogueScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.DIALOGUE });
    this._dialogueId = null;
    this._currentNodeId = null;
    this._selectedChoiceIndex = 0;
  }

  init(data) {
    this._dialogueId = data.dialogueId || '0001';
    this._currentNodeId = 'start';
    this._selectedChoiceIndex = 0;
  }

  create() {
    console.log(`[DialogueScene] Iniciando diálogo: ${this._dialogueId}`);

    // Fondo oscuro
    this.add.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT - 180,
      GAME_WIDTH - 80, 320,
      0x0F0B1A, 0.95
    ).setDepth(DEPTH_UI).setScrollFactor(0).setStrokeStyle(4, 0x9B59B6);

    // Inicializar objetos de texto reusables (OPT-05)
    this._nameText = this.add.text(60, GAME_HEIGHT - 310, '', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#AED6F1',
      fontStyle: 'bold'
    }).setDepth(DEPTH_UI);

    this._mainText = this.add.text(60, GAME_HEIGHT - 270, '', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ECF0F1',
      wordWrap: { width: GAME_WIDTH - 120 }
    }).setDepth(DEPTH_UI);

    this._continueText = this.add.text(GAME_WIDTH - 60, GAME_HEIGHT - 40, '[W] o [Enter] para continuar', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#7F8C8D',
    }).setOrigin(1, 1).setDepth(DEPTH_UI);

    // Crear un pool de 4 textos de opciones
    this._choiceTexts = [];
    for (let i = 0; i < 4; i++) {
      const txt = this.add.text(80, 0, '', {
        fontFamily: 'monospace',
        fontSize: '22px',
      }).setDepth(DEPTH_UI);
      txt.setVisible(false);
      this._choiceTexts.push(txt);
    }

    // Controles de teclado mediante eventos directos de la escena
    this.input.keyboard.on('keydown-UP', () => this._changeSelection(-1));
    this.input.keyboard.on('keydown-DOWN', () => this._changeSelection(1));
    this.input.keyboard.on('keydown-W', () => this._handleAction());
    this.input.keyboard.on('keydown-ENTER', () => this._handleAction());

    this._renderNode();
  }

  _renderNode() {
    const dialoguesDB = this.cache.json.get('dialogues');
    const dialogueData = dialoguesDB ? dialoguesDB[this._dialogueId] : null;

    if (!dialogueData || !dialogueData[this._currentNodeId]) {
      this._closeDialogue();
      return;
    }

    const node = dialogueData[this._currentNodeId];

    // Actualizar nombre y texto principal
    this._nameText.setText(node.speaker);
    this._mainText.setText(node.text);

    // Ocultar todas las opciones e indicador de continuar
    this._choiceTexts.forEach(txt => txt.setVisible(false));
    this._continueText.setVisible(false);

    // Renderizar opciones si hay, de lo contrario mensaje para avanzar
    if (node.choices && node.choices.length > 0) {
      // Posicionar opciones dinámicamente debajo del texto principal
      const choicesStartY = this._mainText.y + this._mainText.height + 24;

      node.choices.forEach((choice, index) => {
        if (index < this._choiceTexts.length) {
          const txt = this._choiceTexts[index];
          const isSelected = index === this._selectedChoiceIndex;
          const prefix = isSelected ? '▶ ' : '  ';
          const color = isSelected ? '#F39C12' : '#BDC3C7';
          
          txt.setPosition(80, choicesStartY + (index * 36));
          txt.setText(prefix + choice.label);
          txt.setColor(color);
          txt.setVisible(true);
        }
      });
    } else {
      this._continueText.setVisible(true);
    }
  }

  _changeSelection(dir) {
    const dialoguesDB = this.cache.json.get('dialogues');
    if (!dialoguesDB) return;
    const dialogueData = dialoguesDB[this._dialogueId];
    if (!dialogueData) return;
    const node = dialogueData[this._currentNodeId];
    if (!node || !node.choices || node.choices.length === 0) return;

    this._selectedChoiceIndex += dir;
    if (this._selectedChoiceIndex < 0) {
      this._selectedChoiceIndex = node.choices.length - 1;
    } else if (this._selectedChoiceIndex >= node.choices.length) {
      this._selectedChoiceIndex = 0;
    }

    this._renderNode();
  }

  _handleAction() {
    const dialoguesDB = this.cache.json.get('dialogues');
    if (!dialoguesDB) {
      this._closeDialogue();
      return;
    }
    const dialogueData = dialoguesDB[this._dialogueId];
    if (!dialogueData) {
      this._closeDialogue();
      return;
    }
    const node = dialogueData[this._currentNodeId];
    if (!node) {
      this._closeDialogue();
      return;
    }

    if (node.choices && node.choices.length > 0) {
      // Avanzar a la rama seleccionada
      const selectedChoice = node.choices[this._selectedChoiceIndex];
      this._currentNodeId = selectedChoice.nextNode;
      this._selectedChoiceIndex = 0; // Resetear índice para el nuevo nodo
      this._renderNode();
    } else {
      // Procesar acciones adjuntas al nodo (ej. startQuest, checkQuest)
      if (node.action) {
        const worldScene = this.scene.get(SCENE.WORLD);
        if (worldScene && worldScene._questSystem) {
          if (node.action.type === 'startQuest') {
            worldScene._questSystem.startQuest(node.action.questId);
            this._closeDialogue();
          } else if (node.action.type === 'checkQuest') {
            const quest = worldScene._questSystem.getActiveQuest();
            if (quest && quest.id === node.action.questId) {
              const allComplete = quest.objectives.every(obj => obj.current >= obj.count);
              this._currentNodeId = allComplete ? 'truth_confirmed' : 'lie_detected';
              this._selectedChoiceIndex = 0;
              this._renderNode();
            }
          } else if (node.action.type === 'completeQuest') {
            worldScene._questSystem.forceCompleteQuest();
            this._closeDialogue();
          }
        }
      } else {
        // Terminar el diálogo
        this._closeDialogue();
      }
    }
  }

  _closeDialogue() {
    console.log('[DialogueScene] Diálogo terminado.');
    this.scene.resume(SCENE.WORLD);
    this.scene.stop(SCENE.DIALOGUE);
  }
}

export default DialogueScene;

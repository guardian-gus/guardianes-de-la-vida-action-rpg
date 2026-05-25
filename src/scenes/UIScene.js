// ============================================================
// UIScene.js
// Descripción: El HUD (Heads-Up Display) del juego.
//   Esta escena corre en PARALELO a WorldScene, superpuesta encima.
//   Muestra información vital: vida, energía, nivel, misión activa.
//
//   Corre simultáneamente con WorldScene usando scene.launch().
//   setScrollFactor(0) hace que todos los elementos estén fijos en pantalla.
//
// Comunicación con WorldScene:
//   WorldScene emite eventos → UIScene los escucha y actualiza el HUD.
//   Ejemplo: WorldScene emite 'player-hp-changed' → UIScene actualiza la barra.
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import {
  SCENE,
  GAME_WIDTH,
  GAME_HEIGHT,
  COLOR_HP_BAR,
  COLOR_EN_BAR,
  COLOR_XP_BAR,
  DEPTH_UI,
  EVENTS,
} from '../config/constants.js';

// --- DIMENSIONES DEL HUD ---
const HUD_PADDING    = 24;  // Margen interior del HUD (6 * 4)
const HUD_BAR_WIDTH  = 240; // Ancho de las barras de vida/energía (60 * 4)
const HUD_BAR_HEIGHT = 20;  // Alto de las barras (5 * 4)

class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.UI });

    // Referencias a los elementos visuales del HUD
    this._hpBar     = null; // Barra de vida (relleno)
    this._energyBar = null; // Barra de energía (relleno)
    this._xpBar     = null; // Barra de XP (relleno)
    this._hpText    = null; // Texto "HP: 100/120"
    this._levelText = null; // Texto "Nv. 1"
    this._questText = null; // Texto de misión activa

    // Elementos del Jefe (ocultos por defecto)
    this._bossContainer = null;
    this._bossHpBar = null;
    this._bossHpFill = null;
    this._bossNameText = null;

    // Valores actuales del jugador
    this._hp       = 120;
    this._maxHp    = 120;
    this._energy   = 80;
    this._maxEnergy = 80;
    this._xp       = 0;
    this._level    = 1;
  }

  /**
   * create(): Construye el HUD y configura la escucha de eventos.
   */
  create() {
    console.log('[UIScene] HUD iniciado.');

    // Obtener referencia a WorldScene para escuchar sus eventos.
    // Phaser permite acceder a otras escenas activas así.
    const worldScene = this.scene.get(SCENE.WORLD);

    // --- Construir el HUD ---
    this._createHUDBackground();
    this._createStatBars();
    this._createQuestDisplay();
    this._createBossUI(); // Barra de jefe oculta
    this._showInstructions();

    // --- Escuchar eventos de WorldScene ---
    // Cuando WorldScene cambia HP, energía o XP del jugador,
    // emite un evento que UIScene recibe aquí para actualizar las barras.
    worldScene.events.on(EVENTS.PLAYER_HP_CHANGED, (data) => {
      this._hp    = data.current;
      this._maxHp = data.max;
      this._updateHPBar();
    });

    worldScene.events.on(EVENTS.PLAYER_ENERGY_CHANGED, (data) => {
      this._energy    = data.current;
      this._maxEnergy = data.max;
      this._updateEnergyBar();
    });

    worldScene.events.on(EVENTS.PLAYER_XP_CHANGED, (data) => {
      this._xp    = data.current;
      this._level = data.level;
      this._updateXPBar();
    });

    worldScene.events.on(EVENTS.QUEST_STARTED, (data) => {
      this._updateQuestDisplay(data);
    });

    worldScene.events.on(EVENTS.QUEST_UPDATED, (data) => {
      this._updateQuestDisplay(data);
    });

    worldScene.events.on(EVENTS.QUEST_COMPLETED, (data) => {
      this._questText.setText('¡Misión completada! Vuelve con el Centinela.');
      this._questText.setColor('#F39C12'); // Dorado
    });

    worldScene.events.on(EVENTS.BOSS_SPAWNED, (data) => {
      this._showBossUI(data);
    });

    worldScene.events.on(EVENTS.BOSS_HP_CHANGED, (data) => {
      this._updateBossUI(data);
    });

    worldScene.events.on(EVENTS.BOSS_DIED, () => {
      this._hideBossUI();
    });

    // Limpiar eventos al apagar la escena (buena práctica para evitar memory leaks)
    this.events.on('shutdown', () => {
      worldScene.events.off(EVENTS.PLAYER_HP_CHANGED);
      worldScene.events.off(EVENTS.PLAYER_ENERGY_CHANGED);
      worldScene.events.off(EVENTS.PLAYER_XP_CHANGED);
      worldScene.events.off(EVENTS.QUEST_STARTED);
      worldScene.events.off(EVENTS.QUEST_UPDATED);
      worldScene.events.off(EVENTS.QUEST_COMPLETED);
      worldScene.events.off(EVENTS.BOSS_SPAWNED);
      worldScene.events.off(EVENTS.BOSS_HP_CHANGED);
      worldScene.events.off(EVENTS.BOSS_DIED);
    });
  }

  // ============================================================
  // MÉTODOS PRIVADOS: CONSTRUCCIÓN DEL HUD
  // ============================================================

  /**
   * Crea el fondo semitransparente del HUD en la esquina superior izquierda.
   */
  _createHUDBackground() {
    // Fondo del panel de stats
    this.add.rectangle(
      HUD_PADDING + 152,
      HUD_PADDING + 120,
      320, 240,
      0x000000, 0.6
    ).setDepth(DEPTH_UI).setScrollFactor(0);

    // Nombre del guardián actual
    this.add.text(HUD_PADDING + 8, HUD_PADDING + 8, 'LYNFA', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#D7BDE2',
    }).setDepth(DEPTH_UI).setScrollFactor(0);
  }

  /**
   * Crea las barras de vida, energía y XP con sus etiquetas.
   */
  _createStatBars() {
    const x  = HUD_PADDING + 8;
    const barX = x + 56; // Offset para dejar espacio a la etiqueta

    // ===== BARRA DE VIDA =====
    const hpY = HUD_PADDING + 52;

    // Etiqueta
    this.add.text(x, hpY, 'HP', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#E74C3C',
    }).setDepth(DEPTH_UI).setScrollFactor(0);

    // Fondo de la barra (vacía)
    this.add.rectangle(
      barX + HUD_BAR_WIDTH / 2, hpY + 8,
      HUD_BAR_WIDTH, HUD_BAR_HEIGHT,
      0x333333
    ).setDepth(DEPTH_UI).setScrollFactor(0);

    // Relleno de la barra (se actualiza dinámicamente)
    this._hpBar = this.add.rectangle(
      barX, hpY + 8,
      HUD_BAR_WIDTH, HUD_BAR_HEIGHT,
      COLOR_HP_BAR
    ).setOrigin(0, 0.5).setDepth(DEPTH_UI).setScrollFactor(0);

    // Texto HP numérico
    this._hpText = this.add.text(barX + HUD_BAR_WIDTH + 8, hpY - 4, `${this._hp}`, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#E8A5A5',
    }).setDepth(DEPTH_UI).setScrollFactor(0);

    // ===== BARRA DE ENERGÍA =====
    const enY = hpY + 40;

    this.add.text(x, enY, 'EN', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#3498DB',
    }).setDepth(DEPTH_UI).setScrollFactor(0);

    this.add.rectangle(
      barX + HUD_BAR_WIDTH / 2, enY + 8,
      HUD_BAR_WIDTH, HUD_BAR_HEIGHT,
      0x333333
    ).setDepth(DEPTH_UI).setScrollFactor(0);

    this._energyBar = this.add.rectangle(
      barX, enY + 8,
      HUD_BAR_WIDTH, HUD_BAR_HEIGHT,
      COLOR_EN_BAR
    ).setOrigin(0, 0.5).setDepth(DEPTH_UI).setScrollFactor(0);

    // ===== NIVEL Y XP =====
    const lvY = enY + 40;

    this._levelText = this.add.text(x, lvY, 'Nv. 1', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#F39C12',
    }).setDepth(DEPTH_UI).setScrollFactor(0);

    // Barra de XP (más delgada, debajo del nivel)
    const xpY = lvY + 32;

    this.add.rectangle(
      x + HUD_BAR_WIDTH / 2, xpY,
      HUD_BAR_WIDTH, 12,
      0x333333
    ).setDepth(DEPTH_UI).setScrollFactor(0);

    this._xpBar = this.add.rectangle(
      x, xpY,
      0, 12, // Empieza vacía
      COLOR_XP_BAR
    ).setOrigin(0, 0.5).setDepth(DEPTH_UI).setScrollFactor(0);
  }

  /**
   * Crea el panel de misión activa en la parte inferior de la pantalla.
   */
  _createQuestDisplay() {
    const y = GAME_HEIGHT - 56;

    // Fondo del panel de misión
    this.add.rectangle(
      GAME_WIDTH / 2, y + 8,
      880, 56,
      0x000000, 0.5
    ).setDepth(DEPTH_UI).setScrollFactor(0);

    // Etiqueta "MISIÓN:"
    this.add.text(20, y - 12, 'MISIÓN:', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#9B59B6',
    }).setDepth(DEPTH_UI).setScrollFactor(0);

    // Texto de la misión activa
    this._questText = this.add.text(160, y - 12, 'Habla con el Centinela Linfático', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#BDC3C7',
    }).setDepth(DEPTH_UI).setScrollFactor(0);
  }

  /**
   * Crea la estructura de la barra de vida del jefe. (Se mantiene oculta hasta BOSS_SPAWNED).
   */
  _createBossUI() {
    this._bossContainer = this.add.container(GAME_WIDTH / 2, 80).setDepth(DEPTH_UI).setScrollFactor(0);
    this._bossContainer.setVisible(false);

    const barWidth = 800;
    const barHeight = 24;

    // Fondo (borde)
    const bg = this.add.rectangle(0, 0, barWidth + 8, barHeight + 8, 0x333333);
    
    // Fondo de la barra (vacía)
    this._bossHpBar = this.add.rectangle(0, 0, barWidth, barHeight, 0x111111);

    // Relleno de la barra
    this._bossHpFill = this.add.rectangle(-barWidth / 2, 0, barWidth, barHeight, 0xE67E22).setOrigin(0, 0.5);

    // Texto nombre
    this._bossNameText = this.add.text(0, -32, 'BOSS NAME', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#E8A5A5',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this._bossContainer.add([bg, this._bossHpBar, this._bossHpFill, this._bossNameText]);
  }

  /**
   * Instrucciones de controles temporales.
   * Se eliminan cuando el sistema de diálogo esté listo.
   */
  _showInstructions() {
    const lines = [
      'CONTROLES',
      '──────────────',
      '← → ↑ ↓  Mover',
      'S          Correr',
      'A          Atacar',
      'D          Habilidad (F4)',
      'W          Interactuar',
      'Enter      Pausa/Reanudar',
    ];

    this.add.rectangle(248, 352, 480, 288, 0x000000, 0.65)
      .setScrollFactor(0)
      .setDepth(DEPTH_UI - 1);

    lines.forEach((line, i) => {
      const color = i === 0 ? '#9B59B6' : '#BDC3C7';
      this.add.text(32, 232 + i * 36, line, {
        fontFamily: 'monospace',
        fontSize:   '20px',
        color,
      }).setScrollFactor(0).setDepth(DEPTH_UI);
    });
  }

  // ============================================================
  // MÉTODOS PRIVADOS: ACTUALIZACIÓN DEL HUD
  // ============================================================

  /**
   * Actualiza la barra de vida según los valores actuales de HP.
   */
  _updateHPBar() {
    const ratio = Math.max(0, this._hp / this._maxHp);
    this._hpBar.width = HUD_BAR_WIDTH * ratio;
    this._hpText.setText(`${this._hp}`);

    // Cambiar color según el HP restante (verde → amarillo → rojo)
    if (ratio > 0.5) {
      this._hpBar.setFillStyle(COLOR_HP_BAR);
    } else if (ratio > 0.25) {
      this._hpBar.setFillStyle(0xF39C12); // Naranja: peligro
    } else {
      this._hpBar.setFillStyle(0xFF0000); // Rojo puro: crítico
    }
  }

  /**
   * Actualiza la barra de energía.
   */
  _updateEnergyBar() {
    const ratio = Math.max(0, this._energy / this._maxEnergy);
    this._energyBar.width = HUD_BAR_WIDTH * ratio;
  }

  /**
   * Actualiza la barra de XP y el texto de nivel.
   */
  _updateXPBar() {
    // XP necesario para el siguiente nivel: nivel * 100 (fórmula simple)
    const xpNeeded = this._level * 100;
    const ratio    = Math.min(1, this._xp / xpNeeded);

    this._xpBar.width = (HUD_PADDING + 8 + 240) * ratio; // 240 = ancho de la barra XP
    this._levelText.setText(`Nv. ${this._level}`);
  }

  /**
   * Actualiza el texto de la misión activa.
   * @param {Object} questData - Datos de la misión completa
   */
  _updateQuestDisplay(questData) {
    if (!questData) return;

    this._questText.setColor('#BDC3C7'); // Restaurar color base
    
    // Buscar el primer objetivo que NO esté completado
    const currentObjective = questData.objectives.find(obj => obj.current < obj.count);

    if (currentObjective) {
      this._questText.setText(`${questData.title} | ${currentObjective.label} (${currentObjective.current}/${currentObjective.count})`);
    } else {
      this._questText.setText(`${questData.title} | ¡Completada!`);
    }
  }

  // ============================================================
  // MÉTODOS PRIVADOS: ACTUALIZACIÓN JEFE
  // ============================================================

  _showBossUI(data) {
    this._bossNameText.setText(data.name);
    this._bossHpFill.width = 800; // Asume empieza en maxHp
    this._bossContainer.setVisible(true);
    
    // Animación de entrada dramática
    this._bossContainer.y = -100;
    this.tweens.add({
      targets: this._bossContainer,
      y: 80,
      duration: 1500,
      ease: 'Bounce.easeOut'
    });
  }

  _updateBossUI(data) {
    const ratio = Math.max(0, data.current / data.max);
    // Animar la reducción de la barra
    this.tweens.add({
      targets: this._bossHpFill,
      width: 800 * ratio,
      duration: 200,
      ease: 'Sine.easeOut'
    });

    if (ratio < 0.33) {
      this._bossHpFill.setFillStyle(0xC0392B); // Fase 3 roja
    }
  }

  _hideBossUI() {
    this.tweens.add({
      targets: this._bossContainer,
      alpha: 0,
      y: -100,
      duration: 2000,
      onComplete: () => {
        this._bossContainer.setVisible(false);
      }
    });
  }
}

export default UIScene;

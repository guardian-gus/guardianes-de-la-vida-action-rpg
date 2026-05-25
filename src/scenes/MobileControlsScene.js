// ============================================================
// MobileControlsScene.js
// Descripción: Escena superpuesta que muestra controles táctiles:
//   - Joystick virtual (izquierda) para movimiento en 8 direcciones.
//   - 4 botones de acción (derecha): Ataque, Correr, Habilidad,
//     Interactuar.
//   - Botón de pausa (arriba derecha).
//
// Esta escena se lanza en paralelo a WorldScene usando
//   this.scene.launch(SCENE.MOBILE_CONTROLS)
// Solo se muestra si el dispositivo es táctil o la pantalla
// es más angosta que MOBILE_BREAKPOINT px.
//
// Comunicación con WorldScene: emite eventos Phaser a través
// del bus de eventos de la escena hermana para que WorldScene
// procese el input táctil igual que el teclado.
//
// Fase 9 | Fecha: 2026-05-25 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import { SCENE, GAME_WIDTH, GAME_HEIGHT, DEPTH_UI, EVENTS } from '../config/constants.js';

// --- CONFIGURACIÓN VISUAL DEL HUD TÁCTIL ---

// Ancho máximo de pantalla para activar controles móviles automáticamente.
// En escritorio con pantalla grande no aparecen salvo que el usuario toque.
const MOBILE_BREAKPOINT = 1024;

// Radio del joystick (el thumb y la base)
const JOYSTICK_BASE_RADIUS  = 70;  // Radio del aro exterior fijo
const JOYSTICK_THUMB_RADIUS = 32;  // Radio del disco interior móvil
const JOYSTICK_DEAD_ZONE    = 12;  // Píxeles mínimos de desplazamiento para registrar input

// Centro del joystick en coordenadas del canvas lógico (esquina inferior izquierda)
const JOYSTICK_X = 170;
const JOYSTICK_Y = GAME_HEIGHT - 160;

// Tamaño y posición del grupo de botones de acción (esquina inferior derecha)
const BTN_SIZE   = 80;   // Diámetro de cada botón
const BTN_GAP    = 12;   // Espacio entre botones
// Posición del botón central del grupo (en layout diamante)
const BTNS_CENTER_X = GAME_WIDTH  - 200;
const BTNS_CENTER_Y = GAME_HEIGHT - 180;

// Opacidad base de los controles en reposo
const ALPHA_IDLE   = 0.55;
const ALPHA_ACTIVE = 0.9;

// Colores de los botones
const COLOR_ATTACK   = 0xE74C3C; // Rojo    — Ataque (A)
const COLOR_RUN      = 0xF39C12; // Naranja — Correr (S)
const COLOR_SKILL    = 0x3498DB; // Azul    — Habilidad (D)
const COLOR_INTERACT = 0x2ECC71; // Verde   — Interactuar (W)
const COLOR_PAUSE    = 0x7F8C8D; // Gris    — Pausa
const COLOR_JOYSTICK_BASE  = 0x2C3E50;
const COLOR_JOYSTICK_THUMB = 0x9B59B6;

// Eventos internos que MobileControlsScene emite hacia WorldScene
export const MOBILE_EVENTS = {
  JOYSTICK_MOVE:    'mobile-joystick-move',    // { vx, vy } normalizados [-1, 1]
  JOYSTICK_STOP:    'mobile-joystick-stop',
  BTN_ATTACK_DOWN:  'mobile-btn-attack-down',
  BTN_ATTACK_UP:    'mobile-btn-attack-up',
  BTN_RUN_DOWN:     'mobile-btn-run-down',
  BTN_RUN_UP:       'mobile-btn-run-up',
  BTN_SKILL_DOWN:   'mobile-btn-skill-down',
  BTN_SKILL_UP:     'mobile-btn-skill-up',
  BTN_INTERACT_DOWN:'mobile-btn-interact-down',
  BTN_INTERACT_UP:  'mobile-btn-interact-up',
  BTN_PAUSE_DOWN:   'mobile-btn-pause-down',
};

class MobileControlsScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.MOBILE_CONTROLS });

    // --- Estado del joystick ---
    // Posición inicial del toque (para calcular delta)
    this._joystickPointerDown = false;
    this._joystickStartX = 0;
    this._joystickStartY = 0;
    // Desplazamiento actual del thumb (píxeles)
    this._joystickDeltaX = 0;
    this._joystickDeltaY = 0;
    // ID del puntero que controla el joystick (para multi-touch)
    this._joystickPointerId = null;

    // --- Estado de los botones (para feedback visual) ---
    this._runHeld = false;
  }

  // ============================================================
  // CICLO DE PHASER
  // ============================================================

  create() {
    // Verificar si debemos mostrar los controles
    const isTouchDevice = this.sys.game.device.input.touch;
    const isSmallScreen  = window.innerWidth < MOBILE_BREAKPOINT;

    if (!isTouchDevice && !isSmallScreen) {
      // Escritorio con pantalla grande: ocultar pero no destruir
      // (el usuario puede girar/redimensionar)
      this._controlsVisible = false;
    } else {
      this._controlsVisible = true;
    }

    // Capas del HUD táctil (siempre se crean; solo se muestran según el flag)
    this._buildJoystick();
    this._buildActionButtons();
    this._buildPauseButton();

    // Aplicar visibilidad inicial
    this._setVisible(this._controlsVisible);

    // Registrar listeners de input táctil/puntero
    this._registerPointerEvents();

    // Escuchar resize para mostrar/ocultar dinámicamente
    this.scale.on('resize', this._onResize, this);

    console.log(`[MobileControlsScene] Controles táctiles activos: ${this._controlsVisible}`);
  }

  // ============================================================
  // CONSTRUCCIÓN VISUAL
  // ============================================================

  /**
   * Dibuja la base fija y el thumb del joystick.
   * El thumb se mueve en update(); aquí solo se inicializa en el centro.
   */
  _buildJoystick() {
    // Base exterior (aro difuminado)
    this._joystickBase = this.add.graphics();
    this._joystickBase
      .fillStyle(COLOR_JOYSTICK_BASE, 0.6)
      .fillCircle(JOYSTICK_X, JOYSTICK_Y, JOYSTICK_BASE_RADIUS)
      .lineStyle(3, 0x95A5A6, 0.8)
      .strokeCircle(JOYSTICK_X, JOYSTICK_Y, JOYSTICK_BASE_RADIUS)
      .setDepth(DEPTH_UI)
      .setAlpha(ALPHA_IDLE)
      .setScrollFactor(0);

    // Thumb (disco que se mueve)
    this._joystickThumb = this.add.graphics();
    this._drawThumb(JOYSTICK_X, JOYSTICK_Y);
    this._joystickThumb
      .setDepth(DEPTH_UI + 1)
      .setAlpha(ALPHA_IDLE)
      .setScrollFactor(0);

    // Zona de toque activa (invisible, cubre un área generosa alrededor del joystick)
    // Se usa un rectángulo táctil en lugar de depender solo del aro para mejor UX.
    this._joystickZone = this.add.zone(
      JOYSTICK_X, JOYSTICK_Y,
      JOYSTICK_BASE_RADIUS * 2 + 40,
      JOYSTICK_BASE_RADIUS * 2 + 40
    )
      .setInteractive()
      .setDepth(DEPTH_UI - 1)
      .setScrollFactor(0);
  }

  /**
   * Redibuja el thumb del joystick en (x, y) con gradiente radial.
   */
  _drawThumb(x, y) {
    this._joystickThumb.clear();
    // Sombra suave
    this._joystickThumb.fillStyle(0x000000, 0.25)
      .fillCircle(x + 3, y + 4, JOYSTICK_THUMB_RADIUS);
    // Relleno principal
    this._joystickThumb.fillStyle(COLOR_JOYSTICK_THUMB, 1)
      .fillCircle(x, y, JOYSTICK_THUMB_RADIUS);
    // Brillo
    this._joystickThumb.fillStyle(0xFFFFFF, 0.3)
      .fillCircle(x - 6, y - 7, JOYSTICK_THUMB_RADIUS * 0.4);
  }

  /**
   * Construye los 4 botones de acción en layout diamante:
   *
   *        [W - Interact]
   *   [A - Attack] [D - Skill]
   *        [S - Run]
   */
  _buildActionButtons() {
    const cx = BTNS_CENTER_X;
    const cy = BTNS_CENTER_Y;
    const step = BTN_SIZE + BTN_GAP;

    // Posiciones en layout diamante
    const btnDefs = [
      {
        id: 'interact', label: 'W', color: COLOR_INTERACT,
        x: cx, y: cy - step,
        downEvent: MOBILE_EVENTS.BTN_INTERACT_DOWN,
        upEvent:   MOBILE_EVENTS.BTN_INTERACT_UP,
      },
      {
        id: 'attack', label: 'A', color: COLOR_ATTACK,
        x: cx - step, y: cy,
        downEvent: MOBILE_EVENTS.BTN_ATTACK_DOWN,
        upEvent:   MOBILE_EVENTS.BTN_ATTACK_UP,
      },
      {
        id: 'skill', label: 'D', color: COLOR_SKILL,
        x: cx + step, y: cy,
        downEvent: MOBILE_EVENTS.BTN_SKILL_DOWN,
        upEvent:   MOBILE_EVENTS.BTN_SKILL_UP,
      },
      {
        id: 'run', label: 'S', color: COLOR_RUN,
        x: cx, y: cy + step,
        downEvent: MOBILE_EVENTS.BTN_RUN_DOWN,
        upEvent:   MOBILE_EVENTS.BTN_RUN_UP,
      },
    ];

    this._actionButtons = [];

    for (const def of btnDefs) {
      const btn = this._createActionButton(def);
      this._actionButtons.push(btn);
    }
  }

  /**
   * Crea un botón individual de acción circular con feedback visual.
   * @param {Object} def - { id, label, color, x, y, downEvent, upEvent }
   * @returns {Object} Referencia al grupo gráfico del botón.
   */
  _createActionButton(def) {
    const r = BTN_SIZE / 2;

    // Gráfico del botón
    const gfx = this.add.graphics()
      .setDepth(DEPTH_UI)
      .setAlpha(ALPHA_IDLE)
      .setScrollFactor(0);

    this._drawButton(gfx, def.x, def.y, r, def.color, false);

    // Etiqueta de texto
    const label = this.add.text(def.x, def.y, def.label, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize:   `${r * 0.7}px`,
      color:      '#FFFFFF',
      stroke:     '#000000',
      strokeThickness: 4,
    })
      .setOrigin(0.5)
      .setDepth(DEPTH_UI + 1)
      .setScrollFactor(0);

    // Zona interactiva
    const zone = this.add.zone(def.x, def.y, BTN_SIZE + 10, BTN_SIZE + 10)
      .setInteractive()
      .setDepth(DEPTH_UI - 1)
      .setScrollFactor(0);

    zone.on('pointerdown', () => {
      this._drawButton(gfx, def.x, def.y, r, def.color, true);
      gfx.setAlpha(ALPHA_ACTIVE);
      label.setScale(0.9);
      // Emitir el evento hacia WorldScene y demás escenas activas
      this._emitToWorld(def.downEvent);

      // El botón de Run se mantiene hasta pointerup
      if (def.id === 'run') this._runHeld = true;
    });

    zone.on('pointerup', () => {
      this._drawButton(gfx, def.x, def.y, r, def.color, false);
      gfx.setAlpha(ALPHA_IDLE);
      label.setScale(1);
      this._emitToWorld(def.upEvent);

      if (def.id === 'run') this._runHeld = false;
    });

    zone.on('pointerout', () => {
      this._drawButton(gfx, def.x, def.y, r, def.color, false);
      gfx.setAlpha(ALPHA_IDLE);
      label.setScale(1);
      this._emitToWorld(def.upEvent);

      if (def.id === 'run') this._runHeld = false;
    });

    return { gfx, label, zone, def };
  }

  /**
   * Dibuja el gráfico de un botón circular.
   * @param {Phaser.GameObjects.Graphics} gfx
   * @param {number} x
   * @param {number} y
   * @param {number} r       - Radio del botón
   * @param {number} color   - Color principal (hex)
   * @param {boolean} pressed
   */
  _drawButton(gfx, x, y, r, color, pressed) {
    gfx.clear();

    // Sombra
    gfx.fillStyle(0x000000, pressed ? 0.1 : 0.3);
    gfx.fillCircle(x + (pressed ? 1 : 4), y + (pressed ? 2 : 6), r);

    // Fondo del botón (más oscuro al presionar)
    const fillColor = pressed
      ? Phaser.Display.Color.ValueToColor(color).darken(20).color
      : color;
    gfx.fillStyle(fillColor, 1);
    gfx.fillCircle(x, y, r);

    // Borde
    gfx.lineStyle(3, 0xFFFFFF, 0.3);
    gfx.strokeCircle(x, y, r);

    // Brillo superior (se aplana al presionar)
    if (!pressed) {
      gfx.fillStyle(0xFFFFFF, 0.18);
      gfx.fillCircle(x - r * 0.25, y - r * 0.3, r * 0.45);
    }
  }

  /**
   * Construye el botón de pausa en la esquina superior derecha.
   */
  _buildPauseButton() {
    const px = GAME_WIDTH - 80;
    const py = 80;
    const r  = 36;

    this._pauseGfx = this.add.graphics()
      .setDepth(DEPTH_UI)
      .setAlpha(ALPHA_IDLE)
      .setScrollFactor(0);

    this._drawButton(this._pauseGfx, px, py, r, COLOR_PAUSE, false);

    this._pauseLabel = this.add.text(px, py, '⏸', {
      fontSize: '28px',
      color:    '#FFFFFF',
    })
      .setOrigin(0.5)
      .setDepth(DEPTH_UI + 1)
      .setScrollFactor(0);

    const zone = this.add.zone(px, py, r * 2 + 10, r * 2 + 10)
      .setInteractive()
      .setDepth(DEPTH_UI - 1)
      .setScrollFactor(0);

    zone.on('pointerdown', () => {
      this._drawButton(this._pauseGfx, px, py, r, COLOR_PAUSE, true);
      this._emitToWorld(MOBILE_EVENTS.BTN_PAUSE_DOWN);
    });

    zone.on('pointerup', () => {
      this._drawButton(this._pauseGfx, px, py, r, COLOR_PAUSE, false);
    });

    this._pauseButton = { gfx: this._pauseGfx, label: this._pauseLabel, zone };
  }

  // ============================================================
  // INPUT TÁCTIL DEL JOYSTICK
  // ============================================================

  /**
   * Registra los eventos de puntero para el joystick.
   * Usamos this.input (global) para capturar movimiento fuera de la zona base.
   */
  _registerPointerEvents() {
    // pointerdown dentro de la zona del joystick
    this._joystickZone.on('pointerdown', (pointer) => {
      if (this._joystickPointerId !== null) return; // solo 1 puntero para el joystick
      this._joystickPointerId = pointer.id;
      this._joystickPointerDown = true;
      this._joystickStartX = pointer.x;
      this._joystickStartY = pointer.y;
      this._joystickBase.setAlpha(ALPHA_ACTIVE);
      this._joystickThumb.setAlpha(ALPHA_ACTIVE);
    });

    // Mover el puntero (en cualquier lugar de la pantalla una vez iniciado)
    this.input.on('pointermove', (pointer) => {
      if (pointer.id !== this._joystickPointerId) return;
      this._updateJoystick(pointer.x, pointer.y);
    });

    // Soltar el puntero
    this.input.on('pointerup', (pointer) => {
      if (pointer.id !== this._joystickPointerId) return;
      this._resetJoystick();
    });
  }

  /**
   * Calcula el desplazamiento del joystick y emite el evento de movimiento.
   * @param {number} px - Posición X actual del puntero.
   * @param {number} py - Posición Y actual del puntero.
   */
  _updateJoystick(px, py) {
    let dx = px - this._joystickStartX;
    let dy = py - this._joystickStartY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Limitar el thumb al radio de la base
    if (dist > JOYSTICK_BASE_RADIUS) {
      dx = (dx / dist) * JOYSTICK_BASE_RADIUS;
      dy = (dy / dist) * JOYSTICK_BASE_RADIUS;
    }

    this._joystickDeltaX = dx;
    this._joystickDeltaY = dy;

    // Redibujar el thumb en su nueva posición
    this._drawThumb(JOYSTICK_X + dx, JOYSTICK_Y + dy);

    // Solo emitir si supera la zona muerta
    if (dist > JOYSTICK_DEAD_ZONE) {
      // Normalizar: vx y vy en rango [-1, 1]
      const vx = dx / JOYSTICK_BASE_RADIUS;
      const vy = dy / JOYSTICK_BASE_RADIUS;
      this._emitToWorld(MOBILE_EVENTS.JOYSTICK_MOVE, { vx, vy });
    } else {
      // Dentro de la zona muerta: detener movimiento
      this._emitToWorld(MOBILE_EVENTS.JOYSTICK_STOP);
    }
  }

  /**
   * Reinicia el joystick a su posición central.
   */
  _resetJoystick() {
    this._joystickPointerDown = false;
    this._joystickPointerId = null;
    this._joystickDeltaX = 0;
    this._joystickDeltaY = 0;
    this._drawThumb(JOYSTICK_X, JOYSTICK_Y);
    this._joystickBase.setAlpha(ALPHA_IDLE);
    this._joystickThumb.setAlpha(ALPHA_IDLE);
    this._emitToWorld(MOBILE_EVENTS.JOYSTICK_STOP);
  }

  // ============================================================
  // COMUNICACIÓN CON WORLDSCENE
  // ============================================================

  /**
   * Emite un evento al bus de eventos de WorldScene (y cualquier escena activa).
   * WorldScene escucha estos eventos para procesarlos como input.
   * @param {string} eventName
   * @param {Object} data
   */
  _emitToWorld(eventName, data = {}) {
    // Obtener la escena WorldScene activa y emitir en su bus
    const worldScene = this.scene.get(SCENE.WORLD);
    if (worldScene && worldScene.events) {
      worldScene.events.emit(eventName, data);
    }
  }

  // ============================================================
  // VISIBILIDAD Y RESIZE
  // ============================================================

  /**
   * Muestra u oculta todos los controles táctiles.
   * @param {boolean} visible
   */
  _setVisible(visible) {
    this._controlsVisible = visible;

    const objs = [
      this._joystickBase,
      this._joystickThumb,
      this._joystickZone,
      this._pauseGfx,
      this._pauseLabel,
      this._pauseButton?.zone,
    ];

    for (const obj of objs) {
      if (obj) obj.setVisible(visible);
    }

    for (const btn of (this._actionButtons || [])) {
      if (btn.gfx)   btn.gfx.setVisible(visible);
      if (btn.label) btn.label.setVisible(visible);
      if (btn.zone)  btn.zone.setVisible(visible);
    }
  }

  /**
   * Callback de resize: activa controles si la pantalla se vuelve pequeña.
   */
  _onResize(gameSize) {
    const isSmall = gameSize.width < MOBILE_BREAKPOINT;
    const isTouchDevice = this.sys.game.device.input.touch;

    if ((isSmall || isTouchDevice) !== this._controlsVisible) {
      this._setVisible(isSmall || isTouchDevice);
    }
  }
}

export default MobileControlsScene;

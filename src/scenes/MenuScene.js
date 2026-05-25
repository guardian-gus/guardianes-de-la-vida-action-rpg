// ============================================================
// MenuScene.js
// Descripción: Menú principal del juego. El jugador llega aquí
//   después de la carga de assets y puede elegir:
//   - Iniciar nueva partida
//   - Continuar partida guardada (si existe en localStorage)
//   - Ver opciones (fase futura)
//
// Estilo: pixel art, paleta Guardianes de la Vida.
// Interacción: teclado (flechas + Enter) y mouse/touch.
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import { SCENE, GAME_WIDTH, GAME_HEIGHT, COLOR_LYNFA } from '../config/constants.js';
import SaveSystem from '../systems/SaveSystem.js';

// --- CONSTANTES LOCALES ---
// Configuración visual del menú
const TITLE_Y       = 320;   // Posición Y del título principal
const SUBTITLE_Y    = 440;   // Posición Y del subtítulo
const FIRST_BUTTON_Y = 650; // Posición Y del primer botón
const BUTTON_SPACING = 120;  // Separación entre botones
const MENU_CENTER_X = GAME_WIDTH / 2;

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.MENU });

    // --- ESTADO DEL MENÚ ---
    // Índice del botón seleccionado actualmente (0 = Iniciar, 1 = Continuar...)
    this._selectedIndex = 0;

    // Lista de opciones del menú.
    // Cada opción tiene un texto y una función que se ejecuta al seleccionarla.
    this._menuOptions = [];

    // Referencias a los objetos de texto en pantalla (para poder resaltarlos)
    this._buttonTexts = [];

    // ¿Existe una partida guardada en localStorage?
    this._hasSavedGame = false;
  }

  /**
   * create(): Construye el menú visual y configura la navegación.
   */
  create() {
    console.log('[MenuScene] Menú principal iniciado.');

    const cx = MENU_CENTER_X;
    const cy = GAME_HEIGHT / 2;

    // --- Verificar si existe partida guardada ---
    // Esto determina si el botón "Continuar" está activo o desactivado.
    this._hasSavedGame = this._checkSavedGame();

    // --- Fondo degradado (programático) ---
    this._createBackground(cx, cy);

    // --- Título ---
    this._createTitle(cx);

    // --- Decoración: línea divisoria ---
    this.add.rectangle(cx, 510, 1000, 6, 0x9B59B6, 0.5);

    // --- Botones del menú ---
    this._buildMenuOptions();
    this._createButtons(cx);

    // --- Versión del juego (esquina inferior derecha) ---
    this.add.text(GAME_WIDTH - 40, GAME_HEIGHT - 40, 'v0.1.0 — Demo', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#555555',
    }).setOrigin(1, 1);

    // --- Crédito educativo ---
    this.add.text(cx, GAME_HEIGHT - 60, 'Universo Guardianes de la Vida', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#7D3C98',
    }).setOrigin(0.5, 1);

    // --- Configurar controles del teclado ---
    this._setupKeyboard();

    // --- Resaltar el primer botón ---
    this._updateSelection();
  }

  // ============================================================
  // MÉTODOS PRIVADOS
  // ============================================================

  /**
   * Crea el fondo visual del menú con un degradado simulado usando
   * rectángulos de colores (Phaser no tiene degradados nativos en Canvas).
   */
  _createBackground(cx, cy) {
    // Fondo base oscuro
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0A0015);

    // Efecto de "aura" en el centro: círculos concéntricos semitransparentes
    // Simula el ambiente del ganglio linfático
    const aura = this.add.graphics();
    aura.fillStyle(0x4A235A, 0.3);
    aura.fillCircle(cx, cy, 800);
    aura.fillStyle(0x7D3C98, 0.15);
    aura.fillCircle(cx, cy - 80, 500);

    // Partículas decorativas (puntos pequeños simulando células)
    // NOTE: Son estáticas en esta versión, se animarán en fases futuras.
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const y = Phaser.Math.Between(40, GAME_HEIGHT - 40);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.4);
      const size = Phaser.Math.Between(4, 12);
      this.add.circle(x, y, size, 0x9B59B6, alpha);
    }
  }

  /**
   * Crea el título principal y el subtítulo del juego.
   */
  _createTitle(cx) {
    // Sombra del título (desplazada 6 píxeles)
    this.add.text(cx + 6, TITLE_Y + 6, 'GUARDIANES DE LA VIDA', {
      fontFamily: 'monospace',
      fontSize: '100px',
      color: '#000000',
    }).setOrigin(0.5).setAlpha(0.5);

    // Título principal
    this.add.text(cx, TITLE_Y, 'GUARDIANES DE LA VIDA', {
      fontFamily: 'monospace',
      fontSize: '100px',
      color: '#D7BDE2',
    }).setOrigin(0.5);

    // Subtítulo: nombre de la primera demo
    this.add.text(cx, SUBTITLE_Y, '— Misión Celular —', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#9B59B6',
    }).setOrigin(0.5);
  }

  /**
   * Define las opciones del menú según el estado de la partida guardada.
   * Si no hay partida, "Continuar" aparece desactivado.
   */
  _buildMenuOptions() {
    this._menuOptions = [
      {
        label:    '▶  INICIAR',
        enabled:  true,
        action:   () => this._startNewGame(),
      },
      {
        label:    this._hasSavedGame ? '↺  CONTINUAR' : '↺  CONTINUAR  [sin datos]',
        enabled:  this._hasSavedGame,
        action:   () => this._continueGame(),
      },
      // TODO: Agregar "OPCIONES" y "CONTROLES" en fases futuras.
    ];
  }

  /**
   * Crea los objetos de texto en pantalla para cada opción del menú.
   */
  _createButtons(cx) {
    this._buttonTexts = [];

    this._menuOptions.forEach((option, index) => {
      const y = FIRST_BUTTON_Y + index * BUTTON_SPACING;

      // Color base según si está habilitado o deshabilitado
      const color = option.enabled ? '#BDC3C7' : '#555555';

      const text = this.add.text(cx, y, option.label, {
        fontFamily: 'monospace',
        fontSize:   '56px',
        color,
      }).setOrigin(0.5);

      // Detectar clic/touch en el botón
      if (option.enabled) {
        text.setInteractive({ useHandCursor: true });

        text.on('pointerover', () => {
          this._selectedIndex = index;
          this._updateSelection();
        });

        text.on('pointerdown', () => {
          this._selectedIndex = index;
          this._executeSelection();
        });
      }

      this._buttonTexts.push(text);
    });
  }

  /**
   * Configura las teclas de navegación del menú.
   * Flechas Arriba/Abajo para moverse, Enter para seleccionar.
   */
  _setupKeyboard() {
    const keys = this.input.keyboard.createCursorKeys();

    // Tecla ARRIBA: mover selección hacia arriba
    this.input.keyboard.on('keydown-UP', () => {
      this._selectedIndex = Math.max(0, this._selectedIndex - 1);
      // Saltar opciones deshabilitadas
      while (
        this._selectedIndex > 0 &&
        !this._menuOptions[this._selectedIndex].enabled
      ) {
        this._selectedIndex--;
      }
      this._updateSelection();
    });

    // Tecla ABAJO: mover selección hacia abajo
    this.input.keyboard.on('keydown-DOWN', () => {
      const max = this._menuOptions.length - 1;
      this._selectedIndex = Math.min(max, this._selectedIndex + 1);
      // Saltar opciones deshabilitadas
      while (
        this._selectedIndex < max &&
        !this._menuOptions[this._selectedIndex].enabled
      ) {
        this._selectedIndex++;
      }
      this._updateSelection();
    });

    // Tecla ENTER o ESPACIO: ejecutar la opción seleccionada
    this.input.keyboard.on('keydown-ENTER', () => this._executeSelection());
    this.input.keyboard.on('keydown-SPACE', () => this._executeSelection());
  }

  /**
   * Actualiza el estilo visual de los botones para indicar cuál está seleccionado.
   * El botón activo se pone brillante y con un "cursor" visual.
   */
  _updateSelection() {
    this._buttonTexts.forEach((text, index) => {
      if (index === this._selectedIndex) {
        // Botón seleccionado: color violeta brillante, ligeramente más grande
        text.setStyle({ color: '#E8DAEF', fontSize: '64px' });
      } else {
        // Botón no seleccionado: color gris o más apagado
        const enabled = this._menuOptions[index].enabled;
        text.setStyle({
          color: enabled ? '#BDC3C7' : '#555555',
          fontSize: '56px',
        });
      }
    });
  }

  /**
   * Ejecuta la acción del botón actualmente seleccionado.
   */
  _executeSelection() {
    const option = this._menuOptions[this._selectedIndex];
    if (option && option.enabled) {
      option.action();
    }
  }

  /**
   * Inicia una partida nueva. En esta fase, va directamente a WorldScene.
   * En fases futuras abrirá la selección de guardián.
   */
  _startNewGame() {
    console.log('[MenuScene] Iniciando nueva partida con Lynfa...');

    // TODO: En el futuro, mostrar selección de guardián antes de ir al mundo.
    // Por ahora va directo a WorldScene con Lynfa como personaje por defecto.
    this.scene.start(SCENE.WORLD, { guardianId: 'lynfa', isNewGame: true });

    // Iniciar también la UIScene en paralelo (el HUD)
    // UIScene corre simultáneamente con WorldScene para mostrar el HUD.
    this.scene.launch(SCENE.UI);
  }

  _continueGame() {
    if (!this._hasSavedGame) return;

    console.log('[MenuScene] Cargando partida guardada...');

    const savedData = SaveSystem.load();
    if (savedData) {
      // Iniciar WorldScene enviándole todo lo guardado
      this.scene.start(SCENE.WORLD, savedData);
      this.scene.launch(SCENE.UI);
    } else {
      console.error('[MenuScene] Error al cargar partida, regresando a nueva partida.');
      this._startNewGame();
    }
  }

  /**
   * Verifica si existe una partida guardada válida en localStorage.
   * @returns {boolean} true si hay datos guardados.
   */
  _checkSavedGame() {
    return SaveSystem.hasSave();
  }
}

export default MenuScene;

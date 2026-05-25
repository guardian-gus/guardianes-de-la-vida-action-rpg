// ============================================================
// PreloadScene.js
// Descripción: Carga TODOS los assets del juego antes de que
//   el jugador pueda interactuar con nada.
//
//   Muestra una barra de progreso programática mientras carga.
//   Cuando la carga termina, va automáticamente al MenuScene.
//
//   En esta Fase 1 la mayoría de assets son placeholders
//   (generados programáticamente con colores). A medida que
//   se agreguen sprites reales, se cargan aquí.
//
// Qué se carga aquí:
//   - JSON de datos (guardianes, enemigos, misiones, diálogos)
//   - Sprites (cuando existan)
//   - Tilemaps y tilesets
//   - Audio
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import { SCENE, GAME_WIDTH, GAME_HEIGHT, COLOR_LYNFA } from '../config/constants.js';

// --- CONSTANTES LOCALES ---
// Dimensiones de la barra de progreso
const BAR_WIDTH      = 200; // Ancho de la barra en píxeles
const BAR_HEIGHT     = 16;  // Alto de la barra en píxeles
const BAR_X          = GAME_WIDTH / 2;
const BAR_Y          = GAME_HEIGHT / 2 + 20;

class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.PRELOAD });
  }

  /**
   * preload(): Phaser ejecuta este método automáticamente.
   * Aquí declaramos todos los assets a cargar.
   * Phaser los descarga en paralelo y actualiza el progreso.
   */
  preload() {
    // Dibujamos la UI de carga ANTES de declarar los assets,
    // para que el jugador vea la barra mientras se descarga todo.
    this._createLoadingScreen();

    // ============================================================
    // DATOS JSON
    // Se cargan como archivos JSON y quedan disponibles en
    // this.cache.json.get('nombreClave')
    //
    // IMPORTANTE: usamos import.meta.env.BASE_URL para que Vite
    // inyecte la ruta correcta tanto en desarrollo ('/')
    // como en GitHub Pages ('/guardianes-de-la-vida-action-rpg/').
    // Jamás usar rutas absolutas hardcodeadas ('/data/...') aquí.
    // ============================================================
    const base = import.meta.env.BASE_URL;
    this.load.json('guardians', `${base}data/guardians.json`);
    this.load.json('enemies',   `${base}data/enemies.json`);
    this.load.json('bosses',    `${base}data/bosses.json`);
    this.load.json('quests',    `${base}data/quests.json`);
    this.load.json('dialogues', `${base}data/dialogues.json`);

    // ============================================================
    // SPRITES (PLACEHOLDER)
    // NOTE: Cuando existan los sprites reales de Aseprite,
    // se cargan aquí con this.load.spritesheet(...).
    // Por ahora se usan rectángulos de colores generados en código.
    //
    // Ejemplo cuando existan:
    // this.load.spritesheet('lynfa', '/assets/sprites/guardians/lynfa.png', {
    //   frameWidth: 32,
    //   frameHeight: 48,
    // });
    // ============================================================

    // TODO: Cargar sprite sheet de Lynfa cuando esté listo en Aseprite.
    // TODO: Cargar sprites de enemigos (virus_minor, bacteria_invader, etc.)
    // TODO: Cargar tileset del ganglio linfático.
    // TODO: Cargar mapa lymph_node_01.json de Tiled.
    // TODO: Cargar audio: música de fondo y efectos de sonido.
  }

  /**
   * create(): Se ejecuta cuando TODOS los assets han terminado de cargarse.
   * Aquí validamos que los datos JSON son correctos y vamos al menú.
   */
  create() {
    console.log('[PreloadScene] Assets cargados. Validando datos...');

    // Validar que los archivos JSON se cargaron correctamente.
    // Si alguno falla, el juego muestra un error claro en consola.
    this._validateJsonData();

    console.log('[PreloadScene] Todo listo. Iniciando menú...');

    // Pequeña pausa visual antes de ir al menú,
    // para que el jugador vea "100%" en la barra de carga.
    this.time.delayedCall(300, () => {
      this.scene.start(SCENE.MENU);
    });
  }

  // ============================================================
  // MÉTODOS PRIVADOS (internos de esta escena)
  // Convención: nombres que empiezan con _ son privados.
  // ============================================================

  /**
   * Crea la pantalla de carga con barra de progreso y texto.
   * Todo programático, sin imágenes externas.
   */
  _createLoadingScreen() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // --- Fondo negro ---
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000);

    // --- Título del juego ---
    this.add.text(cx, cy - 50, 'GUARDIANES DE LA VIDA', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#9B59B6',         // Violeta Lynfa
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 35, 'Misión Celular', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#BDC3C7',         // Gris claro
      align: 'center',
    }).setOrigin(0.5);

    // --- Borde de la barra de progreso ---
    this.add.rectangle(BAR_X, BAR_Y, BAR_WIDTH + 4, BAR_HEIGHT + 4, 0x555555);

    // --- Fondo de la barra (vacía) ---
    this.add.rectangle(BAR_X, BAR_Y, BAR_WIDTH, BAR_HEIGHT, 0x222222);

    // --- Relleno de la barra (se actualiza con el progreso) ---
    // Empezamos con ancho 0 y lo vamos expandiendo.
    const progressBar = this.add.rectangle(
      BAR_X - BAR_WIDTH / 2, // Izquierda de la barra
      BAR_Y,
      0,                      // Ancho inicial = 0
      BAR_HEIGHT,
      COLOR_LYNFA
    ).setOrigin(0, 0.5);     // Origen en la izquierda para expandirse hacia la derecha

    // --- Texto de porcentaje ---
    const progressText = this.add.text(BAR_X, BAR_Y + 18, 'Cargando... 0%', {
      fontFamily: 'monospace',
      fontSize: '6px',
      color: '#AAAAAA',
    }).setOrigin(0.5);

    // ============================================================
    // EVENTOS DE PROGRESO DE CARGA
    // Phaser emite estos eventos automáticamente mientras carga.
    // ============================================================

    // 'progress' se emite en cada asset que termina de cargar.
    // value va de 0.0 a 1.0.
    this.load.on('progress', (value) => {
      progressBar.width = BAR_WIDTH * value;
      progressText.setText(`Cargando... ${Math.floor(value * 100)}%`);
    });

    // 'complete' se emite cuando TODOS los assets han cargado.
    this.load.on('complete', () => {
      progressText.setText('¡Listo!');
    });
  }

  /**
   * Verifica que los archivos JSON se cargaron y tienen la estructura esperada.
   * Registra advertencias en consola si algo falta.
   */
  _validateJsonData() {
    const keys = ['guardians', 'enemies', 'bosses', 'quests', 'dialogues'];

    keys.forEach((key) => {
      const data = this.cache.json.get(key);
      if (!data) {
        // NOTE: Esto ocurrirá durante el desarrollo si el archivo JSON no existe todavía.
        // No es un error fatal: el juego seguirá funcionando con datos vacíos.
        console.warn(`[PreloadScene] Advertencia: no se encontró el JSON '${key}'.`);
        console.warn(`  Asegúrate de que existe: public/data/${key}.json`);
      } else {
        console.log(`[PreloadScene] ✓ ${key}.json cargado (${data.length} entradas)`);
      }
    });
  }
}

export default PreloadScene;

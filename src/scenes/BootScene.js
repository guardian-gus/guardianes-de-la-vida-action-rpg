// ============================================================
// BootScene.js
// Descripción: Primera escena que ejecuta Phaser al iniciar.
//   Su única función es preparar ajustes mínimos y saltar
//   inmediatamente a PreloadScene donde se cargan los assets.
//
//   No carga imágenes aquí (salvo lo estrictamente necesario
//   para mostrar la barra de carga, como un logo pequeño).
//
// Flujo de escenas:
//   BootScene → PreloadScene → MenuScene → WorldScene
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import { SCENE } from '../config/constants.js';

class BootScene extends Phaser.Scene {
  /**
   * El constructor de una escena de Phaser recibe una clave (key)
   * que la identifica internamente. Debe coincidir con SCENE.BOOT.
   */
  constructor() {
    super({ key: SCENE.BOOT });
  }

  /**
   * preload(): Se ejecuta ANTES que create().
   * Aquí se cargan los assets mínimos necesarios para la barra de carga
   * (por ejemplo, un logo o la barra de progreso en sí).
   *
   * Por ahora está vacío porque usaremos una barra de progreso programática
   * en PreloadScene (no necesitamos imágenes para eso).
   */
  preload() {
    // NOTE: Aquí se cargarán assets mínimos cuando existan.
    // Por ahora, PreloadScene dibuja su propia barra de carga con gráficos.
  }

  /**
   * create(): Se ejecuta una sola vez cuando la escena está lista.
   * Aquí configuramos ajustes globales y luego saltamos a PreloadScene.
   */
  create() {
    console.log('[BootScene] Iniciando Guardianes de la Vida: Misión Celular...');

    // Configurar el comportamiento del juego cuando la pestaña
    // del navegador pierde el foco (el jugador cambia de pestaña).
    // pauseOnBlur = true pausa el juego automáticamente.
    this.game.events.on('blur', () => {
      // El juego se pausa cuando pierde el foco (buena práctica)
      this.game.scene.pause(SCENE.WORLD);
    });

    this.game.events.on('focus', () => {
      // El juego se reanuda cuando vuelve el foco
      this.game.scene.resume(SCENE.WORLD);
    });

    // Ir a la escena de carga de assets.
    // 'start' termina la escena actual e inicia la nueva.
    this.scene.start(SCENE.PRELOAD);
  }
}

export default BootScene;

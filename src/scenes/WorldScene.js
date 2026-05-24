// ============================================================
// WorldScene.js
// Descripción: Escena principal del juego donde ocurre todo:
//   mapa, jugador, enemigos, NPCs, combate, misiones.
//
//   En Fase 1 solo muestra un mapa placeholder con el jugador
//   como un rectángulo de color. Las mecánicas se agregan
//   progresivamente en las fases siguientes.
//
// Datos recibidos al iniciar (desde MenuScene):
//   - guardianId: string — qué guardián jugar ('lynfa', 'eri')
//   - isNewGame:  boolean — si es partida nueva o guardada
//   - savedData:  object  — datos de partida guardada (opcional)
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import {
  SCENE,
  GAME_WIDTH,
  GAME_HEIGHT,
  TILE_SIZE,
  COLOR_LYNFA,
  COLOR_FLOOR,
  COLOR_WALL,
  COLOR_ENEMY,
  COLOR_NPC,
  DEPTH_PLAYER,
  DEPTH_ENEMIES,
  DEPTH_FLOOR,
  PLAYER_DEFAULT_SPEED,
  PLAYER_RUN_MULTIPLIER,
  CAMERA_LERP,
  EVENTS,
} from '../config/constants.js';

// --- MAPA PLACEHOLDER ---
// Matriz 2D que define el primer mapa del juego.
// 0 = suelo (pasable), 1 = pared (sólida, bloquea movimiento)
// Este mapa se reemplazará con Tiled en la Fase 3.
//
// Dimensiones: 20 columnas × 15 filas = 640×480 px (con tiles de 32px)
// El mapa es más grande que la pantalla (480×270), lo que activa la cámara.
const PLACEHOLDER_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Dimensiones del mapa en tiles
const MAP_COLS = PLACEHOLDER_MAP[0].length; // 20 columnas
const MAP_ROWS = PLACEHOLDER_MAP.length;     // 15 filas

// Dimensiones del mapa en píxeles
const MAP_WIDTH_PX  = MAP_COLS * TILE_SIZE; // 640 px
const MAP_HEIGHT_PX = MAP_ROWS * TILE_SIZE; // 480 px

class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.WORLD });

    // --- REFERENCIAS A OBJETOS DEL JUEGO ---
    this._player = null;         // Sprite del jugador
    this._walls  = null;         // Grupo de objetos de pared (para colisiones)
    this._npcGroup = null;       // Grupo de NPCs

    // --- ESTADO DEL JUGADOR (placeholder) ---
    // En Fase 2 esto vendrá de Player.js y guardians.json
    this._playerHP     = 120;
    this._playerMaxHP  = 120;
    this._playerEnergy = 80;
    this._playerMaxEnergy = 80;
    this._playerLevel  = 1;
    this._playerXP     = 0;

    // --- CONTROLES ---
    this._cursors  = null; // Flechas del teclado
    this._keyA     = null; // Ataque
    this._keyS     = null; // Correr
    this._keyD     = null; // Interactuar
    this._keyW     = null; // Habilidad especial
    this._keyEnter = null; // Pausa
  }

  /**
   * init(): Recibe los datos enviados desde MenuScene al llamar
   * this.scene.start(SCENE.WORLD, { guardianId, isNewGame }).
   * @param {Object} data - Datos de inicialización.
   */
  init(data) {
    this._guardianId = data.guardianId || 'lynfa';
    this._isNewGame  = data.isNewGame !== false;
    this._savedData  = data.savedData || null;

    console.log(`[WorldScene] Iniciando con guardián: ${this._guardianId}`);
  }

  /**
   * create(): Construye todo el mundo del juego.
   * Orden importante: primero el mapa, luego el jugador, luego la cámara.
   */
  create() {
    // 1. Crear el mapa placeholder
    this._createPlaceholderMap();

    // 2. Crear el jugador en la posición de spawn
    this._createPlayer();

    // 3. Crear NPC de prueba
    this._createNPC();

    // 4. Configurar la cámara para seguir al jugador
    this._setupCamera();

    // 5. Configurar los controles del teclado
    this._setupControls();

    // 6. Configurar colisiones
    this._setupCollisions();

    // 7. Notificar al HUD (UIScene) con el estado inicial del jugador
    this._emitPlayerStats();

    // 8. Mostrar instrucciones en pantalla (placeholder, se eliminará después)
    this._showInstructions();

    console.log('[WorldScene] Mundo cargado. ¡Que comience la misión!');
  }

  /**
   * update(): Se ejecuta en cada frame del juego (60 veces por segundo).
   * Aquí se procesa el movimiento del jugador y la lógica del juego.
   * @param {number} time - Tiempo total transcurrido en ms.
   * @param {number} delta - Tiempo en ms desde el último frame.
   */
  update(time, delta) {
    // Si el jugador no existe todavía, no hacer nada.
    if (!this._player) return;

    // Procesar movimiento del jugador cada frame
    this._handlePlayerMovement();
  }

  // ============================================================
  // MÉTODOS PRIVADOS: CONSTRUCCIÓN DEL MUNDO
  // ============================================================

  /**
   * Dibuja el mapa placeholder a partir de la matriz PLACEHOLDER_MAP.
   * Cada celda de la matriz se convierte en un rectángulo de colores.
   * Los tiles de pared se agregan a un grupo de física estática para colisiones.
   */
  _createPlaceholderMap() {
    // Grupo de física estática: los objetos de este grupo no se mueven
    // pero sí bloquean el paso de objetos dinámicos (como el jugador).
    this._walls = this.physics.add.staticGroup();

    // Recorrer la matriz fila por fila y columna por columna
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const tileType = PLACEHOLDER_MAP[row][col];

        // Calcular la posición en píxeles del tile
        // El origen de Phaser es la esquina superior izquierda.
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;

        if (tileType === 1) {
          // --- PARED ---
          // Se agrega al grupo de física estática para bloquear el paso.
          const wall = this._walls.create(x, y, null);

          // Como no hay imagen, dibujamos un rectángulo de color.
          // setDisplaySize ajusta el tamaño de la hitbox al tile.
          wall.setDisplaySize(TILE_SIZE, TILE_SIZE);

          // Dibujar el rectángulo visual de la pared
          this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, COLOR_WALL)
            .setDepth(DEPTH_FLOOR);

          // Detalle visual: borde más oscuro en las paredes
          this.add.rectangle(x, y, TILE_SIZE - 2, TILE_SIZE - 2, 0x2C1F3A)
            .setDepth(DEPTH_FLOOR);

        } else {
          // --- SUELO ---
          // Solo visual, sin física.
          this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, COLOR_FLOOR)
            .setDepth(DEPTH_FLOOR);

          // Detalle visual: línea de grid muy sutil en el suelo
          this.add.rectangle(x, y, TILE_SIZE - 1, TILE_SIZE - 1, 0x9B6B80, 0.3)
            .setDepth(DEPTH_FLOOR);
        }
      }
    }

    // Definir los límites del mundo para que la cámara y el jugador
    // no puedan salir del mapa.
    this.physics.world.setBounds(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
  }

  /**
   * Crea el sprite placeholder del jugador (Lynfa).
   * Por ahora es un rectángulo violeta con una "L" encima.
   * En Fase 2 se reemplaza con sprites de Aseprite.
   */
  _createPlayer() {
    // Posición de spawn: segunda fila, segunda columna (dentro de las paredes)
    const spawnX = 3 * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = 2 * TILE_SIZE + TILE_SIZE / 2;

    // Crear sprite de física dinámica (se mueve y tiene colisiones)
    // null = sin imagen todavía
    this._player = this.physics.add.sprite(spawnX, spawnY, null);

    // Tamaño visual y de colisión del jugador (32×48 px según el brief)
    this._player.setDisplaySize(24, 32);

    // Dibujar el placeholder visual de Lynfa
    // Usamos un rectángulo violeta con la letra "L"
    this._playerGraphic = this.add.graphics();
    this._drawPlayerGraphic(spawnX, spawnY);

    // El cuerpo de física tiene el mismo tamaño que el sprite
    this._player.body.setSize(20, 28);

    // El jugador no puede salir de los límites del mundo
    this._player.setCollideWorldBounds(true);

    // Profundidad: el jugador siempre se dibuja encima del mapa
    this._player.setDepth(DEPTH_PLAYER);

    // Almacenar la dirección actual para el sistema de combate (Fase 4)
    this._player.direction = 'down';

    // Almacenar si está corriendo (para el multiplicador de velocidad)
    this._player.isRunning = false;

    console.log(`[WorldScene] Jugador creado en (${spawnX}, ${spawnY})`);
  }

  /**
   * Dibuja el gráfico placeholder del jugador en la posición indicada.
   * Se llama en create() y en update() para seguir al jugador.
   * @param {number} x - Posición X del centro del jugador.
   * @param {number} y - Posición Y del centro del jugador.
   */
  _drawPlayerGraphic(x, y) {
    this._playerGraphic.clear();

    // Cuerpo: rectángulo violeta (color de Lynfa)
    this._playerGraphic.fillStyle(COLOR_LYNFA, 1);
    this._playerGraphic.fillRect(x - 10, y - 14, 20, 28);

    // Cara: círculo blanco pequeño (indicador de dirección)
    this._playerGraphic.fillStyle(0xFFFFFF, 0.9);
    this._playerGraphic.fillCircle(x, y - 6, 5);

    // Indicador de dirección: marca en la parte correspondiente
    this._playerGraphic.fillStyle(0xD7BDE2, 1);
    switch (this._player?.direction) {
      case 'up':
        this._playerGraphic.fillRect(x - 2, y - 14, 4, 5); break;
      case 'down':
        this._playerGraphic.fillRect(x - 2, y + 10, 4, 5); break;
      case 'left':
        this._playerGraphic.fillRect(x - 12, y - 2, 5, 4); break;
      case 'right':
        this._playerGraphic.fillRect(x + 7, y - 2, 5, 4); break;
    }

    this._playerGraphic.setDepth(DEPTH_PLAYER);
  }

  /**
   * Crea un NPC de prueba (Centinela Linfático) en el mapa.
   * En Fase 5 este NPC tendrá diálogo completo.
   */
  _createNPC() {
    const npcX = 10 * TILE_SIZE + TILE_SIZE / 2;
    const npcY = 7 * TILE_SIZE + TILE_SIZE / 2;

    // Grupo de NPCs (sin física compleja, solo detección de proximidad)
    this._npcGroup = this.physics.add.staticGroup();

    const npc = this._npcGroup.create(npcX, npcY, null);
    npc.setDisplaySize(20, 28);
    npc.id = 'centinela_linfatico';

    // Visual del NPC: rectángulo azul
    const npcGraphic = this.add.graphics();
    npcGraphic.fillStyle(COLOR_NPC, 1);
    npcGraphic.fillRect(npcX - 10, npcY - 14, 20, 28);
    npcGraphic.fillStyle(0xFFFFFF, 0.8);
    npcGraphic.fillCircle(npcX, npcY - 6, 5);
    npcGraphic.setDepth(DEPTH_ENEMIES);

    // Etiqueta del NPC (se ve al acercarse)
    const npcLabel = this.add.text(npcX, npcY - 20, 'Centinela', {
      fontFamily: 'monospace',
      fontSize: '5px',
      color: '#AED6F1',
    }).setOrigin(0.5).setDepth(DEPTH_ENEMIES);

    // Guardar referencias para uso en update
    this._npc = npc;
    this._npcLabel = npcLabel;
  }

  /**
   * Configura la cámara del juego para seguir al jugador.
   * La cámara muestra una ventana (480×270) del mapa completo (640×480).
   */
  _setupCamera() {
    // Definir los límites que la cámara puede mostrar
    this.cameras.main.setBounds(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);

    // Seguir al jugador con suavizado (lerp = interpolación lineal)
    // CAMERA_LERP = 0.08: movimiento suave y natural
    this.cameras.main.startFollow(
      this._player,
      true,         // Redondear posición para evitar mezzo-pixel en pixel art
      CAMERA_LERP,  // Lerp horizontal
      CAMERA_LERP   // Lerp vertical
    );
  }

  /**
   * Configura todos los controles del teclado del juego.
   * Controles definidos en el brief:
   *   Flechas = movimiento
   *   A = ataque
   *   S = correr
   *   D = interactuar
   *   W = habilidad especial
   *   Enter = pausa
   */
  _setupControls() {
    // Flechas del teclado (createCursorKeys incluye flechas + Shift + Space)
    this._cursors = this.input.keyboard.createCursorKeys();

    // Teclas de acción personalizadas
    this._keyA     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this._keyS     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this._keyD     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this._keyW     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this._keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // Enter: abrir menú de pausa
    this._keyEnter.on('down', () => {
      console.log('[WorldScene] Pausa activada.');
      // TODO: Implementar PauseScene en Fase futura
      // this.scene.pause(SCENE.WORLD);
      // this.scene.launch(SCENE.PAUSE);
    });

    // D: interactuar con NPC o objeto
    this._keyD.on('down', () => {
      this._tryInteract();
    });

    // W: habilidad especial de Lynfa
    this._keyW.on('down', () => {
      console.log('[WorldScene] Habilidad especial activada (Fase 4).');
      // TODO: Implementar en Fase 4 — Onda de Anticuerpos de Lynfa
    });

    // A: ataque básico
    this._keyA.on('down', () => {
      console.log('[WorldScene] Ataque básico (Fase 4).');
      // TODO: Implementar en Fase 4 — Pulso de Anticuerpos
    });
  }

  /**
   * Configura las colisiones entre el jugador y las paredes del mapa.
   */
  _setupCollisions() {
    // Colisión física entre el jugador y el grupo de paredes.
    // Phaser se encarga de que el jugador no pueda atravesar las paredes.
    this.physics.add.collider(this._player, this._walls);
  }

  // ============================================================
  // MÉTODOS PRIVADOS: LÓGICA POR FRAME (llamados en update)
  // ============================================================

  /**
   * Procesa el movimiento del jugador según las teclas presionadas.
   * Se llama en cada frame desde update().
   *
   * Lógica:
   *   1. Detectar qué teclas están presionadas.
   *   2. Calcular la velocidad (normal o corriendo).
   *   3. Aplicar la velocidad al cuerpo de física del jugador.
   *   4. Actualizar la dirección y el gráfico placeholder.
   */
  _handlePlayerMovement() {
    const body = this._player.body;

    // Detectar si el jugador está corriendo (tecla S)
    const isRunning = this._keyS.isDown;
    const speed = isRunning
      ? PLAYER_DEFAULT_SPEED * PLAYER_RUN_MULTIPLIER
      : PLAYER_DEFAULT_SPEED;

    // Resetear velocidad al inicio de cada frame
    // (si no se hace, el personaje sigue moviéndose aunque se suelte la tecla)
    body.setVelocity(0, 0);

    // --- MOVIMIENTO EN 4 DIRECCIONES ---
    let moving = false;

    if (this._cursors.left.isDown) {
      body.setVelocityX(-speed);
      this._player.direction = 'left';
      moving = true;
    } else if (this._cursors.right.isDown) {
      body.setVelocityX(speed);
      this._player.direction = 'right';
      moving = true;
    }

    if (this._cursors.up.isDown) {
      body.setVelocityY(-speed);
      this._player.direction = 'up';
      moving = true;
    } else if (this._cursors.down.isDown) {
      body.setVelocityY(speed);
      this._player.direction = 'down';
      moving = true;
    }

    // --- NORMALIZAR VELOCIDAD EN DIAGONAL ---
    // Sin esto, moverse en diagonal es más rápido que en línea recta
    // (por el teorema de Pitágoras: √(vx²+vy²) > v).
    if (body.velocity.x !== 0 && body.velocity.y !== 0) {
      body.velocity.normalize().scale(speed);
    }

    // --- ACTUALIZAR EL GRÁFICO PLACEHOLDER ---
    // El gráfico sigue la posición del sprite de física.
    this._drawPlayerGraphic(this._player.x, this._player.y);

    // Almacenar estado de carrera para la UIScene
    this._player.isRunning = isRunning && moving;
  }

  /**
   * Intenta interactuar con un NPC o objeto cercano al jugador.
   * Se llama cuando el jugador presiona la tecla D.
   */
  _tryInteract() {
    if (!this._npc) return;

    // Calcular distancia entre el jugador y el NPC
    const dist = Phaser.Math.Distance.Between(
      this._player.x, this._player.y,
      this._npc.x, this._npc.y
    );

    // Rango de interacción: 2 tiles de distancia
    const INTERACT_RANGE = TILE_SIZE * 2;

    if (dist <= INTERACT_RANGE) {
      console.log('[WorldScene] Interactuando con Centinela Linfático.');
      // TODO: Implementar diálogo en Fase 5
      // this.scene.launch(SCENE.DIALOGUE, { dialogueId: 'intro_centinela' });
    } else {
      console.log('[WorldScene] No hay nada cerca para interactuar.');
    }
  }

  /**
   * Emite los stats iniciales del jugador a la UIScene para el HUD.
   * Usa el sistema de eventos de Phaser para comunicación entre escenas.
   */
  _emitPlayerStats() {
    this.events.emit(EVENTS.PLAYER_HP_CHANGED, {
      current: this._playerHP,
      max:     this._playerMaxHP,
    });
    this.events.emit(EVENTS.PLAYER_ENERGY_CHANGED, {
      current: this._playerEnergy,
      max:     this._playerMaxEnergy,
    });
  }

  /**
   * Muestra instrucciones temporales en pantalla para el jugador.
   * Son fijas en la cámara (no se mueven con el mapa).
   * Se eliminará cuando el sistema de diálogo esté implementado.
   */
  _showInstructions() {
    const instructions = [
      '← → ↑ ↓  Mover',
      'S          Correr',
      'A          Atacar (Fase 4)',
      'D          Interactuar',
      'W          Habilidad (Fase 4)',
      'Enter      Pausa (próximamente)',
    ];

    // setScrollFactor(0) hace que el texto esté fijo en la cámara (como HUD)
    const bg = this.add.rectangle(60, 85, 110, 60, 0x000000, 0.6)
      .setScrollFactor(0)
      .setDepth(DEPTH_ENEMIES + 1);

    this.add.text(8, 58, 'CONTROLES', {
      fontFamily: 'monospace',
      fontSize: '5px',
      color: '#9B59B6',
    }).setScrollFactor(0).setDepth(DEPTH_ENEMIES + 2);

    instructions.forEach((line, i) => {
      this.add.text(8, 67 + i * 9, line, {
        fontFamily: 'monospace',
        fontSize: '5px',
        color: '#BDC3C7',
      }).setScrollFactor(0).setDepth(DEPTH_ENEMIES + 2);
    });
  }
}

export default WorldScene;

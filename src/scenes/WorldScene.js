// ============================================================
// WorldScene.js
// Descripción: Escena principal del juego donde ocurre todo:
//   mapa, jugador, enemigos, NPCs, combate, misiones.
//
// Fase 2: Jugador y enemigos como clases separadas (Player.js,
//   Enemy.js), cargados desde guardians.json y enemies.json.
//
// Datos recibidos al iniciar (desde MenuScene):
//   - guardianId: string  — qué guardián jugar ('lynfa', 'eri')
//   - isNewGame:  boolean — si es partida nueva o guardada
//   - savedData:  object  — datos de partida guardada (opcional)
//
// Fecha: 2026-05-24 | Versión: 2.0.0
// ============================================================

import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Enemy  from '../entities/Enemy.js';
import {
  SCENE,
  GAME_WIDTH,
  GAME_HEIGHT,
  TILE_SIZE,
  COLOR_FLOOR,
  COLOR_WALL,
  DEPTH_PLAYER,
  DEPTH_ENEMIES,
  DEPTH_FLOOR,
  DEPTH_EFFECTS,
  CAMERA_LERP,
  EVENTS,
} from '../config/constants.js';

// --- MAPA PLACEHOLDER ---
// Matriz 2D: 0 = suelo, 1 = pared.
// Se reemplazará con Tiled en Fase 3.
// Dimensiones: 20×15 tiles = 640×480 px (tiles de 32px)
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

const MAP_COLS       = PLACEHOLDER_MAP[0].length;
const MAP_ROWS       = PLACEHOLDER_MAP.length;
const MAP_WIDTH_PX   = MAP_COLS * TILE_SIZE; // 640 px
const MAP_HEIGHT_PX  = MAP_ROWS * TILE_SIZE; // 480 px

// Posiciones de spawn de los 3 enemigos en el mapa
const ENEMY_SPAWNS = [
  { col: 8,  row: 3  },
  { col: 14, row: 7  },
  { col: 6,  row: 11 },
];

class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE.WORLD });

    // --- OBJETOS DE JUEGO ---
    this._player    = null; // Instancia de Player.js
    this._enemies   = [];   // Array de instancias de Enemy.js
    this._walls     = null; // Grupo de física estática (paredes)
    this._npcGroup  = null; // Grupo de NPCs

    // --- CONTROLES ---
    this._cursors  = null;
    this._keyAttack    = null; // Z o J — ataque básico
    this._keyRun       = null; // Shift — correr
    this._keyInteract  = null; // E — interactuar
    this._keySkill     = null; // X — habilidad especial
    this._keyPause     = null; // Escape — pausa
  }

  /**
   * init(): Recibe los datos enviados desde MenuScene.
   * @param {Object} data - { guardianId, isNewGame, savedData }
   */
  init(data) {
    this._guardianId = data.guardianId || 'lynfa';
    this._isNewGame  = data.isNewGame !== false;
    this._savedData  = data.savedData || null;

    console.log(`[WorldScene] Iniciando — Guardián: ${this._guardianId} | Nueva partida: ${this._isNewGame}`);
  }

  /**
   * create(): Construye el mundo completo en orden.
   */
  create() {
    // Obtener los datos cargados en PreloadScene
    const guardiansData = this.cache.json.get('guardians');
    const enemiesData   = this.cache.json.get('enemies');

    // Buscar los datos del guardián seleccionado
    const guardianData = guardiansData.find(g => g.id === this._guardianId);
    if (!guardianData) {
      console.error(`[WorldScene] Guardián '${this._guardianId}' no encontrado en guardians.json`);
      return;
    }

    // 1. Mapa placeholder (tiles de colores)
    this._createPlaceholderMap();

    // 2. Jugador usando la clase Player.js
    this._spawnPlayer(guardianData);

    // 3. Enemigos usando la clase Enemy.js
    this._spawnEnemies(enemiesData);

    // 4. NPC del Centinela Linfático
    this._createNPC();

    // 5. Cámara siguiendo al jugador
    this._setupCamera();

    // 6. Controles del teclado
    this._setupControls();

    // 7. Colisiones jugador ↔ paredes, enemigos ↔ paredes
    this._setupCollisions();

    // 8. Escuchar eventos del juego (muertes de enemigos, etc.)
    this._setupEventListeners();

    // 9. Enviar stats iniciales al HUD
    this._player.emitStats();

    // 10. Instrucciones temporales en pantalla
    this._showInstructions();

    console.log('[WorldScene] ¡Mundo listo! Jugador y enemigos activos.');
  }

  /**
   * update(): Lógica por frame (60 fps).
   */
  update(time, delta) {
    if (!this._player || !this._player.isAlive) return;

    // Actualizar movimiento del jugador
    this._player.handleMovement(this._cursors, this._keyRun);

    // Actualizar lógica del jugador (gráfico, timers)
    this._player.update(delta);

    // Actualizar cada enemigo activo
    for (const enemy of this._enemies) {
      if (enemy.isAlive) {
        enemy.update(delta);
      }
    }
  }

  // ============================================================
  // MÉTODOS PRIVADOS — CONSTRUCCIÓN DEL MUNDO
  // ============================================================

  /**
   * Dibuja el mapa placeholder y crea el grupo de paredes con física.
   */
  _createPlaceholderMap() {
    this._walls = this.physics.add.staticGroup();

    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const tileType = PLACEHOLDER_MAP[row][col];
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;

        if (tileType === 1) {
          // Pared: añadir al grupo de física estática
          const wall = this._walls.create(x, y, null);
          wall.setDisplaySize(TILE_SIZE, TILE_SIZE);

          // Visual: capa de pared + borde más oscuro
          this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, COLOR_WALL).setDepth(DEPTH_FLOOR);
          this.add.rectangle(x, y, TILE_SIZE - 2, TILE_SIZE - 2, 0x2C1F3A).setDepth(DEPTH_FLOOR);

        } else {
          // Suelo: solo visual
          this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, COLOR_FLOOR).setDepth(DEPTH_FLOOR);
          this.add.rectangle(x, y, TILE_SIZE - 1, TILE_SIZE - 1, 0x9B6B80, 0.3).setDepth(DEPTH_FLOOR);
        }
      }
    }

    // Límites del mundo para física y cámara
    this.physics.world.setBounds(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
  }

  /**
   * Crea la instancia de Player con los datos del guardián seleccionado.
   * @param {Object} guardianData - Datos del guardián desde guardians.json.
   */
  _spawnPlayer(guardianData) {
    // Spawn en tile (3,2) — esquina superior izquierda del área jugable
    const spawnX = 3 * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = 2 * TILE_SIZE + TILE_SIZE / 2;

    this._player = new Player(this, guardianData, spawnX, spawnY);
  }

  /**
   * Crea los 3 enemigos iniciales del mapa.
   * En Fase 3, las posiciones vendrán del JSON del mapa de Tiled.
   * @param {Array} enemiesData - Array de objetos desde enemies.json.
   */
  _spawnEnemies(enemiesData) {
    // Los 3 enemigos base del brief (uno de cada tipo)
    const enemyTypes = ['virus_minor', 'bacteria_invader', 'infected_cell'];

    enemyTypes.forEach((typeId, index) => {
      const data = enemiesData.find(e => e.id === typeId);
      if (!data) {
        console.warn(`[WorldScene] Enemigo '${typeId}' no encontrado en enemies.json`);
        return;
      }

      const spawn = ENEMY_SPAWNS[index];
      const x = spawn.col * TILE_SIZE + TILE_SIZE / 2;
      const y = spawn.row * TILE_SIZE + TILE_SIZE / 2;

      const enemy = new Enemy(this, data, x, y);
      enemy.setTarget(this._player);

      this._enemies.push(enemy);
    });

    console.log(`[WorldScene] ${this._enemies.length} enemigos creados.`);
  }

  /**
   * Crea el NPC del Centinela Linfático (placeholder visual).
   * En Fase 5 tendrá diálogo completo vía DialogueSystem.
   */
  _createNPC() {
    const npcX = 10 * TILE_SIZE + TILE_SIZE / 2;
    const npcY =  7 * TILE_SIZE + TILE_SIZE / 2;

    this._npcGroup = this.physics.add.staticGroup();
    const npc = this._npcGroup.create(npcX, npcY, null);
    npc.setDisplaySize(20, 28);
    npc.id = 'centinela_linfatico';

    // Visual placeholder: rectángulo azul con "cara"
    const g = this.add.graphics();
    g.fillStyle(0x3498DB, 1);
    g.fillRect(npcX - 10, npcY - 14, 20, 28);
    g.fillStyle(0xFFFFFF, 0.8);
    g.fillCircle(npcX, npcY - 6, 5);
    g.setDepth(DEPTH_ENEMIES);

    // Etiqueta flotante
    this.add.text(npcX, npcY - 22, 'Centinela', {
      fontFamily: 'monospace',
      fontSize:   '4px',
      color:      '#AED6F1',
    }).setOrigin(0.5).setDepth(DEPTH_ENEMIES);

    // Guardar referencia para interacción
    this._npc = npc;
  }

  /**
   * Configura la cámara para seguir al jugador con suavizado.
   */
  _setupCamera() {
    this.cameras.main.setBounds(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
    this.cameras.main.startFollow(
      this._player.sprite,
      true,
      CAMERA_LERP,
      CAMERA_LERP
    );
  }

  /**
   * Configura todos los controles del teclado.
   *
   * Mapeado final (según el brief):
   *   Flechas    = movimiento
   *   Shift      = correr
   *   Z          = ataque básico
   *   X          = habilidad especial
   *   E          = interactuar con NPC
   *   Escape     = pausa
   */
  _setupControls() {
    this._cursors     = this.input.keyboard.createCursorKeys();
    this._keyRun      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this._keyAttack   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this._keySkill    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this._keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._keyPause    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Z — Ataque básico
    this._keyAttack.on('down', () => {
      this._handleAttack();
    });

    // E — Interactuar con NPC
    this._keyInteract.on('down', () => {
      this._tryInteract();
    });

    // X — Habilidad especial (Fase 4)
    this._keySkill.on('down', () => {
      console.log('[WorldScene] Habilidad especial (Fase 4).');
    });

    // Escape — Pausa (Fase futura)
    this._keyPause.on('down', () => {
      console.log('[WorldScene] Pausa (próximamente).');
    });
  }

  /**
   * Configura todas las colisiones físicas del mundo.
   * Jugador ↔ Paredes, Enemigos ↔ Paredes, Enemigos ↔ Jugador.
   */
  _setupCollisions() {
    // Jugador no puede atravesar paredes
    this.physics.add.collider(this._player.sprite, this._walls);

    // Enemigos no pueden atravesar paredes
    for (const enemy of this._enemies) {
      this.physics.add.collider(enemy.sprite, this._walls);
    }

    // Enemigos hacen daño por contacto al jugador
    for (const enemy of this._enemies) {
      this.physics.add.overlap(
        this._player.sprite,
        enemy.sprite,
        (_playerSprite, enemySprite) => {
          // Solo hacer daño si el enemigo tiene contactDamage activo
          if (enemySprite.enemyRef && enemySprite.enemyRef.contactDamage) {
            this._player.takeDamage(enemySprite.enemyRef.attack, enemySprite.enemyRef);
          }
        }
      );
    }
  }

  /**
   * Suscribe la escena a eventos del bus de Phaser.
   * Por ahora solo escucha muertes de enemigos para dar XP al jugador.
   */
  _setupEventListeners() {
    this.events.on(EVENTS.ENEMY_DIED, (data) => {
      // Dar XP al jugador
      this._player.gainXP(data.xpReward);
      console.log(`[WorldScene] Enemigo '${data.enemyId}' derrotado. +${data.xpReward} XP al jugador.`);

      // Limpiar el enemigo del array (para que update() no lo procese)
      this._enemies = this._enemies.filter(e => e.id !== data.enemyId || !e.isAlive);
    });
  }

  // ============================================================
  // MÉTODOS PRIVADOS — LÓGICA DE JUEGO
  // ============================================================

  /**
   * Ejecuta el ataque básico del jugador.
   * En Fase 4 esto se moverá a CombatSystem.js.
   * Por ahora: revisa si algún enemigo está en el rango del ataque.
   */
  _handleAttack() {
    if (!this._player.canAttack()) return;

    this._player.triggerAttackCooldown();

    const range  = this._player.basicAttackData.range;
    const damage = this._player.attack;

    // Calcular la posición de la hitbox según la dirección del jugador
    const px = this._player.sprite.x;
    const py = this._player.sprite.y;

    let hitX = px;
    let hitY = py;
    switch (this._player.direction) {
      case 'up':    hitY = py - 28; break;
      case 'down':  hitY = py + 28; break;
      case 'left':  hitX = px - 28; break;
      case 'right': hitX = px + 28; break;
    }

    // Revisar qué enemigos están dentro del rango
    for (const enemy of this._enemies) {
      if (!enemy.isAlive) continue;

      const dist = Phaser.Math.Distance.Between(hitX, hitY, enemy.sprite.x, enemy.sprite.y);

      if (dist <= range + 12) {
        enemy.takeDamage(damage, px, py);
        console.log(`[WorldScene] ¡Golpe! ${this._player.name} → ${enemy.name}`);
      }
    }
  }

  /**
   * Intenta interactuar con un NPC si el jugador está cerca.
   * En Fase 5 esto disparará DialogueSystem.
   */
  _tryInteract() {
    if (!this._npc) return;

    const dist = Phaser.Math.Distance.Between(
      this._player.sprite.x, this._player.sprite.y,
      this._npc.x, this._npc.y
    );

    const INTERACT_RANGE = TILE_SIZE * 2;

    if (dist <= INTERACT_RANGE) {
      console.log('[WorldScene] Interactuando con Centinela Linfático. (Fase 5: diálogo)');
      // TODO Fase 5: this.scene.launch(SCENE.DIALOGUE, { dialogueId: 'intro_centinela' });
    } else {
      console.log('[WorldScene] No hay nada cerca para interactuar.');
    }
  }

  /**
   * Instrucciones de controles temporales, fijas en la cámara.
   * Se eliminan cuando el sistema de diálogo esté listo.
   */
  _showInstructions() {
    const lines = [
      'CONTROLES',
      '──────────────',
      '← → ↑ ↓  Mover',
      'Shift      Correr',
      'Z          Atacar',
      'X          Habilidad (F4)',
      'E          Interactuar',
      'Esc        Pausa (pronto)',
    ];

    this.add.rectangle(62, 88, 120, 72, 0x000000, 0.65)
      .setScrollFactor(0)
      .setDepth(DEPTH_EFFECTS + 10);

    lines.forEach((line, i) => {
      const color = i === 0 ? '#9B59B6' : '#BDC3C7';
      this.add.text(8, 58 + i * 9, line, {
        fontFamily: 'monospace',
        fontSize:   '5px',
        color,
      }).setScrollFactor(0).setDepth(DEPTH_EFFECTS + 11);
    });
  }
}

export default WorldScene;

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
import Enemy from '../entities/Enemy.js';
import Boss from '../entities/Boss.js';
import Projectile from '../entities/Projectile.js';
import QuestSystem from '../systems/QuestSystem.js';
import SaveSystem from '../systems/SaveSystem.js';
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
  DEPTH_OBJECTS,
  CAMERA_LERP,
  EVENTS,
  PLAYER_STATE,
  DIRECTION,
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
    this._player = null;
    this._enemies = [];
    this._projectiles = []; // Manejo de proyectiles activos (Fase 9)
    this._boss = null;
    this._walls     = null; // Grupo de física estática (paredes)
    this._npcGroup  = null; // Grupo de NPCs
    this._door      = null; // Puerta hacia la sala del jefe

    // --- CONTROLES TECLADO ---
    this._cursors  = null;
    this._keyAttack    = null; // A — ataque básico
    this._keyRun       = null; // S — correr
    this._keyInteract  = null; // W — interactuar
    this._keySkill     = null; // D — habilidad especial
    this._keyPause     = null; // Enter — pausa

    // --- CONTROLES MÓVILES (Fase 9) ---
    // Estado del joystick: valores normalizados [-1, 1]
    // Se combinan con el teclado en cada frame del update().
    this._mobileVx    = 0;
    this._mobileVy    = 0;
    this._mobileRun   = false; // true mientras el botón S esté presionado
  }

  /**
   * init(): Recibe los datos enviados desde MenuScene.
   * @param {Object} data - { guardianId, isNewGame, savedData }
   */
  init(data) {
    this._guardianId  = data.guardianId || 'lynfa';
    this._isNewGame   = data.isNewGame !== false;
    this._savedData   = data.savedData || null;
    this._isBossRoom  = data.isBossRoom || false;

    console.log(`[WorldScene] Iniciando — Guardián: ${this._guardianId} | Boss Room: ${this._isBossRoom}`);
  }

  /**
   * create(): Construye el mundo completo en orden.
   */
  create() {
    const guardiansData = this.cache.json.get('guardians');
    const enemiesData   = this.cache.json.get('enemies');
    const questsData    = this.cache.json.get('quests');

    // Buscar los datos del guardián seleccionado
    const guardianData = guardiansData.find(g => g.id === this._guardianId);
    if (!guardianData) {
      console.error(`[WorldScene] Guardián '${this._guardianId}' no encontrado en guardians.json`);
      return;
    }

    // Instanciar el sistema de misiones
    this._questSystem = new QuestSystem(this, questsData);

    // OPT-02: Inicializar grupos físicos globales antes de spawnear entidades
    this._enemiesGroup = this.physics.add.group();
    this._projectilesGroup = this.physics.add.group();

    // 1. Mapa placeholder (tiles de colores)
    this._createPlaceholderMap();

    // 2. Jugador usando la clase Player.js
    this._spawnPlayer(guardianData);

    if (!this._isBossRoom) {
      // 3. Enemigos normales
      this._spawnEnemies(enemiesData);
      // 4. NPC del Centinela Linfático
      this._createNPC();
    } else {
      // Spawnear Jefe en el centro
      this._spawnBoss();
    }

    // 5. Cámara siguiendo al jugador
    this._setupCamera();

    // 6. Controles del teclado
    this._setupControls();

    // 7. Controles móviles (joystick + botones) — Fase 9
    this._setupMobileControls();

    // 8. Colisiones jugador ↗ paredes, enemigos ↗ paredes
    this._setupCollisions();

    // 9. Escuchar eventos del juego (muertes de enemigos, etc.)
    this._setupEventListeners();

    // 10. Enviar stats iniciales al HUD
    this._player.emitStats();

    console.log('[WorldScene] ¡Mundo listo! Jugador y enemigos activos.');
  }

  /**
   * update(): Lógica por frame (60 fps).
   */
  update(time, delta) {
    if (!this._player || !this._player.isAlive) return;

    // Actualizar jefe
    if (this._boss && this._boss.isAlive) {
      this._boss.update(time, delta);
      // Colisión jefe-jugador (daño por contacto simple)
      if (Phaser.Geom.Intersects.RectangleToRectangle(this._player.sprite.getBounds(), this._boss.sprite.getBounds())) {
        this._player.takeDamage(this._boss.attack, this._boss);
      }
    }

    // --- MOVIMIENTO: combinar teclado + joystick móvil ---
    // Si hay input móvil activo lo aplicamos directamente al cuerpo físico;
    // si no, handleMovement() usa el teclado normalmente.
    if (this._mobileVx !== 0 || this._mobileVy !== 0) {
      this._applyMobileMovement();
    } else {
      this._player.handleMovement(this._cursors, this._keyRun);
    }

    // Actualizar lógica interna del jugador (invulnerabilidad, etc.)
    this._player.update(delta);

    // Actualizar proyectiles
    for (let i = this._projectiles.length - 1; i >= 0; i--) {
      const proj = this._projectiles[i];
      if (proj.sprite && proj.sprite.active) {
        proj.update(delta);
      } else {
        this._projectiles.splice(i, 1);
      }
    }

    // Actualizar movimiento de enemigos vivos
    for (let i = this._enemies.length - 1; i >= 0; i--) {
      const enemy = this._enemies[i];
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
    const floorColor = this._isBossRoom ? 0x641E16 : COLOR_FLOOR;

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
          this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, floorColor).setDepth(DEPTH_FLOOR);
          this.add.rectangle(x, y, TILE_SIZE - 1, TILE_SIZE - 1, 0x000000, 0.2).setDepth(DEPTH_FLOOR);
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
    // Generar exactamente 3 virus menores para la misión
    const enemyTypes = ['virus_minor', 'virus_minor', 'virus_minor'];

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
      if (this._enemiesGroup) {
        this._enemiesGroup.add(enemy.sprite);
      }
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
      fontSize:   '16px',
      color:      '#AED6F1',
    }).setOrigin(0.5).setDepth(DEPTH_ENEMIES).setScale(0.25);

    // Guardar referencia para interacción
    this._npc = npc;
  }

  /**
   * Configura la cámara para seguir al jugador con suavizado.
   */
  _setupCamera() {
    this.cameras.main.setBounds(0, 0, MAP_WIDTH_PX, MAP_HEIGHT_PX);
    this.cameras.main.setZoom(4);
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
    this._inputKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      attack: Phaser.Input.Keyboard.KeyCodes.A,
      run: Phaser.Input.Keyboard.KeyCodes.S,
      interact: Phaser.Input.Keyboard.KeyCodes.D
    });
    this._keyRun      = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this._keyAttack   = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this._keySkill    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this._keyInteract = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this._keyPause    = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // Z — Ataque básico
    this._keyAttack.on('down', () => {
      this._handleAttack();
    });

    // E — Interactuar con NPC
    this._keyInteract.on('down', () => {
      this._tryInteract();
    });

    // X (o D) — Habilidad especial (Fase 9)
    this._keySkill.on('down', () => {
      this._handleSkill();
    });

    // Enter — Pausa
    this._keyPause.on('down', () => {
      this.scene.pause();
      this.scene.launch(SCENE.PAUSE);
    });
  }

  /**
   * Fase 9 — Controles móviles.
   * Lanza MobileControlsScene en paralelo y suscribe los eventos
   * que esa escena emite en el bus de WorldScene.
   *
   * Separar el input táctil en su propia escena permite:
   *   - Mantener WorldScene limpia de lógica de UI.
   *   - Reutilizar MobileControlsScene en otras escenas (ej: BossRoom).
   *   - Desactivar los controles sin tocar el código del mundo.
   */
  _setupMobileControls() {
    // Lanzar la escena de controles si no está ya activa
    if (!this.scene.isActive(SCENE.MOBILE_CONTROLS)) {
      this.scene.launch(SCENE.MOBILE_CONTROLS);
    }

    // --- Joystick: movimiento ---
    this.events.on(EVENTS.MOBILE_JOYSTICK_MOVE, ({ vx, vy }) => {
      this._mobileVx = vx;
      this._mobileVy = vy;
    });

    this.events.on(EVENTS.MOBILE_JOYSTICK_STOP, () => {
      this._mobileVx = 0;
      this._mobileVy = 0;
    });

    // --- Botón A: Ataque ---
    this.events.on(EVENTS.MOBILE_BTN_ATTACK_DOWN, () => {
      this._handleAttack();
    });

    // --- Botón S: Correr (hold) ---
    this.events.on(EVENTS.MOBILE_BTN_RUN_DOWN, () => {
      this._mobileRun = true;
    });
    this.events.on(EVENTS.MOBILE_BTN_RUN_UP, () => {
      this._mobileRun = false;
    });

    // --- Botón D: Habilidad especial ---
    this.events.on(EVENTS.MOBILE_BTN_SKILL_DOWN, () => {
      this._handleSkill();
    });

    // --- Botón W: Interactuar ---
    this.events.on(EVENTS.MOBILE_BTN_INTERACT_DOWN, () => {
      this._tryInteract();
    });

    // --- Botón Pausa ---
    this.events.on(EVENTS.MOBILE_BTN_PAUSE_DOWN, () => {
      this.scene.pause();
      this.scene.launch(SCENE.PAUSE);
    });

    console.log('[WorldScene] Controles móviles conectados.');
  }

  /**
   * Aplica el movimiento del joystick virtual al jugador.
   * Se llama en update() cuando hay input táctil activo.
   *
   * Convierte vx/vy normalizados [-1, 1] a velocidad de física
   * usando el mismo multiplicador de correr que el teclado.
   */
  _applyMobileMovement() {
    if (!this._player.isAlive) return;

    if (
      this._player.state === PLAYER_STATE.ATTACK ||
      this._player.state === PLAYER_STATE.HIT
    ) return;

    const multiplier = this._mobileRun ? 1.7 : 1.0;
    const speed = this._player.speed * multiplier;

    const vx = this._mobileVx * speed;
    const vy = this._mobileVy * speed;

    this._player.sprite.body.setVelocity(vx, vy);

    // Actualizar dirección del jugador según el eje dominante
    if (Math.abs(this._mobileVx) > Math.abs(this._mobileVy)) {
      this._player.direction = this._mobileVx > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
    } else {
      this._player.direction = this._mobileVy > 0 ? DIRECTION.DOWN : DIRECTION.UP;
    }

    // Actualizar estado
    if (this._player.state !== PLAYER_STATE.HIT && this._player.state !== PLAYER_STATE.DEFEATED) {
      this._player.state = this._mobileRun ? PLAYER_STATE.RUN : PLAYER_STATE.WALK;
    }
  }

  /**
   * Configura todas las colisiones físicas del mundo.
   * Jugador ↔ Paredes, Enemigos ↔ Paredes, Enemigos ↔ Jugador.
   */
  _setupCollisions() {
    // Jugador no puede atravesar paredes
    this.physics.add.collider(this._player.sprite, this._walls);

    // Enemigos y proyectiles no pueden atravesar paredes (registrado globalmente una vez)
    this.physics.add.collider(this._enemiesGroup, this._walls);
    this.physics.add.collider(this._projectilesGroup, this._walls, (projSprite) => {
      if (projSprite.projectileRef && !projSprite.projectileRef.isTrap) {
        projSprite.projectileRef.destroy();
      }
    });

    // Enemigos sólidos contra el jugador (evita sobreposición, empujándose mutuamente al hacer daño)
    this.physics.add.collider(
      this._player.sprite,
      this._enemiesGroup,
      (_playerSprite, enemySprite) => {
        // Solo hacer daño si el enemigo tiene contactDamage activo y está vivo
        if (enemySprite.enemyRef && enemySprite.enemyRef.isAlive && enemySprite.enemyRef.contactDamage) {
          this._player.takeDamage(enemySprite.enemyRef.attack, enemySprite.enemyRef);
        }
      }
    );

    // Evitar que los enemigos se sobrepongan entre sí (se empujan y dispersan naturalmente)
    this.physics.add.collider(this._enemiesGroup, this._enemiesGroup);

    // Evitar que el jugador o enemigos caminen sobre NPCs estáticos
    if (this._npcGroup) {
      this.physics.add.collider(this._player.sprite, this._npcGroup);
      this.physics.add.collider(this._enemiesGroup, this._npcGroup);
    }

    // Proyectiles hacen daño a enemigos (registrado globalmente una vez)
    this.physics.add.overlap(
      this._projectilesGroup,
      this._enemiesGroup,
      (projSprite, enemySprite) => {
        if (enemySprite.enemyRef && enemySprite.enemyRef.isAlive && projSprite.projectileRef) {
          enemySprite.enemyRef.takeDamage(
            projSprite.projectileRef.damage,
            this._player.sprite.x,
            this._player.sprite.y
          );
          projSprite.projectileRef.destroy();
        }
      }
    );
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

      // [APRENDIZAJE]: Originalmente hacíamos filter(e => e.id !== data.enemyId) 
      // pero "id" representa el TIPO de enemigo ('virus_minor'), no un identificador único.
      // Eso causaba que si matabas un virus, TODOS los virus se borraran lógicamente
      // y se quedaran congelados. Al filtrar solo por e.isAlive, evitamos ese bug de instanciación.
      this._enemies = this._enemies.filter(e => e.isAlive);
    });

    if (!this._isBossRoom) {
      this.events.once(EVENTS.QUEST_COMPLETED, () => {
        this._spawnDoor();
      });
    }
  }

  // ============================================================
  // MÉTODOS PRIVADOS: GESTIÓN DE JEFES Y ENEMIGOS
  // ============================================================

  _spawnDoor() {
    console.log('[WorldScene] Aparece la puerta a la Sala del Jefe.');
    const doorX = MAP_WIDTH_PX - TILE_SIZE * 2;
    const doorY = MAP_HEIGHT_PX / 2;
    
    // Objeto de referencia y física para la puerta
    this._door = this.physics.add.sprite(doorX, doorY, null);
    this._door.setDisplaySize(TILE_SIZE * 2, TILE_SIZE * 4);
    
    // Gráfico de la puerta
    this.add.rectangle(doorX, doorY, TILE_SIZE * 2, TILE_SIZE * 4, 0xF1C40F).setDepth(DEPTH_OBJECTS); // Puerta dorada
    
    // Ahora no usamos overlap automático. Se verificará al presionar 'W' en _tryInteract().
  }

  _enterBossRoom() {
    console.log('[WorldScene] Transicionando a la Sala del Jefe...');
    
    // Punto de guardado automático (Fase 7)
    SaveSystem.save({
      guardianId: this._guardianId,
      isBossRoom: true
    });

    this.scene.stop(SCENE.UI);
    // Reiniciar escena con isBossRoom = true
    this.scene.restart({ guardianId: this._guardianId, isBossRoom: true });
    this.scene.launch(SCENE.UI);
  }

  _spawnBoss() {
    const bossesData = this.cache.json.get('bosses');
    if (!bossesData || bossesData.length === 0) return;

    // Spawnear al jefe en el centro de la sala
    const data = bossesData[0];
    const spawnX = MAP_WIDTH_PX / 2;
    const spawnY = MAP_HEIGHT_PX / 2;

    this._boss = new Boss(this, data, spawnX, spawnY);
    this._boss.setTarget(this._player);
    
    // Agregar al grupo de enemigos para heredar colisiones y overlaps
    if (this._enemiesGroup) {
      this._enemiesGroup.add(this._boss.sprite);
    }
    
    // Escuchar cuando el jefe muere para la victoria
    this.events.once(EVENTS.BOSS_DIED, () => {
      this.time.delayedCall(2000, () => {
        // Pausar y transicionar
        this.scene.stop(SCENE.UI);
        this.scene.start(SCENE.VICTORY);
      });
    });
  }

  /**
   * Crea un enemigo específico en unas coordenadas
   */
  _spawnMinion(x, y, enemyId) {
    const enemiesData = this.cache.json.get('enemies');
    const data = enemiesData.find(e => e.id === enemyId);
    if (!data) return;

    const enemy = new Enemy(this, data, x, y);
    enemy.setTarget(this._player);
    this._enemies.push(enemy);

    if (this._enemiesGroup) {
      this._enemiesGroup.add(enemy.sprite);
    }
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

    // Revisar al jefe si existe en la escena
    if (this._boss && this._boss.isAlive) {
      const distBoss = Phaser.Math.Distance.Between(hitX, hitY, this._boss.sprite.x, this._boss.sprite.y);
      // El jefe es más grande, damos un poco más de margen al rango
      if (distBoss <= range + 48) {
        this._boss.takeDamage(damage, px, py);
        console.log(`[WorldScene] ¡Golpe Crítico! ${this._player.name} → ${this._boss.bossName}`);
      }
    }
  }

  /**
   * Maneja el disparo de proyectiles (Fase 9).
   */
  _handleSkill() {
    if (!this._player || !this._player.isAlive) return;

    // Solo Lynfa dispara en esta versión
    if (this._player.id !== 'lynfa') {
      console.log('[WorldScene] El guardián actual no tiene habilidad de disparo.');
      return;
    }

    // Intentar gastar 10 de Energía
    if (this._player.useEnergy(10)) {
      const damage = 25; // Daño fijo acordado (Habilidad 1 y 2)
      
      // Si el jugador está presionando alguna flecha, es una Ráfaga, si no, es una Trampa
      const isAiming = this._cursors.up.isDown || this._cursors.down.isDown || this._cursors.left.isDown || this._cursors.right.isDown;
      const isTrap = !isAiming;
      
      const projColor = isTrap ? 0x2ECC71 : 0x3498DB; // Verde para trampa, azul para ráfaga

      // Si no es una trampa, adelantamos el punto de spawn del proyectil para que salga por el frente
      // del personaje (18px de offset en la dirección que mira) en lugar del centro absoluto de su cuerpo.
      let spawnX = this._player.sprite.x;
      let spawnY = this._player.sprite.y;
      
      if (!isTrap) {
        const offset = 18;
        switch (this._player.direction) {
          case 'up':    spawnY -= offset; break;
          case 'down':  spawnY += offset; break;
          case 'left':  spawnX -= offset; break;
          case 'right': spawnX += offset; break;
        }
      }

      const proj = new Projectile(
        this,
        spawnX,
        spawnY,
        this._player.direction,
        damage,
        projColor,
        isTrap
      );

      this._projectiles.push(proj);
      this._projectilesGroup.add(proj.sprite);
      proj.fire(); // Disparar después de agregarlo al grupo

      const skillName = isTrap ? 'Trampa de Anticuerpos' : 'Ráfaga de Anticuerpos';
      console.log(`[WorldScene] ¡Lynfa usó ${skillName}! (EN: ${this._player.energy})`);
    } else {
      console.log('[WorldScene] Energía insuficiente para usar la habilidad.');
    }
  }

  _tryInteract() {
    const INTERACT_RANGE = 64; // TILE_SIZE * 2

    // 1. Interacción con la Puerta del Jefe
    if (this._door) {
      const distToDoor = Phaser.Math.Distance.Between(
        this._player.sprite.x, this._player.sprite.y,
        this._door.x, this._door.y
      );
      if (distToDoor <= INTERACT_RANGE) {
        this._enterBossRoom();
        return; // Salir para no interactuar con el NPC si estuviera cerca
      }
    }

    // 2. Interacción con NPCs
    if (!this._npc) return;

    const dist = Phaser.Math.Distance.Between(
      this._player.sprite.x, this._player.sprite.y,
      this._npc.x, this._npc.y
    );


    if (dist <= INTERACT_RANGE) {
      console.log('[WorldScene] Dialogando con NPC...');
      // Pausar el mundo para que el jugador y enemigos no se muevan
      this.scene.pause();

      let dialogueId = '0001_start';
      if (this._questSystem.hasCompletedQuest('quest_clean_lymph_node')) {
        dialogueId = '0001_completed';
      } else if (this._questSystem.hasQuest('quest_clean_lymph_node')) {
        dialogueId = '0001_in_progress';
      }

      // Lanzar escena de diálogo con el ID del NPC correspondiente al estado de la misión
      this.scene.launch(SCENE.DIALOGUE, { dialogueId });
    } else {
      console.log('[WorldScene] No hay nada cerca para interactuar.');
    }
  }


}

export default WorldScene;

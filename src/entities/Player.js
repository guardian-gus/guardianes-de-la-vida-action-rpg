// ============================================================
// Player.js
// Descripción: Clase que representa al jugador (Guardián).
//   Maneja stats, estado, movimiento y recibir daño.
//   Los valores base se cargan desde guardians.json — no hay
//   números mágicos aquí.
//
// Fase 2: Clase funcional con formas geométricas (sin sprites).
// Fase 3: Se conectará con Tiled y animaciones de Aseprite.
//
// Uso:
//   const player = new Player(scene, guardianData, spawnX, spawnY);
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import {
  PLAYER_STATE,
  DIRECTION,
  DEPTH_PLAYER,
  DEPTH_EFFECTS,
  COLOR_LYNFA,
  COLOR_ERI,
  PLAYER_RUN_MULTIPLIER,
  HIT_FLASH_DURATION,
  EVENTS,
} from '../config/constants.js';

class Player {
  /**
   * @param {Phaser.Scene} scene       - La escena donde vive el jugador.
   * @param {Object}       data        - Datos del guardián desde guardians.json.
   * @param {number}       x           - Posición X de spawn en píxeles.
   * @param {number}       y           - Posición Y de spawn en píxeles.
   */
  constructor(scene, data, x, y) {
    this._scene = scene;

    // --- STATS BASE (desde guardians.json) ---
    this.id        = data.id;
    this.name      = data.name;
    this.role      = data.role;
    this.maxHp     = data.maxHp;
    this.hp        = data.maxHp;       // Empieza con vida completa
    this.maxEnergy = data.maxEnergy;
    this.energy    = data.maxEnergy;   // Empieza con energía completa
    this.speed     = data.speed;
    this.attack    = data.attack;
    this.defense   = data.defense;
    this.level     = 1;
    this.xp        = 0;
    this.xpToNext  = 100;              // XP para subir al nivel 2

    // Datos de habilidades (para uso en Fase 4)
    this.basicAttackData = data.basicAttack;
    this.skillData       = data.skill;

    // --- ESTADO ---
    this.state     = PLAYER_STATE.IDLE;
    this.direction = DIRECTION.DOWN;
    this.isAlive   = true;

    // Temporizador de invulnerabilidad al recibir daño
    this._invulnTimer = 0;
    this._invulnDuration = 600; // ms invulnerable después de recibir golpe

    // Temporizador de cooldown del ataque básico
    this._attackCooldown = 0;

    // Elegir el color del placeholder según el guardián
    const placeholderColor = this.id === 'eri' ? COLOR_ERI : COLOR_LYNFA;

    // --- SPRITE DE FÍSICA (el cuerpo que usa Phaser para colisiones) ---
    // null = sin imagen todavía; usamos un rectángulo dibujado sobre él.
    this.sprite = scene.physics.add.sprite(x, y, null);
    this.sprite.setDisplaySize(24, 32);
    this.sprite.body.setSize(20, 28);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(DEPTH_PLAYER);

    // Referencia inversa para recuperar el Player desde el sprite
    // (útil en callbacks de colisión)
    this.sprite.playerRef = this;

    // --- GRÁFICO PLACEHOLDER ---
    this._graphic = scene.add.graphics();
    this._color   = placeholderColor;
    this._drawGraphic(x, y);

    // --- ETIQUETA DE NOMBRE (debug, se elimina cuando haya sprites) ---
    this._label = scene.add.text(x, y - 22, this.name, {
      fontFamily: 'monospace',
      fontSize:   '4px',
      color:      '#FFFFFF',
    }).setOrigin(0.5).setDepth(DEPTH_PLAYER);

    console.log(`[Player] ${this.name} (${this.role}) creada — HP: ${this.hp}/${this.maxHp}`);
  }

  // ============================================================
  // MÉTODOS PÚBLICOS
  // ============================================================

  /**
   * Procesa el movimiento del jugador en cada frame.
   * Recibe las teclas de dirección y la tecla de correr.
   * @param {Phaser.Types.Input.Keyboard.CursorKeys} cursors - Flechas.
   * @param {Phaser.Input.Keyboard.Key}              keyRun  - Tecla de correr (S).
   */
  handleMovement(cursors, keyRun) {
    // No se puede mover si está derrotado o atacando
    if (!this.isAlive) return;
    if (this.state === PLAYER_STATE.ATTACK) return;

    const body  = this.sprite.body;
    const isRunning = keyRun.isDown;
    const currentSpeed = isRunning
      ? this.speed * PLAYER_RUN_MULTIPLIER
      : this.speed;

    // Resetear velocidad para evitar deslizamiento
    body.setVelocity(0, 0);

    let movingX = false;
    let movingY = false;

    if (cursors.left.isDown) {
      body.setVelocityX(-currentSpeed);
      this.direction = DIRECTION.LEFT;
      movingX = true;
    } else if (cursors.right.isDown) {
      body.setVelocityX(currentSpeed);
      this.direction = DIRECTION.RIGHT;
      movingX = true;
    }

    if (cursors.up.isDown) {
      body.setVelocityY(-currentSpeed);
      this.direction = DIRECTION.UP;
      movingY = true;
    } else if (cursors.down.isDown) {
      body.setVelocityY(currentSpeed);
      this.direction = DIRECTION.DOWN;
      movingY = true;
    }

    // Normalizar velocidad diagonal para que no sea más rápido
    if (movingX && movingY) {
      body.velocity.normalize().scale(currentSpeed);
    }

    // Actualizar estado del jugador según si se mueve o no
    const isMoving = movingX || movingY;
    if (this.state !== PLAYER_STATE.HIT) {
      if (!isMoving) {
        this.state = PLAYER_STATE.IDLE;
      } else {
        this.state = isRunning ? PLAYER_STATE.RUN : PLAYER_STATE.WALK;
      }
    }
  }

  /**
   * Actualiza el gráfico placeholder y los temporizadores.
   * Se llama en cada frame desde WorldScene.update().
   * @param {number} delta - Ms desde el último frame.
   */
  update(delta) {
    if (!this.isAlive) return;

    // Reducir temporizadores activos
    if (this._invulnTimer > 0) this._invulnTimer -= delta;
    if (this._attackCooldown > 0) this._attackCooldown -= delta;

    // Salir del estado HIT cuando termina la invulnerabilidad
    if (this.state === PLAYER_STATE.HIT && this._invulnTimer <= 0) {
      this.state = PLAYER_STATE.IDLE;
      // Restaurar visibilidad (el flash lo pone invisible brevemente)
      this._graphic.setAlpha(1);
    }

    // Actualizar posición del gráfico y la etiqueta
    this._drawGraphic(this.sprite.x, this.sprite.y);
    this._label.setPosition(this.sprite.x, this.sprite.y - 22);
  }

  /**
   * Aplica daño al jugador.
   * Si ya es invulnerable (recién golpeado), ignora el daño.
   * @param {number} amount   - Cantidad de daño a recibir.
   * @param {Object} attacker - El enemigo que atacó (para knockback futuro).
   * @returns {boolean} true si recibió daño, false si era invulnerable.
   */
  takeDamage(amount, attacker = null) {
    // Ignorar daño si ya fue golpeado recientemente
    if (this._invulnTimer > 0) return false;
    if (!this.isAlive) return false;

    // Aplicar defensa: reducir el daño recibido
    const effectiveDamage = Math.max(1, amount - this.defense);
    this.hp = Math.max(0, this.hp - effectiveDamage);

    // Activar invulnerabilidad temporal
    this._invulnTimer = this._invulnDuration;
    this.state = PLAYER_STATE.HIT;

    // Flash visual de daño (parpadeo rojo)
    this._flashDamage();

    console.log(`[Player] ${this.name} recibió ${effectiveDamage} daño. HP: ${this.hp}/${this.maxHp}`);

    // Emitir evento para que el HUD actualice la barra de vida
    this._scene.events.emit(EVENTS.PLAYER_HP_CHANGED, {
      current: this.hp,
      max:     this.maxHp,
    });

    // Verificar si el jugador murió
    if (this.hp <= 0) {
      this._onDefeated();
    }

    return true;
  }

  /**
   * Gasta energía del jugador (para habilidades).
   * @param {number} amount - Cantidad de energía a gastar.
   * @returns {boolean} true si tenía energía suficiente.
   */
  spendEnergy(amount) {
    if (this.energy < amount) return false;

    this.energy = Math.max(0, this.energy - amount);

    this._scene.events.emit(EVENTS.PLAYER_ENERGY_CHANGED, {
      current: this.energy,
      max:     this.maxEnergy,
    });

    return true;
  }

  /**
   * Recupera energía del jugador.
   * @param {number} amount - Cantidad de energía a recuperar.
   */
  restoreEnergy(amount) {
    this.energy = Math.min(this.maxEnergy, this.energy + amount);

    this._scene.events.emit(EVENTS.PLAYER_ENERGY_CHANGED, {
      current: this.energy,
      max:     this.maxEnergy,
    });
  }

  /**
   * Agrega XP al jugador y verifica si sube de nivel.
   * @param {number} amount - XP a agregar.
   */
  gainXP(amount) {
    this.xp += amount;

    this._scene.events.emit(EVENTS.PLAYER_XP_CHANGED, {
      current: this.xp,
      toNext:  this.xpToNext,
      level:   this.level,
    });

    // Verificar si sube de nivel
    if (this.xp >= this.xpToNext) {
      this._levelUp();
    }
  }

  /**
   * Emite los stats actuales al HUD (UIScene).
   * Llamar una vez al crear el jugador para inicializar el HUD.
   */
  emitStats() {
    this._scene.events.emit(EVENTS.PLAYER_HP_CHANGED, {
      current: this.hp,
      max:     this.maxHp,
    });
    this._scene.events.emit(EVENTS.PLAYER_ENERGY_CHANGED, {
      current: this.energy,
      max:     this.maxEnergy,
    });
    this._scene.events.emit(EVENTS.PLAYER_XP_CHANGED, {
      current: this.xp,
      toNext:  this.xpToNext,
      level:   this.level,
    });
  }

  /**
   * Verifica si el jugador puede atacar (cooldown terminado).
   * @returns {boolean}
   */
  canAttack() {
    return this._attackCooldown <= 0 && this.isAlive &&
      this.state !== PLAYER_STATE.HIT &&
      this.state !== PLAYER_STATE.DEFEATED;
  }

  /**
   * Inicia el cooldown del ataque básico.
   * Se llama desde CombatSystem cuando se ejecuta un ataque.
   */
  triggerAttackCooldown() {
    this._attackCooldown = this.basicAttackData.cooldown;
    this.state = PLAYER_STATE.ATTACK;

    // El estado ATTACK dura solo 200ms (se ve el swing)
    this._scene.time.delayedCall(200, () => {
      if (this.state === PLAYER_STATE.ATTACK) {
        this.state = PLAYER_STATE.IDLE;
      }
    });
  }

  /**
   * Destruye el jugador y sus gráficos. Llamar al salir de la escena.
   */
  destroy() {
    this._graphic.destroy();
    this._label.destroy();
    if (this.sprite) this.sprite.destroy();
  }

  // ============================================================
  // MÉTODOS PRIVADOS
  // ============================================================

  /**
   * Dibuja el placeholder visual del jugador en (x, y).
   * Cambia de apariencia según el estado actual.
   */
  _drawGraphic(x, y) {
    this._graphic.clear();

    // Cuerpo
    const alpha = (this.state === PLAYER_STATE.HIT) ? 0.5 : 1.0;
    this._graphic.fillStyle(this._color, alpha);
    this._graphic.fillRect(x - 10, y - 14, 20, 28);

    // Cara (círculo blanco)
    this._graphic.fillStyle(0xFFFFFF, 0.9 * alpha);
    this._graphic.fillCircle(x, y - 6, 5);

    // Indicador de dirección (puntito)
    this._graphic.fillStyle(0xFFE0FF, alpha);
    switch (this.direction) {
      case DIRECTION.UP:
        this._graphic.fillRect(x - 2, y - 14, 4, 5); break;
      case DIRECTION.DOWN:
        this._graphic.fillRect(x - 2, y + 10, 4, 5); break;
      case DIRECTION.LEFT:
        this._graphic.fillRect(x - 12, y - 2, 5, 4); break;
      case DIRECTION.RIGHT:
        this._graphic.fillRect(x + 7, y - 2, 5, 4); break;
    }

    // Si está en estado ATTACK: mostrar pequeña hitbox de ataque
    if (this.state === PLAYER_STATE.ATTACK) {
      this._graphic.fillStyle(0xFFFF00, 0.6);
      switch (this.direction) {
        case DIRECTION.UP:
          this._graphic.fillRect(x - 10, y - 28, 20, 12); break;
        case DIRECTION.DOWN:
          this._graphic.fillRect(x - 10, y + 14, 20, 12); break;
        case DIRECTION.LEFT:
          this._graphic.fillRect(x - 22, y - 10, 12, 20); break;
        case DIRECTION.RIGHT:
          this._graphic.fillRect(x + 10, y - 10, 12, 20); break;
      }
    }

    this._graphic.setDepth(DEPTH_PLAYER);
  }

  /**
   * Parpadeo visual al recibir daño.
   */
  _flashDamage() {
    // Hacer el gráfico semitransparente momentáneamente
    this._graphic.setAlpha(0.3);

    // Después de HIT_FLASH_DURATION ms, volver a normal
    this._scene.time.delayedCall(HIT_FLASH_DURATION, () => {
      // Solo restaurar si sigue vivo
      if (this.isAlive) {
        this._graphic.setAlpha(1);
      }
    });
  }

  /**
   * Maneja la subida de nivel del jugador.
   */
  _levelUp() {
    this.xp -= this.xpToNext;
    this.level += 1;

    // Escalar el XP necesario para el siguiente nivel
    this.xpToNext = Math.floor(this.xpToNext * 1.4);

    // Mejorar stats al subir de nivel
    this.maxHp     = Math.floor(this.maxHp * 1.1);
    this.hp        = this.maxHp; // Curar al subir de nivel
    this.maxEnergy = Math.floor(this.maxEnergy * 1.05);
    this.energy    = this.maxEnergy;
    this.attack    += 2;

    console.log(`[Player] ¡${this.name} subió al nivel ${this.level}!`);

    // Emitir evento de level up para el HUD
    this._scene.events.emit(EVENTS.PLAYER_LEVEL_UP, {
      level:     this.level,
      hp:        this.hp,
      maxHp:     this.maxHp,
      energy:    this.energy,
      maxEnergy: this.maxEnergy,
    });

    // Actualizar barras en el HUD
    this.emitStats();
  }

  /**
   * El jugador quedó sin vida.
   */
  _onDefeated() {
    this.isAlive = false;
    this.state   = PLAYER_STATE.DEFEATED;
    this.sprite.body.setVelocity(0, 0);

    console.log(`[Player] ${this.name} ha sido derrotada.`);

    // Dar 2 segundos antes de ir a Game Over
    this._scene.time.delayedCall(2000, () => {
      this._scene.scene.start('GameOverScene');
    });
  }
}

export default Player;

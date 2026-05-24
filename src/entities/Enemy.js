// ============================================================
// Enemy.js
// Descripción: Clase base para todos los enemigos del juego.
//   Cada enemigo carga sus stats desde enemies.json.
//   Tiene IA básica de persecución (comportamiento 'chase').
//   En Fase 4 se añade el combate real. En Fase 6 se añaden
//   más comportamientos (dash, disparo, patrulla).
//
// Comportamientos disponibles en Fase 2:
//   'chase' — perseguir al jugador directamente
//   'idle'  — quieto (para debug)
//
// Uso:
//   const enemy = new Enemy(scene, data, x, y);
//   enemy.setTarget(player);
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import {
  DEPTH_ENEMIES,
  DEPTH_EFFECTS,
  COLOR_ENEMY,
  HIT_FLASH_DURATION,
  KNOCKBACK_DURATION,
  KNOCKBACK_SPEED,
  EVENTS,
} from '../config/constants.js';

class Enemy {
  /**
   * @param {Phaser.Scene} scene - La escena donde existe el enemigo.
   * @param {Object}       data  - Datos del enemigo desde enemies.json.
   * @param {number}       x     - Posición X inicial en píxeles.
   * @param {number}       y     - Posición Y inicial en píxeles.
   */
  constructor(scene, data, x, y) {
    this._scene = scene;

    // --- STATS (desde enemies.json) ---
    this.id            = data.id;
    this.name          = data.name;
    this.maxHp         = data.maxHp;
    this.hp            = data.maxHp;
    this.speed         = data.speed;
    this.attack        = data.attack;
    this.defense       = data.defense || 0;
    this.xpReward      = data.xp;
    this.behavior      = data.behavior || 'chase';
    this.contactDamage = data.contactDamage || false;

    // --- ESTADO ---
    this.isAlive       = true;
    this._isKnockedBack = false;

    // Temporizador de knockback
    this._knockbackTimer = 0;

    // Rango de detección del jugador (a partir de aquí empieza a perseguir)
    // Los enemigos "dormidos" fuera de rango ahorran CPU.
    this._detectionRange = 200; // px

    // Referencia al objetivo (el jugador) — se asigna con setTarget()
    this._target = null;

    // --- SPRITE DE FÍSICA ---
    this.sprite = scene.physics.add.sprite(x, y, null);
    this.sprite.setDisplaySize(24, 24);
    this.sprite.body.setSize(22, 22);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(DEPTH_ENEMIES);

    // Referencia inversa (útil en callbacks de colisión en WorldScene)
    this.sprite.enemyRef = this;

    // --- GRÁFICO PLACEHOLDER ---
    // El color varía levemente por tipo de enemigo
    this._color   = this._getColorByType();
    this._graphic = scene.add.graphics();
    this._drawGraphic(x, y);

    // --- BARRA DE VIDA (pequeña, encima del enemigo) ---
    this._hpBarBg = scene.add.rectangle(x, y - 18, 24, 3, 0x333333)
      .setDepth(DEPTH_ENEMIES + 1);
    this._hpBarFill = scene.add.rectangle(x - 12, y - 18, 24, 3, 0xE74C3C)
      .setOrigin(0, 0.5)
      .setDepth(DEPTH_ENEMIES + 2);

    // Etiqueta del nombre (debug)
    this._label = scene.add.text(x, y - 22, this.name, {
      fontFamily: 'monospace',
      fontSize:   '4px',
      color:      '#AAFFAA',
    }).setOrigin(0.5).setDepth(DEPTH_ENEMIES + 2);
  }

  // ============================================================
  // MÉTODOS PÚBLICOS
  // ============================================================

  /**
   * Asigna el objetivo al que el enemigo debe perseguir.
   * @param {Player} player - La instancia de Player.js
   */
  setTarget(player) {
    this._target = player;
  }

  /**
   * Actualiza la IA y el gráfico del enemigo cada frame.
   * @param {number} delta - Ms desde el último frame.
   */
  update(delta) {
    if (!this.isAlive) return;

    // Actualizar temporizador de knockback
    if (this._knockbackTimer > 0) {
      this._knockbackTimer -= delta;
      if (this._knockbackTimer <= 0) {
        this._isKnockedBack = false;
        // Limpiar el knockback retomando el comportamiento normal
      }
    }

    // Ejecutar comportamiento de IA (si tiene objetivo asignado)
    if (this._target && !this._isKnockedBack) {
      this._runBehavior();
    } else if (!this._target) {
      // Sin objetivo: quedarse quieto
      this.sprite.body.setVelocity(0, 0);
    }

    // Actualizar gráficos en la posición actual del sprite
    this._drawGraphic(this.sprite.x, this.sprite.y);
    this._updateHPBar(this.sprite.x, this.sprite.y);
    this._label.setPosition(this.sprite.x, this.sprite.y - 22);
  }

  /**
   * El enemigo recibe daño.
   * @param {number} amount    - Daño recibido.
   * @param {number} fromX     - X del atacante (para dirección del knockback).
   * @param {number} fromY     - Y del atacante.
   * @returns {boolean} true si el daño fue aplicado.
   */
  takeDamage(amount, fromX, fromY) {
    if (!this.isAlive) return false;

    const effectiveDamage = Math.max(1, amount - this.defense);
    this.hp = Math.max(0, this.hp - effectiveDamage);

    console.log(`[Enemy] ${this.name} recibió ${effectiveDamage} daño. HP: ${this.hp}/${this.maxHp}`);

    // Flash visual de daño
    this._flashDamage();

    // Aplicar knockback si hay posición del atacante
    if (fromX !== undefined && fromY !== undefined) {
      this._applyKnockback(fromX, fromY);
    }

    // Actualizar barra de vida
    this._updateHPBar(this.sprite.x, this.sprite.y);

    if (this.hp <= 0) {
      this._onDefeated();
    }

    return true;
  }

  /**
   * Destruye el enemigo y todos sus objetos visuales.
   */
  destroy() {
    this._graphic.destroy();
    this._hpBarBg.destroy();
    this._hpBarFill.destroy();
    this._label.destroy();
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
  }

  // ============================================================
  // MÉTODOS PRIVADOS — IA
  // ============================================================

  /**
   * Ejecuta el comportamiento de IA según this.behavior.
   * En Fase 2 solo existe 'chase'.
   * En Fase 6 se añadirán: 'patrol', 'dash', 'ranged'.
   */
  _runBehavior() {
    if (!this._target || !this._target.isAlive) {
      this.sprite.body.setVelocity(0, 0);
      return;
    }

    const dist = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y,
      this._target.sprite.x, this._target.sprite.y
    );

    switch (this.behavior) {
      case 'chase':
        this._behaviorChase(dist);
        break;

      case 'idle':
      default:
        this.sprite.body.setVelocity(0, 0);
        break;
    }
  }

  /**
   * IA de persecución: mueve al enemigo directamente hacia el jugador
   * solo si está dentro del rango de detección.
   * @param {number} distToTarget - Distancia actual al objetivo.
   */
  _behaviorChase(distToTarget) {
    if (distToTarget > this._detectionRange) {
      // Fuera de rango: quedarse quieto
      this.sprite.body.setVelocity(0, 0);
      return;
    }

    // Calcular dirección hacia el objetivo
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x, this.sprite.y,
      this._target.sprite.x, this._target.sprite.y
    );

    // Aplicar velocidad en esa dirección
    const vx = Math.cos(angle) * this.speed;
    const vy = Math.sin(angle) * this.speed;
    this.sprite.body.setVelocity(vx, vy);
  }

  // ============================================================
  // MÉTODOS PRIVADOS — DAÑO Y EFECTOS
  // ============================================================

  /**
   * Empuja al enemigo en dirección contraria al atacante.
   */
  _applyKnockback(fromX, fromY) {
    const angle = Phaser.Math.Angle.Between(fromX, fromY, this.sprite.x, this.sprite.y);
    const vx = Math.cos(angle) * KNOCKBACK_SPEED;
    const vy = Math.sin(angle) * KNOCKBACK_SPEED;

    this.sprite.body.setVelocity(vx, vy);
    this._isKnockedBack  = true;
    this._knockbackTimer = KNOCKBACK_DURATION;
  }

  /**
   * Flash visual al recibir daño (el gráfico parpadea en blanco).
   */
  _flashDamage() {
    this._graphic.setAlpha(0.2);
    this._scene.time.delayedCall(HIT_FLASH_DURATION, () => {
      if (this.isAlive) this._graphic.setAlpha(1);
    });
  }

  /**
   * El enemigo muere: efectos, XP y destrucción.
   */
  _onDefeated() {
    this.isAlive = false;
    this.sprite.body.setVelocity(0, 0);

    console.log(`[Enemy] ${this.name} derrotado. +${this.xpReward} XP`);

    // Pequeño efecto de "pop" visual antes de destruir
    this._scene.tweens.add({
      targets:  this._graphic,
      alpha:    0,
      scaleX:   2,
      scaleY:   2,
      duration: 300,
      onComplete: () => {
        this.destroy();
      },
    });

    // Emitir evento para que WorldScene y QuestSystem procesen la muerte
    this._scene.events.emit(EVENTS.ENEMY_DIED, {
      enemyId:   this.id,
      xpReward:  this.xpReward,
      x:         this.sprite.x,
      y:         this.sprite.y,
    });
  }

  // ============================================================
  // MÉTODOS PRIVADOS — VISUALES
  // ============================================================

  /**
   * Dibuja el placeholder visual del enemigo.
   * Círculo verde con variaciones por tipo.
   */
  _drawGraphic(x, y) {
    this._graphic.clear();

    this._graphic.fillStyle(this._color, 1);

    // Forma diferente según el tipo
    if (this.id === 'virus_minor') {
      // Virus: estrella de 8 puntas (aproximada con dos rectángulos rotados)
      this._graphic.fillCircle(x, y, 10);
      this._graphic.fillStyle(0xFFFFFF, 0.3);
      this._graphic.fillCircle(x, y, 5);

    } else if (this.id === 'bacteria_invader') {
      // Bacteria: forma ovalada (elipse)
      this._graphic.fillEllipse(x, y, 20, 26);
      this._graphic.fillStyle(0xFFFFFF, 0.2);
      this._graphic.fillEllipse(x - 3, y - 4, 8, 10);

    } else if (this.id === 'infected_cell') {
      // Célula infectada: hexágono aproximado (rectángulo con bordes)
      this._graphic.fillRect(x - 12, y - 8, 24, 16);
      this._graphic.fillRect(x - 8, y - 12, 16, 24);
      this._graphic.fillStyle(0x003300, 0.5);
      this._graphic.fillCircle(x, y, 6);

    } else {
      // Genérico
      this._graphic.fillCircle(x, y, 11);
    }

    this._graphic.setDepth(DEPTH_ENEMIES);
  }

  /**
   * Actualiza la barra de vida del enemigo.
   */
  _updateHPBar(x, y) {
    // Fondo de la barra
    this._hpBarBg.setPosition(x, y - 18);

    // Calcular ancho proporcional al HP actual
    const hpPercent = this.hp / this.maxHp;
    const barWidth  = 24 * hpPercent;

    // Barra de vida: se achica hacia la derecha
    this._hpBarFill
      .setPosition(x - 12, y - 18)
      .setDisplaySize(Math.max(0, barWidth), 3);
  }

  /**
   * Retorna el color del placeholder según el tipo de enemigo.
   */
  _getColorByType() {
    switch (this.id) {
      case 'virus_minor':      return 0x27AE60; // Verde brillante
      case 'bacteria_invader': return 0x1E8449; // Verde oscuro
      case 'infected_cell':    return 0x7D3C98; // Violeta oscuro (célula mutada)
      default:                 return COLOR_ENEMY;
    }
  }
}

export default Enemy;

// ============================================================
// Projectile.js
// Descripción: Clase que representa un proyectil disparado.
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import Phaser from 'phaser';
import { DEPTH_EFFECTS } from '../config/constants.js';

class Projectile {
  /**
   * Crea un nuevo proyectil (Trampa o Ráfaga).
   * @param {Phaser.Scene} scene - La escena donde vive el proyectil.
   * @param {number} x - Posición X inicial.
   * @param {number} y - Posición Y inicial.
   * @param {string} direction - Dirección hacia la que apuntaba el jugador ('up', 'down', 'left', 'right').
   * @param {number} damage - Daño que inflige al explotar.
   * @param {number} color - Color hexadecimal del proyectil.
   * @param {boolean} isTrap - Si es true, el proyectil no se mueve y dura más tiempo.
   */
  constructor(scene, x, y, direction, damage, color, isTrap) {
    this.scene = scene;
    this.damage = damage;
    this.isTrap = isTrap;
    this.lifeTimer = isTrap ? 15000 : 5000; // 15s para trampa, 5s para proyectil normal
    
    // Crear el sprite físico
    this.sprite = scene.physics.add.sprite(x, y, null);
    this.sprite.setDisplaySize(20, 20);
    this.sprite.body.setSize(20, 20);
    this.sprite.setDepth(DEPTH_EFFECTS);
    this.sprite.projectileRef = this;
    
    // Dibujar gráfico cuadrado 20x20
    this.graphic = scene.add.graphics();
    this.graphic.fillStyle(color, 1);
    this.graphic.fillRect(-10, -10, 20, 20);
    this.graphic.setDepth(DEPTH_EFFECTS);

    // Guardamos la dirección para aplicarla DESPUÉS de entrar al grupo físico
    this.direction = direction;
  }

  /**
   * Aplica la velocidad al proyectil. 
   * IMPORTANTE: En Phaser, cuando haces `grupo.add(sprite)`, el grupo suele
   * reiniciar la velocidad del sprite a 0. Por eso, llamamos a este método 
   * explícitamente DESPUÉS de haber agregado el proyectil al grupo.
   */
  fire() {
    // Si es una trampa, no tiene velocidad, se queda estática.
    if (this.isTrap) return;
    
    const speed = 300;
    switch (this.direction) {
      case 'up':
        this.sprite.body.setVelocityY(-speed);
        break;
      case 'down':
        this.sprite.body.setVelocityY(speed);
        break;
      case 'left':
        this.sprite.body.setVelocityX(-speed);
        break;
      case 'right':
        this.sprite.body.setVelocityX(speed);
        break;
    }
  }

  /**
   * Actualiza el temporizador de vida y la posición gráfica del proyectil.
   * @param {number} delta - Tiempo transcurrido en milisegundos desde el último frame.
   */
  update(delta) {
    if (!this.sprite || !this.sprite.active) return;
    
    // Disminuir tiempo de vida
    this.lifeTimer -= delta;
    if (this.lifeTimer <= 0) {
      this.destroy(); // Se destruye automáticamente al acabar su tiempo
      return;
    }

    // El gráfico visual debe perseguir al sprite invisible de físicas
    this.graphic.setPosition(this.sprite.x, this.sprite.y);
  }

  /**
   * Limpia y destruye todos los elementos visuales y físicos del proyectil.
   */
  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
    if (this.graphic) {
      this.graphic.destroy();
    }
  }
}

export default Projectile;

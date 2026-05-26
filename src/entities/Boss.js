import Phaser from 'phaser';
import Enemy from './Enemy.js';
import { EVENTS } from '../config/constants.js';

class Boss extends Enemy {
  constructor(scene, data, x, y) {
    // El jefe pasa la misma data base a Enemy
    super(scene, data, x, y);

    this.bossName = data.name; // Alias para compatibilidad con código antiguo
    this.baseSpeed = data.speed;

    // Fases
    this.phasesConfig = data.phases;
    this.currentPhase = 1;

    // Estados
    this.currentState = 'idle';
    this.lastActionTime = 0;
    
    // Cambiamos el color usando la clase padre
    this._color = parseInt(data.color, 16) || 0xE67E22;
    this._hasDrawn = false; // Reset flag to redraw with Boss color on next frame
    
    // Ajustar el cuerpo físico del jefe para coincidir exactamente con su tamaño visual de 96x96
    // Esto asegura que los proyectiles y golpes hagan contacto exactamente al primer toque con la caja visual.
    // Usamos el espacio de textura (32x32) con compensación de escala 3x para un alineamiento del 100% exacto.
    if (this.sprite && this.sprite.body) {
      const scaleX = this.sprite.scaleX || 1;
      const scaleY = this.sprite.scaleY || 1;

      const worldTargetWidth = 96;
      const worldTargetHeight = 96;

      const textureWidth = worldTargetWidth / scaleX;   // 96 / 3 = 32
      const textureHeight = worldTargetHeight / scaleY; // 96 / 3 = 32

      const offsetX = (this.sprite.width - textureWidth) / 2;   // (32 - 32)/2 = 0
      const offsetY = (this.sprite.height - textureHeight) / 2; // (32 - 32)/2 = 0

      this.sprite.body.setSize(textureWidth, textureHeight);
      this.sprite.body.setOffset(offsetX, offsetY);
      this.sprite.body.setPushable(false); // Jefe inmóvil frente a empujes del jugador
    }
    
    // Emitir evento de que apareció
    this._scene.events.emit(EVENTS.BOSS_SPAWNED, {
      name: this.name,
      hp: this.hp,
      maxHp: this.maxHp
    });
  }

  // Sobrescribimos update para inyectar nuestra IA
  update(time, delta) {
    // Llamar al update original no nos sirve al 100% porque el jefe tiene IA diferente,
    // pero sí queremos actualizar las posiciones de la barra y el gráfico.
    if (!this.isAlive || !this._target || this.currentState === 'hit' || this.currentState === 'defeated') {
      return;
    }

    const dist = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this._target.sprite.x, this._target.sprite.y);

    switch(this.currentPhase) {
      case 1:
        this._updatePhase1(time, dist);
        break;
      case 2:
        this._updatePhase2(time, dist);
        break;
      case 3:
        this._updatePhase3(time, dist);
        break;
    }

    // Actualizar gráficos heredados usando nuestro nuevo centro
    this._drawGraphic(this.sprite.x, this.sprite.y);
    const hpYOffset = (this.height / 2) + 6;
    this._hpBarBg.setPosition(this.sprite.x, this.sprite.y - hpYOffset);
    this._hpBarFill.setPosition(this.sprite.x - (this.width/2), this.sprite.y - hpYOffset);
    this._label.setPosition(this.sprite.x, this.sprite.y - hpYOffset - 10);
  }

  // --- Fase 1: Perseguir y golpear (Matón) ---
  _updatePhase1(time, dist) {
    if (dist < 400) {
      this._scene.physics.moveToObject(this.sprite, this._target.sprite, this.baseSpeed);
    } else {
      this.sprite.body.setVelocity(0, 0);
    }
  }

  // --- Fase 2: Huir e Invocar (Invocador) ---
  _updatePhase2(time, dist) {
    if (dist < 300) {
      const angle = Phaser.Math.Angle.Between(this._target.sprite.x, this._target.sprite.y, this.sprite.x, this.sprite.y);
      this._scene.physics.velocityFromRotation(angle, this.baseSpeed * 0.8, this.sprite.body.velocity);
    } else {
      this.sprite.body.setVelocity(0, 0);
    }

    if (time > this.lastActionTime + 5000) {
      this.lastActionTime = time;
      this._summonMinions();
    }
  }

  // --- Fase 3: Embestidas agresivas (Furia Final) ---
  _updatePhase3(time, dist) {
    if (this.currentState === 'dash') {
      if (time > this.lastActionTime + 800) {
        this.currentState = 'idle';
        this.sprite.body.setVelocity(0, 0);
        this.lastActionTime = time;
      }
      return;
    }

    if (time > this.lastActionTime + 2000 && dist < 500) {
      this.currentState = 'dash';
      this.lastActionTime = time;
      this._scene.physics.moveToObject(this.sprite, this._target.sprite, this.baseSpeed * 3.5);
    } else if (this.currentState !== 'dash') {
      this._scene.physics.moveToObject(this.sprite, this._target.sprite, this.baseSpeed * 0.4);
    }
  }

  _summonMinions() {
    console.log('[Boss] ¡Invocando esbirros!');
    if (this._scene._spawnMinion) {
      this._scene._spawnMinion(this.sprite.x + 60, this.sprite.y + 60, 'virus_minor');
      this._scene._spawnMinion(this.sprite.x - 60, this.sprite.y - 60, 'virus_minor');
    }
  }

  // Sobrescribimos takeDamage para avisar al HUD y manejar fases
  takeDamage(amount, fromX, fromY) {
    // Si la clase padre lo rechaza (invulnerable, muerto, etc) salimos
    if (!super.takeDamage(amount, fromX, fromY)) return false;

    // Avisar al UI
    this._scene.events.emit(EVENTS.BOSS_HP_CHANGED, { current: this.hp, max: this.maxHp });

    if (this.hp === 0) return true; // El padre ya llama a _onDefeated() que sobreescribiremos

    // Verificar cambio de fase
    const hpRatio = this.hp / this.maxHp;
    if (this.currentPhase === 1 && hpRatio <= this.phasesConfig.phase2_threshold) {
      this._changePhase(2);
    } else if (this.currentPhase === 2 && hpRatio <= this.phasesConfig.phase3_threshold) {
      this._changePhase(3);
    }
    return true;
  }

  _changePhase(newPhase) {
    this.currentPhase = newPhase;
    console.log(`[Boss] ¡Cambio a Fase ${newPhase}!`);
    this._scene.cameras.main.shake(200, 0.01);
    
    if (newPhase === 3) {
      this._color = 0xC0392B; // Se vuelve rojo furioso
      this._hasDrawn = false; // Force redraw with new phase 3 color
      this.baseSpeed *= 1.5;
    }
  }

  // Sobrescribimos _onDefeated
  _onDefeated() {
    this.currentState = 'defeated';
    this.sprite.body.setVelocity(0, 0);
    this._scene.physics.world.disable(this.sprite);

    this._color = 0x555555;
    this._hasDrawn = false; // Force redraw with defeated gray color
    console.log(`[Boss] ¡${this.name} ha sido derrotado!`);

    this._scene.events.emit(EVENTS.BOSS_DIED);
    this._scene.events.emit(EVENTS.ENEMY_DIED, { enemyId: this.id, xpReward: this.xpReward });

    this._scene.tweens.add({
      targets: [this.sprite, this._graphic, this._hpBarBg, this._hpBarFill, this._label],
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        this.sprite.destroy();
        this._graphic.destroy();
        this._hpBarBg.destroy();
        this._hpBarFill.destroy();
        this._label.destroy();
      }
    });
  }
}

export default Boss;

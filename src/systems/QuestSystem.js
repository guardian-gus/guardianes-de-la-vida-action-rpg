// ============================================================
// QuestSystem.js
// Descripción: Sistema independiente que administra las misiones.
//   Carga misiones desde quests.json, rastrea el progreso de
//   objetivos (ej. enemigos derrotados) y otorga recompensas.
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

import { EVENTS } from '../config/constants.js';

class QuestSystem {
  /**
   * @param {Phaser.Scene} scene - La escena donde opera (usualmente WorldScene)
   * @param {Array} questsData - Los datos parseados de quests.json
   */
  constructor(scene, questsData) {
    this._scene = scene;
    
    // Convertir el array de misiones en un diccionario (id -> data)
    this._questsDB = {};
    if (questsData && Array.isArray(questsData)) {
      questsData.forEach(q => {
        this._questsDB[q.id] = q;
      });
    } else {
      console.warn('[QuestSystem] No se recibieron datos válidos de quests.json');
    }

    this._activeQuest = null;
    this._completedQuests = []; // Memoria de misiones completadas
    this._globalKills = {}; // Memoria de enemigos derrotados (crédito retroactivo)

    // Escuchar eventos globales del juego para progreso de misión
    this._scene.events.on(EVENTS.ENEMY_DIED, this._onEnemyDied, this);
  }

  /**
   * Inicia una misión por su ID.
   * @param {string} questId 
   */
  startQuest(questId) {
    if (this._activeQuest && this._activeQuest.id === questId) {
      console.log(`[QuestSystem] La misión '${questId}' ya está activa.`);
      return;
    }

    const questData = this._questsDB[questId];
    if (!questData) {
      console.warn(`[QuestSystem] Misión '${questId}' no encontrada.`);
      return;
    }

    // Clonar la misión para llevar el estado (current) sin alterar la BD original
    this._activeQuest = JSON.parse(JSON.stringify(questData));

    console.log(`[QuestSystem] Iniciando misión: ${this._activeQuest.title}`);
    
    // [APRENDIZAJE - Crédito Retroactivo]:
    // Si un jugador mata enemigos antes de hablar con el NPC (y por tanto, antes
    // de que inicie la misión), el sistema podría quedarse atascado por falta de enemigos.
    // Para resolverlo, _globalKills lleva una cuenta silenciosa de todo lo que muere.
    // Al iniciar la misión, revisamos esa memoria e inyectamos el progreso inicial.
    let checkInstantComplete = false;
    this._activeQuest.objectives.forEach(obj => {
      if (obj.type === 'defeat') {
        const killedBefore = this._globalKills[obj.target] || 0;
        if (killedBefore > 0) {
          obj.current = Math.min(obj.count, killedBefore);
          checkInstantComplete = true;
          console.log(`[QuestSystem] Progreso retroactivo aplicado: ${obj.label} ${obj.current}/${obj.count}`);
        }
      }
    });

    // Emitir evento para la UI
    this._scene.events.emit(EVENTS.QUEST_STARTED, this._activeQuest);

    if (checkInstantComplete) {
      this._checkCompletion();
    }
  }

  /**
   * Obtiene la misión activa actual.
   * @returns {Object|null}
   */
  getActiveQuest() {
    return this._activeQuest;
  }

  /**
   * Verifica si una misión está actualmente activa.
   */
  hasQuest(questId) {
    return this._activeQuest && this._activeQuest.id === questId;
  }

  /**
   * Verifica si una misión ya ha sido completada en el pasado.
   */
  hasCompletedQuest(questId) {
    return this._completedQuests.includes(questId);
  }

  /**
   * Fuerza el completado de una misión (útil desde diálogos).
   */
  forceCompleteQuest() {
    if (this._activeQuest) {
      this._activeQuest.objectives.forEach(obj => obj.current = obj.count);
      this._checkCompletion();
    }
  }

  /**
   * Callback cuando muere un enemigo. Revisa si pertenece a un objetivo.
   */
  _onEnemyDied(data) {
    // Registrar muerte a nivel global para el crédito retroactivo
    this._globalKills[data.enemyId] = (this._globalKills[data.enemyId] || 0) + 1;

    if (!this._activeQuest) return;

    let updated = false;

    // Revisar objetivos
    for (const obj of this._activeQuest.objectives) {
      if (obj.type === 'defeat' && obj.target === data.enemyId) {
        if (obj.current < obj.count) {
          obj.current++;
          updated = true;
          console.log(`[QuestSystem] Objetivo progreso: ${obj.label} ${obj.current}/${obj.count}`);
        }
      }
    }

    if (updated) {
      this._scene.events.emit(EVENTS.QUEST_UPDATED, this._activeQuest);
      this._checkCompletion();
    }
  }

  /**
   * Verifica si todos los objetivos de la misión activa se han cumplido.
   */
  _checkCompletion() {
    if (!this._activeQuest) return;

    const allComplete = this._activeQuest.objectives.every(obj => obj.current >= obj.count);

    if (allComplete) {
      console.log(`[QuestSystem] ¡Misión completada: ${this._activeQuest.title}!`);
      
      // Emitir evento de completado (la UI puede mostrar un banner)
      this._scene.events.emit(EVENTS.QUEST_COMPLETED, this._activeQuest);

      // Entregar recompensas al jugador
      const rewards = this._activeQuest.rewards;
      if (rewards) {
        if (rewards.xp) {
          console.log(`[QuestSystem] Recompensa: +${rewards.xp} XP`);
          // Si tuviéramos acceso directo al jugador, aquí se lo daríamos.
          // Como QuestSystem vive en WorldScene, emitiremos un evento o dejaremos que WorldScene lo procese.
        }
      }

      // Guardar en completadas
      this._completedQuests.push(this._activeQuest.id);

      // Limpiar misión activa o pasar a la siguiente
      const nextQuest = this._activeQuest.nextQuest;
      this._activeQuest = null;

      // Opcional: auto-iniciar la siguiente misión si existe
      if (nextQuest) {
        // this.startQuest(nextQuest); // Descomentar si se desea flujo encadenado automático
      }
    }
  }

  /**
   * Limpia los listeners para evitar memory leaks al cambiar de escena.
   */
  destroy() {
    this._scene.events.off(EVENTS.ENEMY_DIED, this._onEnemyDied, this);
  }
}

export default QuestSystem;

// ============================================================
// SaveSystem.js
// Descripción: Sistema estático para guardar y cargar partidas
//   usando el localStorage del navegador.
//
// Fecha: 2026-05-24 | Versión: 1.0.0
// ============================================================

const SAVE_KEY = 'guardianes_save_data';

class SaveSystem {
  /**
   * Guarda los datos de la partida en localStorage.
   * @param {Object} data - Datos a guardar (ej. { guardianId: 'lynfa', isBossRoom: true, playerHp: 100 })
   */
  static save(data) {
    try {
      const jsonString = JSON.stringify(data);
      localStorage.setItem(SAVE_KEY, jsonString);
      console.log('[SaveSystem] Partida guardada exitosamente.', data);
    } catch (error) {
      console.error('[SaveSystem] Error al guardar partida:', error);
    }
  }

  /**
   * Carga los datos de la partida desde localStorage.
   * @returns {Object|null} Los datos guardados o null si no hay nada.
   */
  static load() {
    try {
      const jsonString = localStorage.getItem(SAVE_KEY);
      if (jsonString) {
        const data = JSON.parse(jsonString);
        console.log('[SaveSystem] Partida cargada exitosamente.', data);
        return data;
      }
    } catch (error) {
      console.error('[SaveSystem] Error al cargar partida:', error);
    }
    return null;
  }

  /**
   * Verifica si existe una partida guardada.
   * @returns {boolean}
   */
  static hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  /**
   * Borra la partida guardada (útil para cuando se termina el juego).
   */
  static deleteSave() {
    localStorage.removeItem(SAVE_KEY);
    console.log('[SaveSystem] Partida borrada.');
  }
}

export default SaveSystem;

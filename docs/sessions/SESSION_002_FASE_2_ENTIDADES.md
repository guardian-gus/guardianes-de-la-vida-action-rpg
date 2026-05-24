# Sesión 002 — Fase 2: Entidades Player y Enemy

**Fecha:** 2026-05-24
**Duración estimada:** ~30 minutos
**Estado:** ✅ COMPLETADA

---

## Objetivo de la sesión

Extraer la lógica del jugador y los enemigos de `WorldScene.js` en clases
propias, conectadas a los archivos JSON de datos. Avanzar el código sin
depender de sprites definitivos.

---

## Lo que se hizo

### Nuevos archivos creados

| Archivo | Descripción |
|---------|-------------|
| `src/entities/Player.js` | Clase completa del jugador: stats desde JSON, estados, movimiento, daño, XP, level up |
| `src/entities/Enemy.js`  | Clase base de enemigos: IA de persecución, knockback, barra de vida, muerte con efecto |

### `WorldScene.js` actualizado (v2.0.0)

- Importa y usa `Player` y `Enemy` en lugar de lógica incrustada
- Carga el guardián correcto desde `guardians.json` (por `guardianId`)
- Crea 3 enemigos (uno de cada tipo) desde `enemies.json`
- Configura colisiones: jugador ↔ paredes, enemigos ↔ paredes
- Daño por contacto: enemigos dañan al jugador al tocarlo
- Controles actualizados (Z = ataque, Shift = correr, E = interactuar)
- `_handleAttack()` implementa hitbox simple frente al jugador

---

## Resultado de la verificación

Build de producción: **✅ 0 errores** (19 módulos transformados)

```
vite v8.0.14 building for production...
✓ 19 modules transformed.
✓ built in 2.23s
```

---

## Mecánicas implementadas en esta sesión

### Player.js
| Mecánica | Estado |
|----------|--------|
| Stats cargados desde `guardians.json` | ✅ |
| Movimiento en 4 direcciones con normalización diagonal | ✅ |
| Correr con Shift (×velocidad del guardián) | ✅ |
| Estados: IDLE, WALK, RUN, ATTACK, HIT, DEFEATED | ✅ |
| `takeDamage()` con defensa e invulnerabilidad temporal | ✅ |
| `gainXP()` con detección de level up | ✅ |
| `_levelUp()` — escala stats al subir de nivel | ✅ |
| Emisión de eventos al HUD (HP, Energía, XP) | ✅ |
| Flash visual al recibir daño | ✅ |
| `_onDefeated()` → GameOverScene tras 2s | ✅ |
| Indicador de dirección en el placeholder | ✅ |
| Hitbox de ataque visible en el placeholder | ✅ |

### Enemy.js
| Mecánica | Estado |
|----------|--------|
| Stats cargados desde `enemies.json` | ✅ |
| IA de persecución (`behavior: 'chase'`) | ✅ |
| Rango de detección (200px) | ✅ |
| `takeDamage()` con defensa y knockback | ✅ |
| Barra de vida mini encima del enemigo | ✅ |
| Flash visual al recibir daño | ✅ |
| Efecto de muerte (pop + fade) | ✅ |
| Emisión de evento `ENEMY_DIED` con XP | ✅ |
| Placeholder diferente por tipo (círculo, elipse, hexágono) | ✅ |

---

## Controles actualizados

| Tecla | Acción |
|-------|--------|
| ← → ↑ ↓ | Movimiento en 4 direcciones |
| Shift | Correr |
| Z | Ataque básico (hitbox frente al jugador) |
| X | Habilidad especial (Fase 4) |
| E | Interactuar con NPC (Fase 5) |
| Escape | Pausa (Fase futura) |

---

## Pendiente para la próxima sesión (Sesión 003)

1. `src/systems/SaveSystem.js` — Guardar y cargar con localStorage
2. `src/systems/QuestSystem.js` — Leer `quests.json` y rastrear objetivos
3. Activar el botón "Continuar" del menú principal cuando haya una partida guardada
4. Mostrar la misión activa en el HUD

---

## Notas técnicas

- Los controles cambiaron de ASDW → Shift+ZXE para seguir mejor el brief.
  La tecla W ya no es "habilidad" (confunde con WASD); ahora es **X**.
- La `_handleAttack()` en WorldScene es temporal; en Fase 4 pasa a `CombatSystem.js`.
- El array `this._enemies` se filtra cuando un enemigo muere para no
  seguir procesándolo en `update()`.

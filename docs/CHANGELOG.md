# CHANGELOG — Guardianes de la Vida: Misión Celular

> Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/)
> Versionado semántico: MAJOR.MINOR.PATCH

---

## [v0.1.0] — 2026-05-24 — Fase 1 completa

### Técnico
- Instalación de NVM + Node.js v24.16.0 + npm v11.13.0
- Proyecto Vite inicializado (template vanilla)
- Phaser instalado como dependencia

### Agregado — Documentación
- `docs/ROADMAP.md` — Hoja de ruta por 10 fases
- `docs/CODE_STYLE_GUIDE.md` — Convenciones de código y comentarios
- `docs/ASSETS_GUIDE.md` — Guía de sprites, tilesets y herramientas IA
- `docs/CHANGELOG.md` — Este archivo
- `docs/sessions/SESSION_001_FASE_1_BASE_TECNICA.md` — Notas de sesión

### Agregado — Código
- `src/main.js` — Punto de entrada, crea instancia de Phaser
- `src/config/constants.js` — Constantes globales (colores, tamaños, eventos, escenas)
- `src/config/gameConfig.js` — Configuración de Phaser (física arcade, escenas, pixel art)
- `src/scenes/BootScene.js` — Primera escena, configura el juego
- `src/scenes/PreloadScene.js` — Carga assets con barra de progreso animada
- `src/scenes/MenuScene.js` — Menú principal con navegación teclado/mouse/touch
- `src/scenes/WorldScene.js` — Mapa placeholder 20×15, jugador Lynfa movible, NPC
- `src/scenes/UIScene.js` — HUD: barras HP/Energía/XP, nivel, misión activa
- `src/scenes/DialogueScene.js` — Estructura base para diálogos (completa en Fase 5)
- `src/scenes/PauseScene.js` — Menú de pausa placeholder
- `src/scenes/GameOverScene.js` — Pantalla de derrota con opciones
- `src/scenes/VictoryScene.js` — Pantalla de victoria con recompensas
- `index.html` — Contenedor del juego con SEO y CSS pixel art

### Agregado — Datos JSON
- `public/data/guardians.json` — Lynfa y Eri con stats completos
- `public/data/enemies.json` — 3 enemigos básicos (Virus, Bacteria, Célula Infectada)
- `public/data/bosses.json` — Patógeno Alfa con 3 fases de comportamiento
- `public/data/dialogues.json` — 2 diálogos del Centinela Linfático
- `public/data/quests.json` — 2 misiones del primer nivel

### Verificado
- ✅ `npm run dev` funciona sin errores
- ✅ Juego carga en http://localhost:5173/
- ✅ Secuencia Boot → Preload → Menu correcta
- ✅ Todos los JSON cargados (5/5) sin advertencias
- ✅ Controles de teclado funcionando (flechas, A, S, D, W, Enter)
- ✅ Cámara sigue al jugador con suavizado
- ✅ Colisiones con paredes del mapa placeholder

---

## [v0.2.0] — 2026-05-25 — Fases 2–7 completas

### Agregado — Entidades
- `src/entities/Player.js` — Clase completa del jugador:
  - Stats cargados desde `guardians.json` (HP, energía, velocidad, ataque, defensa)
  - Movimiento en 4 direcciones con normalización diagonal
  - Estados: `idle`, `walk`, `run`, `hit`, `attack`, `defeated`
  - Cooldown de ataque, invulnerabilidad temporal, knockback desde el atacante
  - Flash visual de daño (transparencia)
  - Regeneración automática de energía en reposo (cada 2 s)
  - Sistema de XP y subida de nivel (stats escalan automáticamente)
  - Eventos Phaser hacia UIScene: `PLAYER_HP_CHANGED`, `PLAYER_ENERGY_CHANGED`, `PLAYER_XP_CHANGED`, `PLAYER_LEVEL_UP`
- `src/entities/Enemy.js` — Clase base de enemigos:
  - Stats dinámicos desde `enemies.json`
  - IA de persecución con rango de detección (200 px)
  - Knockback al recibir golpe, barra de vida pequeña visual
  - Efecto de pop al morir + emisión de XP
- `src/entities/Boss.js` — Jefe que extiende Enemy:
  - 3 fases de comportamiento (perseguir / huir+invocar / dash agresivo)
  - Umbrales de fase leídos desde `bosses.json`
  - Sacudida de cámara al cambiar de fase
  - Se vuelve rojo en fase 3 y acelera ×1.5
- `src/entities/Projectile.js` — Base para proyectiles futuros

### Agregado — Sistemas
- `src/systems/QuestSystem.js` — Sistema de misiones:
  - Carga misiones desde `quests.json`
  - Rastreo de objetivos (matar X enemigos, interactuar con objeto)
  - Crédito retroactivo: enemigos muertos antes de aceptar la misión cuentan
  - Cadena de misiones automática (`nextQuest`)
  - Eventos: `QUEST_STARTED`, `QUEST_UPDATED`, `QUEST_COMPLETED`
- `src/systems/SaveSystem.js` — Guardado con localStorage:
  - Métodos: `save()`, `load()`, `hasSave()`, `deleteSave()`
  - Botón "Continuar" en MenuScene activo si hay partida guardada

### Verificado
- ✅ Jugador se mueve, corre, ataca y recibe daño
- ✅ Enemigos persiguen y mueren correctamente
- ✅ Boss cambia de fase y emite eventos al HUD
- ✅ Misiones se inician, progresan y completan
- ✅ Datos persisten al recargar la página (localStorage)

---

## Versiones futuras

Las versiones se documentarán aquí a medida que se completen las fases.

### Formato de cada entrada:

```markdown
## [v0.1.0] - YYYY-MM-DD

### Agregado
- Nueva funcionalidad

### Cambiado
- Algo que se modificó

### Corregido
- Bug que se arregló

### Eliminado
- Algo que se quitó

### Técnico
- Cambios internos de arquitectura o configuración
```

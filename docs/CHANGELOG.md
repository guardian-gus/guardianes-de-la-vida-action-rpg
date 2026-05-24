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

## [Sin publicar — próximo]

### Fase 2 — Jugador (pendiente)
- Cargar datos de Lynfa desde guardians.json
- Estados: idle, walk, run, hit, defeated
- HP y energía actualizándose en tiempo real en el HUD

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

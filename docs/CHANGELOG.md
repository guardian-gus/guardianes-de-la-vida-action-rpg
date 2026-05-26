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

---

## [v0.3.0] — 2026-05-25 — Fase 9: Controles móviles

### Agregado — Escena
- `src/scenes/MobileControlsScene.js` — Escena Phaser superpuesta para input táctil:
  - **Joystick virtual** (esquina inferior izquierda):
    - Base fija circular con aro decorativo
    - Thumb móvil con sombra y brillo simulado
    - Zona de toque generosa (+40 px al radio) para mejor UX
    - Zona muerta de 12 px para evitar movimiento accidental
    - Clamp al radio de la base para limitar el desplazamiento
    - Normalización a rango `[-1, 1]` en X e Y (8 direcciones suaves)
  - **4 botones de acción** en layout diamante (esquina inferior derecha):
    - `W` Verde — Interactuar con NPC / entrar a sala del jefe
    - `A` Rojo — Ataque básico
    - `D` Azul — Habilidad especial (Ráfaga / Trampa)
    - `S` Naranja — Correr (hold: activo mientras se mantiene presionado)
  - **Botón de pausa** `⏸` en esquina superior derecha
  - Feedback visual en todos los botones: sombra, brillo, estado pressed/idle
  - Opacidad diferenciada: `0.55` en reposo, `0.9` al usar
  - Solo visible en dispositivos táctiles o pantalla < 1024 px
  - Se activa/desactiva dinámicamente en el evento `resize`
  - Multi-touch: joystick y botones usan `pointer.id` para no interferirse

### Modificado
- `src/config/constants.js`:
  - + `SCENE.MOBILE_CONTROLS: 'MobileControlsScene'`
  - + 11 eventos `EVENTS.MOBILE_*` para comunicación entre escenas
- `src/config/gameConfig.js`:
  - + import y registro de `MobileControlsScene` en la lista de escenas
- `src/scenes/WorldScene.js`:
  - + propiedad `_mobileVx`, `_mobileVy`, `_mobileRun` en el constructor
  - + `_setupMobileControls()` — lanza la escena y suscribe los 6 eventos móviles
  - + `_applyMobileMovement()` — traduce `vx/vy` normalizados a velocidad física
  - + `_getImportedEnums()` — helper para acceder a constantes de estado sin re-importar
  - `update()` — ahora elige entre `_applyMobileMovement()` y `handleMovement()` según input activo

### Técnico
- Arquitectura de comunicación por **eventos Phaser** (sin referencia directa entre escenas):
  - `MobileControlsScene` → emite en el bus de `WorldScene` → `WorldScene` escucha y actúa
  - Patrón: `scene.get(SCENE.WORLD).events.emit(eventName, data)`
- El teclado y el joystick coexisten: si `_mobileVx === 0 && _mobileVy === 0`, se usa el teclado

### Verificado
- ✅ Controles táctiles visibles en pantalla < 1024 px
- ✅ Joystick mueve al jugador en 8 direcciones
- ✅ Botón S (Correr) funciona como hold táctil
- ✅ Botones A, D, W ejecutan las mismas acciones que el teclado
- ✅ Teclado y joystick no se interfieren

---

## [v0.4.0] — 2026-05-25 — Fase 10: Publicación en GitHub Pages

### Agregado
- `vite.config.js` — Configuración de Vite:
  - `base: '/guardianes-de-la-vida-action-rpg/'` para GitHub Pages
  - `build.outDir: 'dist'` con `emptyOutDir: true`
- `.github/workflows/deploy.yml` — GitHub Actions CI/CD:
  - Se ejecuta en cada `push` a `main` y manualmente vía `workflow_dispatch`
  - Node.js 20 con caché de npm (`npm ci`)
  - Build con `npm run build` → publica `dist/` en rama `gh-pages`
  - Usa `JamesIves/github-pages-deploy-action@v4`
- `README.md` — Documentación pública del proyecto:
  - URL de la demo, controles (teclado y móvil), estructura del proyecto
  - Tabla de guardianes y enemigos, estado de las fases, tecnologías

### Modificado
- `package.json` — Nombre corregido de `guardianes_rpg_temp` → `guardianes-de-la-vida-action-rpg`

### Verificado
- ✅ `npm run build` genera `dist/` sin errores en 3.55 s
- ✅ Workflow de GitHub Actions se ejecuta al hacer push
- ✅ Página publicada en https://guardian-gus.github.io/guardianes-de-la-vida-action-rpg/

---

## [v0.4.1] — 2026-05-25 — Fix: rutas de JSON en GitHub Pages

### Corregido
- `src/scenes/PreloadScene.js` — Las 5 rutas de carga de JSON usaban rutas
  absolutas (`/data/guardians.json`) que fallan en GitHub Pages porque la
  URL base no es `/` sino `/guardianes-de-la-vida-action-rpg/`.

  **Solución:** Usar `import.meta.env.BASE_URL` que Vite inyecta correctamente
  en cada entorno:
  ```js
  // ❌ Antes
  this.load.json('guardians', '/data/guardians.json');

  // ✅ Ahora
  const base = import.meta.env.BASE_URL;
  this.load.json('guardians', `${base}data/guardians.json`);
  ```
  - En desarrollo local: `BASE_URL = '/'` → ruta: `/data/guardians.json`
  - En GitHub Pages: `BASE_URL = '/guardianes-de-la-vida-action-rpg/'` → ruta correcta

### Síntoma del bug
- El menú principal cargaba correctamente (el JS del bundle sí usaba el base path)
- Al hacer clic en "INICIAR" el juego se quedaba congelado sin transicionar a WorldScene
- Los JSON devolvían HTTP 404 → `cache.json.get('guardians')` retornaba `null`
- WorldScene no encontraba el guardián y abortaba silenciosamente en `create()`

### Verificado
- ✅ Demo funcional en https://guardian-gus.github.io/guardianes-de-la-vida-action-rpg/
- ✅ Todos los JSON cargan correctamente en producción (5/5)

---

## Versiones futuras

Las próximas versiones cubrirán:
- `v0.5.0` — Fase 8: Arte pixel art (sprites de Lynfa, enemigos, tileset)
- `v0.6.0` — Segundo guardián jugable (Eri)
- `v0.7.0` — Segundo mapa del cuerpo humano

### Formato de cada entrada:

```markdown
## [v0.x.0] - YYYY-MM-DD

### Agregado
- Nueva funcionalidad

### Cambiado
- Algo que se modificó

### Corregido
- Bug que se arregló

### Técnico
- Cambios internos de arquitectura o configuración
```

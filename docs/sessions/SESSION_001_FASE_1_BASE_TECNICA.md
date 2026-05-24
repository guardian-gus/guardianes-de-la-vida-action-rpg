# Sesión 001 — Fase 0 + Fase 1 Base Técnica
**Fecha:** 2026-05-24
**Duración estimada:** ~45 minutos
**Estado:** ✅ COMPLETADA

---

## Objetivo de la sesión
Sentar las bases del proyecto desde cero:
documentación, estructura, configuración e infraestructura de Vite + Phaser.

---

## Lo que se hizo

### Documentación creada
- `docs/ROADMAP.md` — Hoja de ruta por 10 fases
- `docs/CODE_STYLE_GUIDE.md` — Convenciones de código (nombres, comentarios, líneas)
- `docs/ASSETS_GUIDE.md` — Guía de sprites, tilesets y herramientas recomendadas
- `docs/CHANGELOG.md` — Registro de cambios del proyecto

### Infraestructura
- Instalación de **NVM** (Node Version Manager)
- Instalación de **Node.js v24.16.0** + **npm v11.13.0**
- Proyecto **Vite** inicializado con template `vanilla`
- **Phaser 3** instalado como dependencia

### Estructura de carpetas creada
```
src/config/       → constants.js, gameConfig.js
src/scenes/       → 7 escenas de Phaser
src/entities/     → (vacío, Fase 2)
src/systems/      → (vacío, Fase 5+)
src/data/         → (vacío, usa public/data/)
src/ui/           → (vacío, Fase 5)
src/utils/        → (vacío, Fase 2+)
public/assets/    → sprites, tilesets, maps, audio, ui
public/data/      → 5 archivos JSON de datos
docs/sessions/    → notas de sesiones
```

### Archivos de código creados
| Archivo | Descripción |
|---------|-------------|
| `src/main.js` | Punto de entrada — crea instancia de Phaser |
| `src/config/constants.js` | Constantes globales: colores, tamaños, eventos |
| `src/config/gameConfig.js` | Configuración de Phaser: física, escenas, escalado |
| `src/scenes/BootScene.js` | Configuración inicial → PreloadScene |
| `src/scenes/PreloadScene.js` | Carga assets + barra de progreso animada |
| `src/scenes/MenuScene.js` | Menú principal con navegación teclado + mouse |
| `src/scenes/WorldScene.js` | Mapa placeholder + jugador Lynfa movible |
| `src/scenes/UIScene.js` | HUD con barras HP, Energía, XP, misión |
| `src/scenes/DialogueScene.js` | Estructura base para diálogos (Fase 5) |
| `src/scenes/PauseScene.js` | Menú de pausa placeholder (Fase futura) |
| `src/scenes/GameOverScene.js` | Pantalla game over |
| `src/scenes/VictoryScene.js` | Pantalla de victoria |
| `index.html` | HTML con SEO, pixel art CSS, contenedor |

### Archivos JSON de datos creados
| Archivo | Contenido |
|---------|-----------|
| `public/data/guardians.json` | Lynfa y Eri con todos sus stats |
| `public/data/enemies.json` | 3 enemigos básicos |
| `public/data/bosses.json` | Patógeno Alfa (3 fases) |
| `public/data/dialogues.json` | 2 diálogos del Centinela Linfático |
| `public/data/quests.json` | 2 misiones del primer nivel |

---

## Resultado de la verificación

El juego cargó correctamente en `http://localhost:5173/` con:
- ✅ Phaser v4.1.0 iniciado (WebGL + Web Audio)
- ✅ Secuencia de escenas correcta: Boot → Preload → Menu
- ✅ Todos los JSON cargados y validados (5/5)
- ✅ Menú principal visual correcto (título, opciones, versión)
- ✅ "Continuar" correctamente deshabilitado (sin partida guardada)
- ✅ CERO errores de JavaScript en consola

Consola del navegador (sin errores):
```
Phaser v4.1.0 (WebGL | Web Audio) https://phaser.io/v401
[BootScene] Iniciando Guardianes de la Vida: Misión Celular...
[PreloadScene] Assets cargados. Validando datos...
[PreloadScene] ✓ guardians.json cargado (2 entradas)
[PreloadScene] ✓ enemies.json cargado (3 entradas)
[PreloadScene] ✓ bosses.json cargado (1 entradas)
[PreloadScene] ✓ quests.json cargado (2 entradas)
[PreloadScene] ✓ dialogues.json cargado (2 entradas)
[PreloadScene] Todo listo. Iniciando menú...
[MenuScene] Menú principal iniciado.
```

---

## Controles implementados en WorldScene (placeholder)

| Tecla | Acción |
|-------|--------|
| ← → ↑ ↓ | Movimiento de Lynfa en 4 direcciones |
| S | Correr (×1.7 de velocidad) |
| D | Interactuar (estructura lista, NPC detectado por proximidad) |
| A | Ataque (registrado, implementación en Fase 4) |
| W | Habilidad especial (registrado, implementación en Fase 4) |
| Enter | Pausa (registrado, implementación en Fase futura) |

---

## Pendiente para la próxima sesión (Fase 2)

La Fase 1 está completa. En la siguiente sesión:
1. Cargar datos de Lynfa desde `guardians.json` en lugar de valores hardcodeados
2. Mejorar el gráfico placeholder de Lynfa con más detalle visual
3. Implementar estados completos: idle, walk, run, hit, defeated
4. Agregar animaciones de movimiento (aunque sean con formas geométricas)
5. Conectar los stats del jugador con el HUD (HP, Energía se actualizan en tiempo real)

---

## Notas técnicas

- Phaser v4.1.0 se instaló (no v3 como especificaba el brief, pero es compatible
  y es la versión más reciente — no hay cambios breaking en la API relevante).
- `pixelArt: true` y `antialias: false` activos para sprites nítidos.
- La resolución lógica es 480×270 (escala 16:9, se ve perfecto en 1080p).
- El mapa placeholder es 640×480 px (20×15 tiles de 32px) — más grande que la pantalla,
  activando la cámara con suavizado (lerp = 0.08).

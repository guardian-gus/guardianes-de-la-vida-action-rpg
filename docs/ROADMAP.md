# Guardianes de la Vida: Misión Celular — ROADMAP

> **Versión del documento:** 1.2.0
> **Última actualización:** 2026-05-25
> **Estado del proyecto:** Fases 1–7 completas · Fase 8 (Arte) pendiente

---

## Filosofía de desarrollo

> "Primero una demo vertical pequeña pero jugable. Después expandir.
> No construir una catedral celular antes de tener una célula viva."

El desarrollo avanza **paso a paso**, verificando que cada fase funciona antes de continuar.
Cada fase se documenta, se comenta abundantemente y se revisa antes de avanzar.

---

## Tecnologías base

| Herramienta     | Uso                                              |
|-----------------|--------------------------------------------------|
| Phaser 3        | Motor 2D principal para navegador                |
| JavaScript ES6+ | Lenguaje principal (módulos, clases, async/await)|
| Vite            | Dev server y empaquetado                         |
| Tiled           | Creación de mapas por capas (formato JSON)       |
| JSON            | Datos editables: guardianes, enemigos, misiones  |
| Git / GitHub    | Control de versiones                             |

---

## Controles del jugador

### Teclado (implementación actual)

| Tecla       | Acción                          |
|-------------|----------------------------------|
| ↑ ↓ ← →    | Movimiento en 4 direcciones      |
| A           | Ataque / acción principal        |
| S           | Correr (velocidad aumentada)     |
| D           | Interactuar (NPCs, puertas, cofres) |
| W           | Habilidad especial               |
| Enter       | Menú de pausa                    |

### Móvil / tablet (fase posterior)
Joystick virtual + botones en pantalla, similar a emuladores GBA.

---

## Fases del proyecto

### ✅ FASE 0 — Documentación base
**Objetivo:** Establecer documentación, estructura de proyecto y guías antes de escribir código.

- [x] Brief técnico y creativo (`GUARDIANES_RPG_BRIEF_ANTIGRAVITY.md`)
- [x] Roadmap (`ROADMAP.md`)
- [x] Guía de estilo de código (`CODE_STYLE_GUIDE.md`)
- [x] Guía de assets y sprites (`ASSETS_GUIDE.md`)
- [x] Changelog inicial (`CHANGELOG.md`)
- [ ] Guía de contribución (`CONTRIBUTING.md`)

---

### ✅ FASE 1 — Base técnica del proyecto
**Objetivo:** Proyecto Vite + Phaser corriendo en navegador con escenas vacías.

- [x] Inicializar proyecto con `npm create vite`
- [x] Instalar Phaser 3
- [x] Crear estructura de carpetas (`src/`, `public/`, `docs/`)
- [x] Crear `BootScene` — configuración mínima
- [x] Crear `PreloadScene` — carga de assets con barra de progreso animada
- [x] Crear `MenuScene` — menú principal con botones (teclado/mouse/touch)
- [x] Crear `WorldScene` — mapa placeholder 20×15, jugador y NPC
- [x] Crear `UIScene` — HUD con barras HP/Energía/XP y misión activa
- [x] Crear `DialogueScene`, `PauseScene`, `GameOverScene`, `VictoryScene`
- [x] Verificar: `npm run dev` abre el juego en navegador

---

### ✅ FASE 2 — Jugador (Lynfa)
**Objetivo:** Personaje que se mueve, tiene vida/energía y puede correr.

- [x] Cargar datos de Lynfa desde `guardians.json`
- [x] Sprite placeholder (rectángulo con dirección visible, color por guardián)
- [x] Movimiento en 4 direcciones con flechas, normalización diagonal
- [x] Correr con S (multiplicador `PLAYER_RUN_MULTIPLIER`)
- [x] Cámara que sigue al jugador con suavizado
- [x] Estados: `idle`, `walk`, `run`, `hit`, `attack`, `defeated`
- [x] HP y energía emitidos por eventos al HUD en tiempo real
- [x] Regeneración de energía al estar en reposo (cada 2 s)
- [x] Invulnerabilidad temporal tras recibir daño
- [x] Sistema de XP y subida de nivel (stats escalan automáticamente)
- [x] Verificar: el personaje se mueve fluidamente

---

### ✅ FASE 3 — Primer mapa
**Objetivo:** Mapa funcional con colisiones, zonas y objetos interactivos.

- [x] Tilemap placeholder generado programáticamente en Phaser
- [x] Capas: floor y walls con colisiones
- [x] Colisiones con paredes
- [x] Zona de spawn del jugador definida
- [x] Límites del mapa (mundo más grande que la cámara)
- [x] Verificar: el jugador colisiona correctamente con paredes

> **Pendiente para Fase 8+:** Reemplazar tilemap placeholder con Tiled + tilesets reales.

---

### ✅ FASE 4 — Sistema de combate básico
**Objetivo:** Atacar y recibir daño.

- [x] Ataque básico con tecla A (hitbox visual delante del jugador)
- [x] Cooldown de ataque cargado desde `basicAttack.cooldown` en JSON
- [x] Enemigos: Virus Menor, Bacteria Invasora, Célula Infectada
- [x] IA de persecución con rango de detección (200 px)
- [x] Enemigo recibe daño, knockback y efecto de flash
- [x] Enemigo muere con efecto de pop + emite XP al jugador
- [x] Jugador recibe daño por contacto con defensa aplicada
- [x] Flash de daño en jugador + período de invulnerabilidad
- [x] Verificar: el combate funciona sin bugs

---

### ✅ FASE 5 — Diálogos y misiones
**Objetivo:** NPC con diálogo que activa una misión.

- [x] NPC "Centinela Linfático" en el mapa
- [x] Sistema de diálogo desde `dialogues.json`
- [x] Caja de diálogo con nombre y texto
- [x] Tecla W/Enter para interactuar con NPCs
- [x] `QuestSystem`: leer misiones desde `quests.json`
- [x] Objetivos: derrotar enemigos, interactuar con objeto
- [x] Crédito retroactivo (enemigos muertos antes de aceptar misión cuentan)
- [x] Cadena de misiones (`nextQuest`)
- [x] HUD muestra misión actual con progreso en tiempo real
- [x] Verificar: el diálogo activa la misión correctamente

---

### ✅ FASE 6 — Mini jefe
**Objetivo:** "Patógeno Alfa" con fases de comportamiento.

- [x] Jefe cargado desde `bosses.json` (clase `Boss` extiende `Enemy`)
- [x] Barra de vida del jefe en la `UIScene` (evento `BOSS_HP_CHANGED`)
- [x] Fase 1: perseguir y golpear (activado al 100% HP)
- [x] Fase 2: huir + invocar esbirros cada 5 s (< 60% HP)
- [x] Fase 3: dash agresivo × 3.5 velocidad (< 30% HP, se vuelve rojo)
- [x] Sacudida de cámara al cambiar de fase
- [x] Al morir: emite `BOSS_DIED` → transición a `VictoryScene`
- [x] `Projectile.js` creado como base para proyectiles futuros
- [x] Verificar: el jefe funciona sin errores

---

### ✅ FASE 7 — Sistema de guardado
**Objetivo:** Guardar y recargar partida con localStorage.

- [x] `SaveSystem` modular (estático, sin dependencias de escena)
- [x] `save()`, `load()`, `hasSave()`, `deleteSave()` implementados
- [x] Botón "Continuar" en `MenuScene` (visible solo si hay partida guardada)
- [x] Verificar: los datos persisten al recargar página

> **Pendiente:** Guardar posición, misiones completadas y stats del jugador al cerrar/pausar.

---

### 🎨 FASE 8 — Arte mínimo ← SIGUIENTE
**Objetivo:** Reemplazar placeholders con arte real mínimo.

- [ ] Sprite sheet de Lynfa (idle + walk en 4 direcciones)
- [ ] Tileset del ganglio linfático
- [ ] Sprites de enemigos básicos (Virus, Bacteria, Célula Infectada)
- [ ] Sprite del Patógeno Alfa (boss)
- [ ] UI pixel art básico (marcos de barras, fuente del HUD)
- [ ] Reemplazar `DialogueScene` con caja de diálogo con arte
- [ ] Verificar: el juego se ve coherente con la estética Guardianes

---

### ✅ FASE 9 — Controles móviles
**Objetivo:** El juego funciona en celular/tablet.

- [x] `MobileControlsScene` — escena superpuesta independiente
- [x] Joystick virtual táctil (izquierda) con zona muerta y límite al radio de la base
- [x] Normalización de movimiento en 8 direcciones con joystick
- [x] Botones virtuales circulares en layout diamante (derecha):
      A=Ataque · S=Correr · D=Habilidad · W=Interactuar
- [x] Botón de pausa en esquina superior derecha
- [x] Feedback visual en botones (presionado / suelto / hover out)
- [x] Solo visible en dispositivos táctiles o pantalla < 1024 px
- [x] Se activa/desactiva dinámicamente al redimensionar la ventana
- [x] Multi-touch: joystick y botones funcionan con punteros separados
- [x] Comunicación por eventos Phaser (sin acoplamiento directo a WorldScene)
- [x] Compatible con teclado: ambos inputs coexisten sin conflicto
- [ ] Verificar: jugable en celular sin lag (requiere dispositivo físico)

---

### 🚀 FASE 10 — Publicación
**Objetivo:** La demo está en línea.

- [ ] `npm run build` genera `dist/` sin errores
- [ ] Rutas de assets correctas para producción
- [ ] README.md con instrucciones
- [ ] Publicar en GitHub Pages / Netlify / itch.io
- [ ] Verificar: la URL pública carga el juego

---

## Guardianes disponibles (universo completo)

Ver brief `GUARDIANES_RPG_BRIEF_ANTIGRAVITY.md` sección 7.
**Primera demo:** Solo Lynfa.

## Expansión futura (post-demo)

- Más guardianes jugables
- Más mapas del cuerpo humano
- Minijuegos por hexágono
- Sistema de cartas (independiente del otro proyecto)
- Progresión RPG avanzada (árbol de habilidades, inventario)
- Capítulos educativos
- Participación de estudiantes en arte, mapas, diálogos y misiones

# Guardianes de la Vida: Misión Celular — ROADMAP

> **Versión del documento:** 1.0.0
> **Última actualización:** 2026-05-24
> **Estado del proyecto:** Fase 1 en curso

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
- [ ] Guía de estilo de código (`CODE_STYLE_GUIDE.md`)
- [ ] Guía de assets y sprites (`ASSETS_GUIDE.md`)
- [ ] Guía de contribución (`CONTRIBUTING.md`)
- [ ] Changelog inicial (`CHANGELOG.md`)

---

### 🔧 FASE 1 — Base técnica del proyecto
**Objetivo:** Proyecto Vite + Phaser corriendo en navegador con escenas vacías.

- [ ] Inicializar proyecto con `npm create vite`
- [ ] Instalar Phaser 3
- [ ] Crear estructura de carpetas (`src/`, `public/`, `docs/`)
- [ ] Crear `BootScene` — configuración mínima
- [ ] Crear `PreloadScene` — carga de assets con barra de progreso placeholder
- [ ] Crear `MenuScene` — menú principal con botones
- [ ] Crear `WorldScene` — escena del mundo (vacía por ahora)
- [ ] Crear `UIScene` — HUD superpuesto (vacío por ahora)
- [ ] Verificar: `npm run dev` abre el juego en navegador

---

### 🧍 FASE 2 — Jugador (Lynfa)
**Objetivo:** Personaje que se mueve, tiene vida/energía y puede correr.

- [ ] Cargar datos de Lynfa desde `guardians.json`
- [ ] Sprite placeholder de Lynfa (rectángulo coloreado con dirección visible)
- [ ] Movimiento en 4 direcciones con flechas o WASD
- [ ] Correr con S (multiplicador de velocidad)
- [ ] Cámara que sigue al jugador con suavizado
- [ ] Estado del jugador: idle, walk, run, hit, defeated
- [ ] Vida (HP) y energía visibles en consola (HUD en fase posterior)
- [ ] Verificar: el personaje se mueve fluidamente

---

### 🗺️ FASE 3 — Primer mapa
**Objetivo:** Mapa funcional con colisiones, zonas y objetos interactivos.

- [ ] Crear tilemap placeholder programáticamente en Phaser
  (O instalar Tiled y crear `lymph_node_01.json`)
- [ ] Capas: floor, walls, collision, objects
- [ ] Colisiones con paredes
- [ ] Zona de spawn del jugador
- [ ] Límites del mapa (mundo más grande que la cámara)
- [ ] Verificar: el jugador colisiona correctamente con paredes

---

### ⚔️ FASE 4 — Sistema de combate básico
**Objetivo:** Atacar y recibir daño.

- [ ] Ataque básico con tecla A (hitbox temporal delante del jugador)
- [ ] Cooldown de ataque
- [ ] Enemigo placeholder: "Virus Menor"
- [ ] Enemigo persigue al jugador (IA simple)
- [ ] Enemigo recibe daño y muere
- [ ] Jugador recibe daño por contacto
- [ ] Efecto visual simple al golpear (flash de color)
- [ ] Verificar: el combate funciona sin bugs

---

### 💬 FASE 5 — Diálogos y misiones
**Objetivo:** NPC con diálogo que activa una misión.

- [x] NPC "Centinela Linfático" en el mapa
- [x] Sistema de diálogo desde `dialogues.json`
- [x] Caja de diálogo con nombre y texto
- [x] Tecla W/Enter para interactuar con NPCs
- [x] QuestSystem: leer misiones desde `quests.json`
- [x] Objectivos: derrotar enemigos, interactuar con objeto
- [x] HUD muestra misión actual
- [x] Verificar: el diálogo activa la misión correctamente

---

### 🦠 FASE 6 — Mini jefe
**Objetivo:** "Patógeno Alfa" con fases de comportamiento.

- [ ] Jefe cargado desde `bosses.json`
- [ ] Barra de vida visible del jefe
- [ ] Patrón fase 1: perseguir y golpear
- [ ] Patrón fase 2: invocar virus menores
- [ ] Patrón fase 3: dash + proyectil
- [ ] Al morir: transición a `VictoryScene`
- [ ] Verificar: el jefe funciona sin errores

---

### 💾 FASE 7 — Sistema de guardado
**Objetivo:** Guardar y recargar partida con localStorage.

- [ ] SaveSystem modular
- [ ] Guardar: guardián, mapa, posición, HP, energía, nivel, XP, ADN, fotones, misiones completadas
- [ ] Cargar partida al iniciar
- [ ] Botón "Continuar" en MenuScene
- [ ] Verificar: los datos persisten al recargar página

---

### 🎨 FASE 8 — Arte mínimo
**Objetivo:** Reemplazar placeholders con arte real mínimo.

- [ ] Sprite sheet de Lynfa (idle + walk en 4 direcciones)
- [ ] Tileset del ganglio linfático
- [ ] Sprites de enemigos básicos
- [ ] UI pixel art básico
- [ ] Verificar: el juego se ve coherente con la estética Guardianes

---

### 📱 FASE 9 — Controles móviles
**Objetivo:** El juego funciona en celular/tablet.

- [ ] Joystick virtual táctil
- [ ] Botones virtuales: A (ataque), S (correr), D (interactuar), W (habilidad)
- [ ] Botón de pausa
- [ ] Escala responsiva en distintas resoluciones
- [ ] Verificar: jugable en celular sin lag

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

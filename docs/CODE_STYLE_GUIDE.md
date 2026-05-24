# Guía de Estilo de Código — Guardianes de la Vida: Misión Celular

> **Versión:** 1.0.0
> **Última actualización:** 2026-05-24
>
> Este documento define las convenciones de código para todo el proyecto.
> Su objetivo es que el código sea legible, enseñable y reciclable,
> especialmente para compartirlo con estudiantes.

---

## 1. Principios generales

- **Claridad sobre brevedad:** Es mejor un nombre largo y claro que uno corto y ambiguo.
- **Un archivo, una responsabilidad:** Cada archivo hace una sola cosa bien.
- **Datos fuera del código:** Guardianes, enemigos, misiones y diálogos van en JSON, no en clases.
- **Comentar abundantemente:** Cada función, clase y sección debe explicar QUÉ hace y POR QUÉ existe.
- **Avanzar por pasos:** No agregar sistemas complejos antes de verificar que lo básico funciona.

---

## 2. Convenciones de nombres

### Archivos y carpetas
```
kebab-case          → no usar
PascalCase          → para clases y escenas: Player.js, WorldScene.js
camelCase           → para utilidades y sistemas: combatSystem.js (si no son clases exportadas)
UPPER_SNAKE_CASE    → para constantes: MAX_ENEMIES, TILE_SIZE
```

### Variables y funciones
```javascript
// Variables: camelCase
let playerHealth = 100;
let currentQuest = null;

// Constantes del módulo: UPPER_SNAKE_CASE
const MAX_SPEED = 200;
const TILE_SIZE = 32;

// Clases: PascalCase
class Player extends Phaser.GameObjects.Sprite { }
class CombatSystem { }

// Funciones: camelCase con verbo al inicio
function loadGuardianData() { }
function applyDamage(target, amount) { }
function showDialogue(dialogueId) { }
```

### JSON (datos del juego)
```
snake_case          → para IDs: "virus_minor", "quest_clean_lymph_node"
camelCase           → para propiedades: "maxHp", "spriteKey", "contactDamage"
Español             → para textos visibles: "name", "description", "lines"
Inglés              → para IDs internos: "id", "behavior", "type"
```

---

## 3. Estructura de un archivo JavaScript

Todo archivo JS del proyecto debe seguir este orden:

```javascript
// ============================================================
// NombreDelArchivo.js
// Descripción: Qué hace este archivo y para qué sirve.
// Autor: [nombre]
// Fecha: YYYY-MM-DD
// Versión: 1.0.0
// ============================================================

// --- IMPORTACIONES ---
// Siempre al inicio. Una importación por línea.
import Phaser from 'phaser';
import { TILE_SIZE, MAX_SPEED } from '../config/constants.js';

// --- CONSTANTES LOCALES ---
// Constantes usadas solo en este archivo.
const ATTACK_HITBOX_WIDTH = 24;
const ATTACK_HITBOX_HEIGHT = 16;

// --- CLASE PRINCIPAL ---
/**
 * Descripción de la clase.
 * Qué hace, con qué interactúa y qué datos necesita.
 */
class NombreClase {
  /**
   * Constructor: crea la instancia.
   * @param {Phaser.Scene} scene - La escena de Phaser que la contiene.
   * @param {Object} data - Datos del JSON correspondiente.
   */
  constructor(scene, data) {
    // ...
  }

  // --- MÉTODOS PÚBLICOS ---

  /**
   * Descripción del método.
   * @param {number} damage - Cantidad de daño a aplicar.
   * @returns {boolean} true si el personaje sigue vivo.
   */
  takeDamage(damage) {
    // ...
  }
}

// --- EXPORTACIÓN ---
export default NombreClase;
```

---

## 4. Límites de longitud de línea

| Tipo de archivo | Longitud máxima por línea |
|-----------------|---------------------------|
| `.js`           | 100 caracteres            |
| `.json`         | Sin límite (formato libre)|
| `.md`           | 120 caracteres            |

> **Regla de oro:** Si una línea necesita scroll horizontal para leerse, es demasiado larga.
> Divide la expresión en múltiples líneas.

```javascript
// ❌ Demasiado largo
const result = someObject.someMethod(parameterOne, parameterTwo, parameterThree, parameterFour);

// ✅ Legible
const result = someObject.someMethod(
  parameterOne,
  parameterTwo,
  parameterThree,
  parameterFour
);
```

---

## 5. Comentarios

### ¿Cuándo comentar?

```javascript
// ✅ Comentar: el POR QUÉ de una decisión no obvia
// Usamos 350ms de cooldown para que el ataque se sienta responsivo
// sin permitir que el jugador haga spam infinito de ataques.
const ATTACK_COOLDOWN = 350;

// ✅ Comentar: bloques de lógica para enseñar a estudiantes
// --- Verificamos si el enemigo está dentro del rango de ataque ---
// La hitbox de ataque se crea delante del jugador según su dirección.
// Si el enemigo colisiona con esa hitbox, recibe daño.

// ❌ No comentar: lo que el código ya dice solo
// Suma 1 a i  ← innecesario
i++;
```

### Bloques de sección (usar en archivos largos)

```javascript
// ============================================================
// SECCIÓN: Movimiento del jugador
// ============================================================

// ============================================================
// SECCIÓN: Sistema de combate
// ============================================================
```

### Marcadores de tareas pendientes

```javascript
// TODO: Implementar animaciones de Lynfa cuando lleguen los sprites.
// FIXME: El cooldown no resetea correctamente al morir.
// NOTE: Este valor viene de guardians.json, no hardcodearlo aquí.
```

---

## 6. Importaciones y módulos

```javascript
// Orden de importaciones:
// 1. Librerías externas (Phaser, etc.)
// 2. Configuración del proyecto
// 3. Escenas
// 4. Entidades
// 5. Sistemas
// 6. Utilidades

import Phaser from 'phaser';                        // 1. Externas
import { GAME_WIDTH, TILE_SIZE } from '../config/constants.js'; // 2. Config
import WorldScene from '../scenes/WorldScene.js';   // 3. Escenas
import Player from '../entities/Player.js';         // 4. Entidades
import CombatSystem from '../systems/CombatSystem.js'; // 5. Sistemas
import { clamp } from '../utils/math.js';           // 6. Utils
```

---

## 7. JSON: estructura y validación

Todos los JSON deben:

- Tener un campo `"id"` único en snake_case.
- Incluir comentarios en el README correspondiente (JSON no admite comentarios nativos).
- Ser válidos (sin trailing commas, sin comentarios `//` dentro del JSON).
- Seguir la estructura definida en el brief `GUARDIANES_RPG_BRIEF_ANTIGRAVITY.md`.

---

## 8. Git: mensajes de commit

Usar el formato:

```
tipo(alcance): descripción breve en español

Ejemplos:
feat(player): agregar movimiento en 4 direcciones con Lynfa
fix(combat): corregir cooldown de ataque que no reseteaba al morir
docs(roadmap): actualizar fase 3 como completada
refactor(enemy): separar lógica de IA en EnemyBehavior.js
chore(vite): actualizar configuración de build para assets públicos
```

Tipos válidos:
- `feat` → nueva funcionalidad
- `fix` → corrección de error
- `docs` → solo documentación
- `refactor` → mejora de código sin cambiar comportamiento
- `chore` → tareas de configuración/build
- `test` → pruebas

---

## 9. Estructura de carpetas

```
guardianes_de_la_vida_action_rpg/
├── docs/                         ← Documentación del proyecto
│   ├── GUARDIANES_RPG_BRIEF_ANTIGRAVITY.md
│   ├── ROADMAP.md
│   ├── CODE_STYLE_GUIDE.md       ← Este archivo
│   ├── ASSETS_GUIDE.md
│   ├── CHANGELOG.md
│   └── sessions/                 ← Notas de cada sesión de desarrollo
├── public/
│   └── assets/
│       ├── sprites/
│       │   ├── guardians/        ← Sprites de guardianes
│       │   ├── enemies/          ← Sprites de enemigos
│       │   ├── npcs/             ← Sprites de NPCs
│       │   └── effects/          ← Efectos visuales
│       ├── tilesets/             ← Tilesets para los mapas
│       ├── maps/                 ← Mapas en formato JSON (Tiled)
│       ├── audio/                ← Música y efectos de sonido
│       └── ui/                   ← Imágenes de la interfaz
└── src/
    ├── main.js                   ← Punto de entrada, configura Phaser
    ├── config/
    │   ├── gameConfig.js         ← Configuración de Phaser (resolución, física)
    │   └── constants.js          ← Constantes globales del juego
    ├── scenes/
    │   ├── BootScene.js          ← Configuración inicial mínima
    │   ├── PreloadScene.js       ← Carga de todos los assets
    │   ├── MenuScene.js          ← Menú principal
    │   ├── WorldScene.js         ← Escena principal del juego
    │   ├── UIScene.js            ← HUD (se ejecuta en paralelo a WorldScene)
    │   ├── DialogueScene.js      ← Caja de diálogo
    │   ├── PauseScene.js         ← Menú de pausa (inventario, stats)
    │   ├── GameOverScene.js      ← Pantalla de game over
    │   └── VictoryScene.js       ← Pantalla de victoria
    ├── entities/
    │   ├── Player.js             ← Estado y comportamiento del jugador
    │   ├── Enemy.js              ← Comportamiento base de enemigos
    │   ├── Boss.js               ← Comportamiento de jefes (extiende Enemy)
    │   ├── NPC.js                ← NPCs interactuables
    │   ├── Projectile.js         ← Proyectiles (jugador y enemigos)
    │   └── ItemDrop.js           ← Objetos que caen al derrotar enemigos
    ├── systems/
    │   ├── CombatSystem.js       ← Ataques, daño, hitboxes, knockback
    │   ├── DialogueSystem.js     ← Lectura y control de diálogos desde JSON
    │   ├── QuestSystem.js        ← Evaluación de objetivos activos
    │   ├── SaveSystem.js         ← Guardar y cargar progreso (localStorage)
    │   ├── InputSystem.js        ← Mapeo de teclado y controles táctiles
    │   ├── LevelSystem.js        ← Experiencia, subida de nivel
    │   └── InventorySystem.js    ← Inventario (fase futura)
    ├── data/
    │   ├── guardians.json        ← Datos de guardianes jugables
    │   ├── enemies.json          ← Datos de enemigos
    │   ├── bosses.json           ← Datos de jefes
    │   ├── skills.json           ← Habilidades especiales
    │   ├── items.json            ← Objetos del inventario
    │   ├── quests.json           ← Misiones
    │   └── dialogues.json        ← Diálogos de NPCs
    ├── ui/
    │   ├── HUD.js                ← Barras de vida, energía, recursos, misión
    │   ├── DialogueBox.js        ← Caja de diálogo visual
    │   └── MenuPanel.js          ← Paneles del menú de pausa
    └── utils/
        ├── direction.js          ← Utilidades de dirección (arriba, abajo, etc.)
        ├── math.js               ← Utilidades matemáticas (clamp, lerp, etc.)
        └── loaders.js            ← Helpers para cargar y parsear JSON
```

---

## 10. Buenas prácticas de Phaser

```javascript
// ✅ Destruir objetos que ya no se usan
enemy.destroy();

// ✅ Usar grupos de Phaser para manejo eficiente de colecciones
this.enemies = this.physics.add.group();

// ✅ Separar lógica de la escena en sistemas externos
// En lugar de poner toda la lógica en WorldScene.update():
this.combatSystem.update();
this.questSystem.update();

// ✅ Limpiar listeners al salir de una escena
this.events.on('shutdown', () => {
  this.inputSystem.destroy();
});

// ❌ No poner datos hardcodeados en las escenas
// this.player.maxHp = 120;  ← No, esto viene de guardians.json
```

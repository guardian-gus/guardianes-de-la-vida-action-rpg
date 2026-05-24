# Guardianes de la Vida: Misión Celular
## Brief técnico y creativo para desarrollo en HTML, JavaScript y Phaser

**Documento para usar dentro del proyecto y como guía para agentes de IA en Antigravity.**

---

## 1. Objetivo del proyecto

Desarrollar un videojuego 2D de acción RPG en navegador, inspirado en la estructura jugable de los RPG de acción portátiles de Game Boy Advance: exploración por mapas, combate en tiempo real, diálogos, misiones, progresión de personajes, jefes y zonas conectadas.

El juego debe estar ambientado en el universo educativo **Guardianes de la Vida**, donde los sistemas del cuerpo humano, la ecología y los procesos biológicos se convierten en escenarios, enemigos, habilidades, recursos y misiones.

El proyecto debe ejecutarse en navegador usando **HTML, JavaScript y Phaser**. Debe ser modular, escalable, educativo y fácil de editar mediante archivos JSON, mapas externos y sprites reutilizables.

---

## 2. Stack técnico elegido

Usar estas herramientas como base principal:

| Herramienta | Uso |
|---|---|
| **Phaser 3** | Motor principal 2D para navegador |
| **JavaScript moderno** | Lenguaje principal |
| **Vite** | Entorno de desarrollo y empaquetado |
| **Tiled Map Editor** | Creación de mapas por capas en formato JSON |
| **Aseprite** | Creación de sprites, animaciones y tilesets pixel art |
| **JSON** | Datos editables para guardianes, enemigos, diálogos, misiones, habilidades, objetos y mapas |
| **Git/GitHub** | Control de versiones |
| **GitHub Pages, Netlify, Vercel o itch.io** | Publicación web |

No usar RPG Maker como base principal.  
No usar GameMaker como base principal.  
La prioridad es que el proyecto sea **web nativo, editable y compatible con HTML/JS**.

---

## 3. Tipo de juego

Género:

- Action RPG 2D.
- Vista superior o semi-top-down.
- Estética pixel art 16-bit/GBA.
- Combate en tiempo real.
- Mapas por zonas conectadas.
- Sistema de diálogos y misiones.
- Progresión de personaje.
- Educación científica integrada a la mecánica.

Inspiración estructural:

- Exploración por zonas.
- Peleas en tiempo real.
- NPCs con diálogos.
- Subida de nivel.
- Jefes con patrones simples.
- Mapas conectados.

> Importante: no copiar personajes, nombres, arte, música ni assets de franquicias existentes. Crear identidad propia para Guardianes de la Vida.

---

## 4. Nombre provisional

**Guardianes de la Vida: Misión Celular**

---

## 5. Premisa narrativa

El cuerpo humano y los ecosistemas están siendo alterados por amenazas biológicas, toxinas, células dañadas y desequilibrios ambientales. Los Guardianes deben viajar por sistemas internos y ecosistemas simbólicos para restaurar la homeostasis, activar recursos científicos y derrotar amenazas.

---

## 6. Tono del juego

- Educativo, aventurero y dinámico.
- Ciencia clara integrada en la experiencia.
- No debe sentirse como cuestionario disfrazado.
- El aprendizaje debe aparecer en misiones, poderes, enemigos, recursos y diálogos breves.
- La teoría debe aparecer como cápsulas breves, no como textos extensos.

---

## 7. Guardianes principales

Lista base del universo Guardianes de la Vida:

| Personaje | Rol científico |
|---|---|
| **Masty** | Guardiana de la digestión. Representa células enteroendocrinas gástricas |
| **Reena** | Guardiana de la excreción. Representa podocitos y filtración renal |
| **Neuma** | Guardiana de la respiración. Relacionada con neumocitos, alveolos e intercambio gaseoso |
| **Eri** | Guardiana de la circulación. Representa eritrocitos y transporte de oxígeno |
| **Lynfa** | Plasmocito. Memoria/defensa mediante anticuerpos |
| **Tim** | Timocito. Adaptación inmune |
| **Key** | Célula Natural Killer. Defensa innata y eliminación de células alteradas |
| **Isa** | Célula inmunológica de memoria |
| **Ede** | Meiosis, esposa de Gus |
| **Gus** | Mitosis, esposo de Ede |
| **Pandora** | Pandemia/epidemias |
| **Arles** | Cáncer/células alteradas |
| **Big LM** | Osteoblasto. Formación y reparación ósea |
| **Luu** | Miocito. Movimiento y contracción muscular |
| **Oracle** | Pituitaria/hipófisis. Regulación hormonal |
| **Oli** | Oligodendrocito. Mielina y soporte neural |
| **Mirai** | Microglía. Defensa del sistema nervioso |
| **León** | Selección natural y animales |
| **Flora** | Polinización y plantas |
| **Ryza** | Micorriza, hongos y descomposición |

Para el primer prototipo usar solo 1 o 2 guardianes:

- **Lynfa**, por su relación con el sistema inmune.
- **Eri**, por su relación con circulación y movimiento rápido.

---

## 8. Recursos del juego

### ADN

Recurso biológico usado para crear, activar o mejorar habilidades relacionadas con estructura, regeneración y funciones celulares.

### Fotones

Recurso energético usado para movimiento especial, habilidades, activación de mecanismos y poderes asociados a energía.

### ATP

Puede usarse como recurso secundario de energía en combate, si se decide separarlo de Fotones.

Para el primer prototipo usar solo:

- Vida.
- Energía.
- ADN.
- Fotones.
- Experiencia.
- Nivel.

---

## 9. Hexágonos temáticos

El juego puede usar 14 hexágonos como temas, zonas o núcleos de habilidad:

1. Destrucción Masiva.
2. Memoria Inmune.
3. Selección Natural.
4. Eliminación de Toxinas.
5. Guardia Esquelética.
6. Regeneración Mitótica.
7. Conservación Ecosistemas.
8. Absorción de Nutrientes.
9. Sinapsis Potenciada.
10. Pulso Hormonal.
11. Circulación Nutrientes.
12. Oxigenación Alveolar.
13. ATP Activado.
14. Biodegradación.

En la primera demo usar:

- Memoria Inmune.
- Circulación Nutrientes.
- Oxigenación Alveolar.

---

## 10. Primer prototipo vertical

Crear una demo jugable de 5 a 10 minutos llamada:

# Ataque al Ganglio Linfático

Debe incluir:

1. Pantalla de inicio.
2. Carga de assets.
3. Un mapa pequeño creado con Tiled o un mapa placeholder temporal.
4. Movimiento del personaje en 4 u 8 direcciones.
5. Cámara que sigue al jugador.
6. Colisiones con paredes.
7. NPC con diálogo breve.
8. Tres enemigos básicos.
9. Sistema de ataque cuerpo a cuerpo o proyectil simple.
10. Vida del jugador y enemigos.
11. Barra de energía.
12. Una habilidad especial.
13. Puerta o zona de transición.
14. Mini jefe.
15. Pantalla de victoria.
16. Guardado básico en localStorage.

No desarrollar todavía:

- 20 guardianes jugables.
- Inventario completo.
- Árbol de habilidades complejo.
- Mundo abierto.
- Multijugador.
- Sistema avanzado de cartas.

---

## 11. Estilo visual

Usar estética pixel art 16-bit inspirada en consolas portátiles retro, con identidad propia de Guardianes de la Vida.

Tamaños sugeridos:

| Elemento | Tamaño recomendado |
|---|---|
| Tile base | 16x16 o 32x32 px |
| Personaje | 32x48 px |
| Enemigo pequeño | 32x32 px |
| Enemigo mediano | 48x48 px |
| Jefe | 64x64 o 96x96 px |
| Resolución lógica | 320x180, 400x240 o 480x270 |

Cuidar que el pixel art se vea nítido. Evitar suavizado borroso.

Temas visuales del primer mapa:

- Vaso sanguíneo.
- Ganglio linfático.
- Tejido infectado.
- Zonas con patógenos.
- Nodos de anticuerpos.
- Caminos orgánicos rojizos, rosados, azules y violetas.

---

## 12. Estructura de carpetas recomendada

```text
src/
  main.js

  config/
    gameConfig.js
    constants.js

  scenes/
    BootScene.js
    PreloadScene.js
    MenuScene.js
    WorldScene.js
    UIScene.js
    DialogueScene.js
    GameOverScene.js
    VictoryScene.js

  entities/
    Player.js
    Enemy.js
    Boss.js
    NPC.js
    Projectile.js
    ItemDrop.js

  systems/
    CombatSystem.js
    DialogueSystem.js
    QuestSystem.js
    SaveSystem.js
    InventorySystem.js
    LevelSystem.js
    InputSystem.js

  data/
    guardians.json
    enemies.json
    bosses.json
    skills.json
    items.json
    quests.json
    dialogues.json
    maps.json

  ui/
    HUD.js
    DialogueBox.js
    MenuPanel.js

  utils/
    direction.js
    math.js
    loaders.js

public/
  assets/
    sprites/
      guardians/
      enemies/
      npcs/
      effects/
    tilesets/
    maps/
    audio/
    ui/
```

---

## 13. Escenas de Phaser

### BootScene

Configura ajustes iniciales, escala y carga mínima.

### PreloadScene

Carga sprites, tilemaps, JSON, audio y UI.

### MenuScene

Pantalla inicial con botones:

- Iniciar.
- Continuar.
- Opciones.

### WorldScene

Escena principal. Contiene:

- Mapa.
- Jugador.
- Enemigos.
- NPCs.
- Colisiones.
- Combate.
- Portales.
- Triggers.

### UIScene

HUD persistente:

- Vida.
- Energía.
- ADN.
- Fotones.
- Misión actual.

### DialogueScene o DialogueSystem

Maneja conversaciones, retratos y texto.

### GameOverScene

Pantalla al perder.

### VictoryScene

Pantalla de cierre de demo.

---

## 14. Reglas de programación

El código debe ser modular, claro y fácil de expandir.

Principios:

- No quemar datos de guardianes directamente en clases.
- Cargar guardianes, enemigos, habilidades y misiones desde JSON.
- Separar entidades de sistemas.
- Cada clase debe tener una responsabilidad clara.
- Mantener nombres en inglés para archivos y clases, pero los datos visibles pueden estar en español.
- Comentar solo lo necesario.
- Evitar crear un motor demasiado complejo al inicio.
- Priorizar una demo funcional sobre sistemas perfectos.
- Usar placeholders si faltan assets.
- No bloquear el avance por arte definitivo.

Ejemplo de responsabilidades:

| Archivo | Responsabilidad |
|---|---|
| `Player.js` | Estado y comportamiento del jugador |
| `Enemy.js` | Comportamiento base de enemigos |
| `CombatSystem.js` | Ataques, daño y colisiones de hitboxes |
| `DialogueSystem.js` | Lectura y control de diálogos desde JSON |
| `SaveSystem.js` | Guardar y cargar progreso |
| `QuestSystem.js` | Evaluar objetivos activos |

---

## 15. Movimiento del jugador

El jugador debe poder moverse en 4 u 8 direcciones.

Controles iniciales:

| Acción | Tecla |
|---|---|
| Movimiento | Flechas o WASD |
| Ataque básico | Z o J |
| Habilidad especial | X o K |
| Interactuar | E o Enter |
| Menú/Pausa | Escape |

En celular, después se agregará joystick táctil y botones virtuales.

El jugador debe tener:

- Velocidad.
- Dirección actual.
- Estado: idle, walk, attack, hit, defeated.
- Vida máxima.
- Vida actual.
- Energía máxima.
- Energía actual.
- Experiencia.
- Nivel.

---

## 16. Combate básico

Primer sistema de combate:

- Ataque básico con hitbox temporal delante del jugador.
- Enemigo recibe daño si entra en la hitbox.
- Aplicar retroceso simple.
- Agregar cooldown para evitar ataques infinitos.
- Reproducir animación de ataque.
- Reproducir efecto visual de impacto.
- Si vida del enemigo llega a cero, destruir enemigo y dar experiencia.

Después se pueden agregar:

- Proyectiles.
- Estados alterados.
- Habilidades complejas.
- Ataques cargados.
- Combos.
- Daño elemental/biológico.

---

## 17. Enemigos iniciales

### Virus menor

- Movimiento simple hacia el jugador.
- Poca vida.
- Daño bajo.

### Bacteria invasora

- Más vida.
- Movimiento lento.
- Contacto causa daño.

### Célula infectada

- Vida media.
- Puede lanzar proyectil simple o acercarse en ráfagas.

### Mini jefe: Patógeno Alfa

- Vida alta.
- Patrón de ataque por fases.
- Invoca virus menores o lanza proyectiles.
- Al morir muestra pantalla de victoria.

---

## 18. Estados alterados futuros

Preparar el sistema para estos estados, pero no implementarlos todos en la primera demo:

1. Quemado.
2. Congelado.
3. Paralizado.
4. Inhibido.
5. Infectado.
6. Intoxicado.

En la primera demo se puede implementar solo:

- Infectado.
- Intoxicado.

---

## 19. Sistema de diálogo

Los diálogos deben venir desde JSON.

Ejemplo:

```json
{
  "id": "npc_lymph_node_intro",
  "speaker": "Centinela Linfático",
  "portrait": "npc_centinela",
  "lines": [
    "¡Alerta, Guardián! El ganglio está recibiendo señales de infección.",
    "Derrota a los patógenos y activa el núcleo de Memoria Inmune.",
    "Recuerda: los anticuerpos ayudan a reconocer amenazas específicas."
  ]
}
```

El sistema debe permitir:

- Texto por líneas.
- Nombre del hablante.
- Retrato opcional.
- Evento al terminar diálogo.
- Activar misión.

---

## 20. Sistema de misiones

Las misiones deben estar en JSON.

Tipos iniciales:

- Hablar con NPC.
- Derrotar enemigos.
- Recoger objeto.
- Llegar a zona.
- Activar núcleo.

Ejemplo:

```json
{
  "id": "quest_clean_lymph_node",
  "title": "Purificar el ganglio",
  "description": "Derrota 5 patógenos y activa el núcleo de Memoria Inmune.",
  "objectives": [
    { "type": "defeat", "target": "virus_minor", "count": 5 },
    { "type": "interact", "target": "memory_core", "count": 1 }
  ],
  "rewards": {
    "xp": 50,
    "adn": 5,
    "fotones": 10
  }
}
```

---

## 21. Sistema de guardado

Implementar guardado simple con localStorage.

Guardar:

- Guardián seleccionado.
- Mapa actual.
- Posición.
- Vida.
- Energía.
- Nivel.
- Experiencia.
- ADN.
- Fotones.
- Misiones completadas.

Ejemplo conceptual:

```json
{
  "guardianId": "lynfa",
  "mapId": "lymph_node_01",
  "position": { "x": 120, "y": 240 },
  "hp": 100,
  "energy": 60,
  "level": 1,
  "xp": 30,
  "adn": 4,
  "fotones": 12,
  "completedQuests": ["quest_intro"]
}
```

---

## 22. JSON de guardianes

Crear `src/data/guardians.json` con esta estructura inicial:

```json
[
  {
    "id": "lynfa",
    "name": "Lynfa",
    "role": "Plasmocito",
    "title": "Guardiana de la Memoria Inmune",
    "hexagon": "Memoria Inmune",
    "spriteKey": "lynfa",
    "maxHp": 120,
    "maxEnergy": 80,
    "speed": 145,
    "attack": 12,
    "defense": 4,
    "basicAttack": {
      "name": "Pulso de Anticuerpos",
      "damage": 12,
      "cooldown": 350,
      "range": 28
    },
    "skill": {
      "id": "antibody_wave",
      "name": "Onda de Anticuerpos",
      "cost": 25,
      "damage": 25,
      "cooldown": 1500,
      "description": "Libera una onda que debilita patógenos cercanos."
    }
  },
  {
    "id": "eri",
    "name": "Eri",
    "role": "Eritrocito",
    "title": "Guardiana de la Circulación",
    "hexagon": "Circulación Nutrientes",
    "spriteKey": "eri",
    "maxHp": 110,
    "maxEnergy": 90,
    "speed": 170,
    "attack": 10,
    "defense": 3,
    "basicAttack": {
      "name": "Impulso Hemático",
      "damage": 10,
      "cooldown": 300,
      "range": 26
    },
    "skill": {
      "id": "oxygen_dash",
      "name": "Impulso de Oxigenación",
      "cost": 20,
      "damage": 18,
      "cooldown": 1200,
      "description": "Avanza rápidamente llevando oxígeno y empujando enemigos."
    }
  }
]
```

---

## 23. JSON de enemigos

Crear `src/data/enemies.json`:

```json
[
  {
    "id": "virus_minor",
    "name": "Virus menor",
    "spriteKey": "virus_minor",
    "maxHp": 30,
    "speed": 80,
    "attack": 6,
    "defense": 0,
    "xp": 8,
    "behavior": "chase",
    "contactDamage": true
  },
  {
    "id": "bacteria_invader",
    "name": "Bacteria invasora",
    "spriteKey": "bacteria_invader",
    "maxHp": 55,
    "speed": 55,
    "attack": 9,
    "defense": 2,
    "xp": 12,
    "behavior": "chase",
    "contactDamage": true
  },
  {
    "id": "infected_cell",
    "name": "Célula infectada",
    "spriteKey": "infected_cell",
    "maxHp": 70,
    "speed": 65,
    "attack": 10,
    "defense": 1,
    "xp": 16,
    "behavior": "dash",
    "contactDamage": true
  }
]
```

---

## 24. JSON de jefe

Crear `src/data/bosses.json`:

```json
[
  {
    "id": "alpha_pathogen",
    "name": "Patógeno Alfa",
    "spriteKey": "alpha_pathogen",
    "maxHp": 250,
    "speed": 60,
    "attack": 14,
    "defense": 3,
    "xp": 80,
    "behavior": "boss_alpha",
    "phases": [
      {
        "hpAbove": 0.66,
        "pattern": "chase_and_hit"
      },
      {
        "hpAbove": 0.33,
        "pattern": "summon_virus"
      },
      {
        "hpAbove": 0,
        "pattern": "dash_and_projectile"
      }
    ]
  }
]
```

---

## 25. JSON de diálogos

Crear `src/data/dialogues.json`:

```json
[
  {
    "id": "intro_centinela",
    "speaker": "Centinela Linfático",
    "portrait": "npc_centinela",
    "lines": [
      "¡Guardiana, al fin llegas!",
      "El ganglio está detectando señales de infección.",
      "Derrota a los patógenos y activa el Núcleo de Memoria Inmune."
    ],
    "onComplete": {
      "type": "startQuest",
      "questId": "quest_clean_lymph_node"
    }
  }
]
```

---

## 26. JSON de misiones

Crear `src/data/quests.json`:

```json
[
  {
    "id": "quest_clean_lymph_node",
    "title": "Purificar el ganglio",
    "description": "Derrota patógenos y activa el Núcleo de Memoria Inmune.",
    "objectives": [
      {
        "type": "defeat",
        "target": "virus_minor",
        "count": 5
      },
      {
        "type": "defeat",
        "target": "bacteria_invader",
        "count": 2
      },
      {
        "type": "interact",
        "target": "memory_core",
        "count": 1
      }
    ],
    "rewards": {
      "xp": 50,
      "adn": 5,
      "fotones": 10
    }
  }
]
```

---

## 27. Mecánicas educativas

La ciencia debe estar integrada así:

- Los enemigos representan problemas biológicos: patógenos, toxinas, células alteradas, radicales libres, residuos metabólicos.
- Los poderes representan funciones reales: anticuerpos, filtración, oxigenación, transporte, fagocitosis, memoria inmune, contracción muscular.
- Los mapas representan órganos, tejidos o ecosistemas.
- Los NPCs explican en frases breves lo que ocurre.
- Las misiones traducen procesos científicos a objetivos jugables.
- Los recursos tienen sentido: ADN, Fotones, ATP, nutrientes, oxígeno.

Evitar pantallas largas de teoría.  
Preferir cápsulas cortas dentro de la acción.

---

## 28. Primera misión educativa

## Purificar el Ganglio Linfático

Contexto:

Un grupo de patógenos entró por una herida. El ganglio linfático recibe señales de alerta. Lynfa debe activar el núcleo de Memoria Inmune y reducir la carga de patógenos.

Objetivos:

1. Hablar con el Centinela Linfático.
2. Derrotar 5 virus menores.
3. Derrotar 2 bacterias invasoras.
4. Activar el núcleo de Memoria Inmune.
5. Derrotar al Patógeno Alfa.

Aprendizaje:

- El sistema inmune reconoce amenazas.
- Los anticuerpos ayudan a neutralizar patógenos.
- Los ganglios linfáticos funcionan como centros de vigilancia.

---

## 29. Mapas iniciales

Crear un mapa Tiled llamado:

```text
lymph_node_01.json
```

Capas recomendadas:

```text
floor
walls
decor_low
decor_high
collision
objects
npcs
enemies
portals
triggers
```

Objetos importantes:

- Spawn del jugador.
- NPC inicial.
- Zona de enemigos.
- Núcleo de Memoria Inmune.
- Puerta al mini jefe.
- Trigger de victoria.

---

## 30. HUD inicial

Mostrar:

- Barra de vida.
- Barra de energía.
- ADN.
- Fotones.
- Nivel.
- Misión actual.
- Botón/tecla contextual al acercarse a NPC u objeto.

Estilo:

- Pixel art limpio.
- Bordes claros.
- Iconos pequeños.
- Paleta coherente con Guardianes de la Vida.

---

## 31. Publicación

El proyecto debe poder ejecutarse con:

```bash
npm install
npm run dev
```

Y construirse con:

```bash
npm run build
```

Debe generar una carpeta `dist/` publicable en:

- GitHub Pages.
- Netlify.
- Vercel.
- itch.io como HTML5 game.

---

## 32. Tareas iniciales para el agente

El agente debe avanzar en este orden:

1. Crear proyecto Vite con JavaScript.
2. Instalar Phaser.
3. Crear estructura de carpetas.
4. Crear escenas básicas: Boot, Preload, Menu, World, UI.
5. Configurar resolución y escalado pixel art.
6. Crear jugador temporal con sprite placeholder.
7. Implementar movimiento y cámara.
8. Crear mapa temporal o cargar tilemap de prueba.
9. Implementar colisiones.
10. Crear enemigo genérico.
11. Implementar ataque básico con hitbox.
12. Implementar vida y daño.
13. Crear HUD básico.
14. Crear diálogo JSON y caja de diálogo.
15. Crear misión básica.
16. Crear mini jefe.
17. Crear pantalla de victoria.
18. Crear guardado localStorage.
19. Documentar cómo agregar nuevos guardianes, enemigos y mapas.
20. Preparar build web.

---

## 33. Criterios de aceptación de la primera demo

La demo se considera funcional cuando:

- El juego abre en navegador.
- Hay menú de inicio.
- El jugador puede moverse.
- La cámara sigue al jugador.
- Hay colisiones con paredes.
- Hay al menos un NPC interactuable.
- Hay diálogo funcional.
- Hay enemigos que persiguen o reaccionan.
- El jugador puede atacar.
- Los enemigos reciben daño y mueren.
- El jugador puede recibir daño.
- El HUD muestra vida y energía.
- Existe una misión simple.
- Existe un mini jefe.
- Existe pantalla de victoria o cierre.
- El proyecto puede compilarse con `npm run build`.

---

## 34. Indicaciones para el agente de IA

Trabaja por pasos pequeños. No intentes construir todo el juego de una sola vez.

En cada avance:

- Crear o modificar pocos archivos.
- Probar que el proyecto siga ejecutando.
- Mantener el código limpio.
- Explicar brevemente qué se añadió.
- Si falta un asset, usar placeholders simples.
- No bloquearse por falta de arte definitivo.
- Priorizar mecánicas funcionales sobre estética final.
- No eliminar archivos importantes sin justificarlo.
- Mantener compatibilidad con navegador.
- No introducir dependencias innecesarias.

---

## 35. Prompt corto para iniciar en Antigravity

Copia y pega esto en el agente:

```text
Quiero que me ayudes a construir un videojuego web 2D de acción RPG llamado Guardianes de la Vida: Misión Celular. Debe usar Phaser 3, JavaScript, Vite, Tiled para mapas, Aseprite para sprites y JSON para datos editables. El estilo debe ser pixel art 16-bit tipo RPG portátil, sin copiar franquicias existentes. La primera demo será Ataque al Ganglio Linfático: un mapa pequeño con un guardián jugable, movimiento, cámara, colisiones, NPC con diálogo, enemigos, ataque básico, vida, energía, HUD, una misión simple, mini jefe, victoria y guardado localStorage.

Crea primero la estructura base del proyecto con Vite + Phaser. Luego implementa escenas BootScene, PreloadScene, MenuScene, WorldScene y UIScene. Usa placeholders si no hay assets. Mantén el código modular con carpetas scenes, entities, systems, data, ui y utils. Los guardianes, enemigos, habilidades, misiones y diálogos deben cargarse desde JSON. Avanza por pasos pequeños y verifica que npm run dev funcione después de cada fase.
```

---

## 36. Prompt de continuidad para el agente

Cuando el agente termine la base, usar este segundo prompt:

```text
Ahora implementa el prototipo jugable: jugador con movimiento en 4 u 8 direcciones, cámara que sigue al jugador, mapa de prueba con colisiones, enemigo básico que persigue al jugador, ataque básico con hitbox temporal, sistema de vida/daño, HUD con vida y energía, y lectura de datos desde guardians.json y enemies.json. Usa sprites placeholder si es necesario. No agregues sistemas complejos todavía.
```

---

## 37. Prompt para sistema de diálogo y misión

```text
Agrega un sistema de diálogo basado en JSON. Debe permitir NPCs con nombre, retrato opcional y varias líneas de texto. Al terminar un diálogo, debe poder activar una misión. Luego agrega un QuestSystem simple con objetivos tipo hablar, derrotar enemigos e interactuar con objeto. Muestra la misión actual en el HUD.
```

---

## 38. Prompt para mini jefe

```text
Agrega un mini jefe llamado Patógeno Alfa. Debe tener más vida que los enemigos normales, una barra de vida visible y un patrón simple: perseguir al jugador, detenerse, atacar o invocar virus menores. Cuando sea derrotado, mostrar pantalla de victoria. Mantén el código modular y configurable desde enemies.json o bosses.json.
```

---

## 39. Prompt para preparar publicación

```text
Prepara el proyecto para publicación web. Verifica que npm run build funcione, corrige rutas de assets, revisa que la carpeta dist contenga todo lo necesario y agrega instrucciones en README.md para ejecutar, compilar y publicar el juego en GitHub Pages, Netlify o itch.io como juego HTML5.
```

---

## 40. README sugerido para el repositorio

Puedes usar este texto como base para el `README.md` del proyecto:

```markdown
# Guardianes de la Vida: Misión Celular

Videojuego web 2D de acción RPG educativo desarrollado con Phaser 3, JavaScript y Vite.

## Objetivo

Construir una aventura educativa donde los Guardianes de la Vida exploran sistemas del cuerpo humano y ecosistemas para restaurar el equilibrio biológico mediante misiones, combate, recursos científicos y diálogos.

## Tecnologías

- Phaser 3
- JavaScript
- Vite
- Tiled
- Aseprite
- JSON

## Instalación

npm install

## Ejecutar en desarrollo

npm run dev

## Compilar

npm run build

## Primera demo

Ataque al Ganglio Linfático.

Incluye movimiento, cámara, colisiones, enemigos, ataque básico, NPC, diálogo, misión, mini jefe y pantalla de victoria.
```

---

## 41. Roadmap general

### Fase 1: Base técnica

- Proyecto Vite.
- Phaser instalado.
- Escenas principales.
- Escalado pixel art.
- Carga de assets.

### Fase 2: Jugador

- Movimiento.
- Cámara.
- Animaciones placeholder.
- Vida y energía.

### Fase 3: Mapa

- Tilemap de prueba.
- Colisiones.
- Zonas interactivas.
- Puertas y transiciones.

### Fase 4: Combate

- Ataque básico.
- Hitbox.
- Enemigos.
- Daño.
- Experiencia.

### Fase 5: Diálogos y misiones

- NPC.
- Caja de diálogo.
- Misiones desde JSON.
- HUD de misión.

### Fase 6: Mini jefe

- Jefe con vida alta.
- Patrón simple.
- Victoria.

### Fase 7: Guardado

- localStorage.
- Continuar partida.
- Datos básicos persistentes.

### Fase 8: Arte final mínimo

- Tileset del ganglio.
- Sprite de Lynfa o Eri.
- Enemigos básicos.
- UI inicial.

### Fase 9: Publicación

- Build.
- GitHub Pages, Netlify, Vercel o itch.io.

---

## 42. Resultado esperado de la primera etapa

Al finalizar la primera etapa debe existir un repositorio funcional con una demo pequeña pero jugable.

El proyecto debe ser una base para crecer hacia:

- más guardianes jugables;
- más mapas del cuerpo humano;
- minijuegos por hexágonos;
- sistema de cartas;
- progresión RPG;
- capítulos educativos;
- participación de estudiantes en arte, mapas, diálogos, misiones y preguntas científicas.

---

## 43. Regla de oro

Primero crear una **demo vertical pequeña pero jugable**.

Después expandir.

No construir una catedral celular antes de tener una célula viva.

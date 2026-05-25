# Documentación: Guardianes de la Vida (Action RPG)

Esta documentación está diseñada para explicar los conceptos y sistemas clave que hemos implementado en el juego. Su objetivo es que puedas entender cómo interactúan las piezas por debajo y te sirva como material de aprendizaje para expandir el proyecto.

---

## 1. Resolución y Escalado (El Truco del "Pixel Art HD")

Uno de los mayores retos en los juegos *Pixel Art* modernos es cómo hacer que el arte se vea retro (con píxeles grandes y marcados) pero que el texto y la interfaz de usuario (UI) se vean nítidos y modernos.

### ¿Cómo lo resolvimos?
1. **Alta Resolución Lógica**: En `constants.js` definimos `GAME_WIDTH = 1920` y `GAME_HEIGHT = 1080`. Para Phaser, el juego "mide" 1080p, lo que nos da muchísimos píxeles para dibujar textos definidos y nítidos.
2. **Zoom de Cámara (WorldScene)**: En la escena del mundo, aplicamos `this.cameras.main.setZoom(4);`. Esto acerca la cámara al jugador, haciendo que un personaje de 32x32 píxeles se vea gigante en pantalla, conservando la estética retro de los juegos de GameBoy Advance o SNES.
3. **Escenas de UI sin Zoom**: Las escenas `UIScene`, `MenuScene` y `DialogueScene` se dibujan "encima" del mundo utilizando cámaras sin zoom (1x). Esto nos permite colocar textos con tamaño `24px` que se ven perfectos, flotando sobre un mundo pixelado.

> [!TIP]
> Si alguna vez sientes que un texto del mundo (como el nombre del NPC) se ve borroso al acercar la cámara, el truco es crearlo con una fuente grande (ej. `16px`) y reducir su escala matemática (`.setScale(0.25)`). De este modo, la memoria lo guarda en alta calidad y, al recibir el zoom de la cámara, mantiene su definición.

---

## 2. Gestión de Escenas y Pausas

Phaser 3 es extremadamente potente porque permite tener múltiples "Escenas" ejecutándose al mismo tiempo de forma paralela.

En nuestro juego, la arquitectura de escenas funciona así:
- **`WorldScene`**: Maneja el mapa, el jugador, las físicas y los enemigos.
- **`UIScene`**: Se lanza simultáneamente encima de `WorldScene` y nunca se pausa. Maneja las barras de vida y misiones.
- **`DialogueScene` / `PauseScene`**: Se lanzan **temporalmente** por encima de todo cuando interactúas o pausas.

### El flujo de Pausa
Cuando interactúas con un NPC (`W`), `WorldScene` ejecuta:
```javascript
this.scene.pause(); // Congela físicas, updates y animaciones del mundo
this.scene.launch(SCENE.DIALOGUE, { dialogueId: '0001' }); // Inicia el diálogo
```
Al finalizar el diálogo, `DialogueScene` ejecuta:
```javascript
this.scene.resume(SCENE.WORLD); // Descongela el mundo
this.scene.stop(); // Destruye la escena de diálogo
```
Esto asegura que los enemigos no te ataquen por la espalda mientras estás leyendo un texto.

---

## 3. El Sistema de Diálogos y Ramas Condicionales

El sistema de diálogo está diseñado como una **Máquina de Estados de Nodos**. Cada pedazo de conversación es un "nodo" independiente dentro de un gran objeto JSON (en este caso, `DIALOGUE_DB`).

### Estructura de un Nodo
```json
"start": {
  "speaker": "Centinela Linfático",
  "text": "¡Saludos! ¿Te gusta mi interfaz?",
  "choices": [
    { "label": "Sí", "nextNode": "yes_path" },
    { "label": "No", "nextNode": "no_path" }
  ]
}
```
El motor hace lo siguiente al procesar un nodo:
1. Pinta el texto y el nombre.
2. Si `choices` está vacío, el juego sabe que el diálogo termina ahí y pone el botón de `[Enter] para continuar`.
3. Si `choices` tiene datos, el juego dibuja las opciones y calcula matemáticamente dónde deben ir basándose en **la altura real del texto anterior** (`mainText.height`).

### El error de los Controles (Y cómo se solucionó)
En un principio, las flechas de dirección no funcionaban en el diálogo. Esto ocurrió por dos razones técnicas importantes que sirven de gran aprendizaje:

1. **Choque de Input Manager**: `WorldScene` ya estaba "escuchando" las flechas direccionales usando `createCursorKeys()`. Cuando pausamos la escena e intentamos "atrapar" la misma tecla de forma exclusiva usando `addKey()` en `DialogueScene`, el motor colapsó. La solución fue escuchar los **eventos globales de teclado** (`this.input.keyboard.on('keydown-UP')`), que no exigen exclusividad y funcionan siempre en la escena activa.
2. **Reseteo Lógico**: Al mover la flecha, el índice de selección pasaba de `0` a `1` y mandaba a redibujar la pantalla. Pero en la función de redibujado, había una variable `_selectedChoiceIndex = 0` que se ejecutaba en cada ciclo, anulando el movimiento instantáneamente. Lo arreglamos indicando que el índice solo debe volver a cero cuando saltamos a un nuevo `nextNode`.

---

## Próximos Pasos Recomendados

Si quieres seguir experimentando y aprendiendo, te sugiero estos retos para el futuro:
- [ ] **Efecto Máquina de Escribir**: Modificar `DialogueScene` para que el texto aparezca letra por letra en lugar de todo a la vez (usando `this.time.addEvent`).
- [ ] **Data Externa**: Mover `DIALOGUE_DB` a un archivo `.json` independiente en la carpeta `public/` y cargarlo usando `this.load.json()`.
- [ ] **Retratos**: Agregar una imagen (`sprite`) al lado del texto que cambie según quién esté hablando.

# Guía de Assets y Sprites — Guardianes de la Vida: Misión Celular

> **Versión:** 1.0.0
> **Última actualización:** 2026-05-24
>
> Este documento explica cómo crear, convertir y organizar los assets visuales
> del juego: sprites, tilesets, UI e iconos.

---

## 1. Situación actual

No hay sprites ni tilesets en formato de juego todavía.
Existen imágenes de arte de los Guardianes (incluyendo poses con movimiento)
pero **no** en formato sprite sheet ni tileset.

**Mientras no haya arte definitivo, el juego usará placeholders programáticos.**
Esto NO bloquea el desarrollo de mecánicas.

---

## 2. Workflow recomendado para convertir arte a sprites

### Paso 1: Preparar las imágenes fuente

- Exportar cada guardián en fondo transparente (PNG con alpha).
- Separar las poses que tengas: idle, caminar, atacar.
- Resolución recomendada por frame: **32×48 px** (personajes) o múltiplos de eso.

### Paso 2: Crear sprite sheets con IA

Tienes acceso a **Gemini Pro** y **ChatGPT Pro**. Aquí la propuesta:

#### Opción A — Pixel art desde cero con IA (recomendada para empezar)

Usar **ChatGPT (DALL-E 3)** o **Gemini Imagen** para generar sprites en pixel art
directamente, describiendo cada frame de animación.

Prompt base para generar un sprite de Lynfa:
```
Pixel art sprite sheet of a female character called Lynfa.
She represents a plasma cell (immunology). She wears purple/violet armor,
has glowing white/blue accents. Style: 16-bit GBA RPG.
Show idle animation (2 frames), walk down (4 frames), walk up (4 frames),
walk left (4 frames), walk right (4 frames). Each frame is 32x48 pixels.
Transparent background. Clean pixel art, no blur, no anti-aliasing.
Arrange frames in a horizontal sprite sheet.
```

#### Opción B — Convertir arte existente a pixel art (para usar tus imágenes)

1. Tomar las imágenes de los Guardianes que ya tienes.
2. Usar **Aseprite** (o la versión web **Lospec Pixel Art Converter**) para pixelar.
3. Ajustar manualmente para que coincida con el tamaño de tile.

#### Opción C — Placeholders programáticos (para desarrollo inmediato)

Phaser puede dibujar rectángulos y formas con colores.
Lynfa puede ser un **rectángulo morado con una "L"** hasta que lleguen los sprites.
Esto es completamente válido y es la estrategia que usaremos en las primeras fases.

---

## 3. Formato de sprite sheets

```
Archivo: lynfa.png
Formato: PNG con fondo transparente
Organización: filas por animación, columnas por frame
```

### Animaciones de personaje (orden estándar)

| Fila | Animación       | Frames | Dirección |
|------|-----------------|--------|-----------|
| 0    | Idle            | 2      | Abajo     |
| 1    | Caminar         | 4      | Abajo     |
| 2    | Caminar         | 4      | Izquierda |
| 3    | Caminar         | 4      | Derecha   |
| 4    | Caminar         | 4      | Arriba    |
| 5    | Correr          | 4      | Abajo     |
| 6    | Correr          | 4      | Izquierda |
| 7    | Correr          | 4      | Derecha   |
| 8    | Correr          | 4      | Arriba    |
| 9    | Atacar          | 3      | Abajo     |
| 10   | Atacar          | 3      | Izquierda |
| 11   | Atacar          | 3      | Derecha   |
| 12   | Atacar          | 3      | Arriba    |
| 13   | Golpeado (hit)  | 2      | Cualquiera|
| 14   | Derrota         | 4      | Abajo     |

---

## 4. Tamaños estándar del proyecto

| Elemento          | Tamaño (px)      | Notas                        |
|-------------------|------------------|------------------------------|
| Tile base         | 32×32            | Resolución media, clara      |
| Personaje frame   | 32×48            | Más alto que ancho           |
| Enemigo pequeño   | 32×32            | Mismo tamaño que tile        |
| Enemigo mediano   | 48×48            | 1.5× el tile                 |
| Mini jefe         | 64×64            | 2× el tile                   |
| Resolución lógica | 480×270          | 16:9, escala bien a 1080p    |

---

## 5. Tilesets y mapas

### Instalar Tiled (gratuito y open source)

```bash
# Ubuntu/Debian
sudo apt install tiled

# O descargar desde:
# https://www.mapeditor.org/
```

### Estructura del tileset del Ganglio Linfático

Para el primer mapa (`lymph_node_01`), el tileset debe incluir:

```
Tile #0   → fondo (suelo orgánico, tono rojizo/rosado)
Tile #1   → pared sólida (tejido duro)
Tile #2   → decoración (venas, conductos)
Tile #3   → zona de peligro (tejido infectado)
Tile #4   → portal / puerta
Tile #5   → núcleo de Memoria Inmune (animado si es posible)
```

Colores de referencia del ganglio linfático:
- Suelo: `#C97B84` (rosa oscuro orgánico)
- Paredes: `#7B3F5E` (violeta oscuro)
- Decoración: `#E8A5B0` (rosa claro)
- Peligro: `#8B2020` (rojo oscuro)
- Portal: `#4A90D9` (azul cielo)
- Núcleo: `#9B59B6` (violeta brillante)

### Si no usas Tiled todavía

El mapa se puede generar **programáticamente en Phaser** usando una matriz 2D:

```javascript
// Ejemplo de mapa placeholder (0=suelo, 1=pared)
const mapData = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1],
];
```

---

## 6. Recursos y herramientas recomendadas

### Herramientas gratuitas

| Herramienta               | Uso                               | URL                              |
|---------------------------|-----------------------------------|----------------------------------|
| Aseprite                  | Editor de pixel art y sprites     | https://www.aseprite.org/        |
| Tiled Map Editor          | Crear mapas por capas             | https://www.mapeditor.org/       |
| Lospec Palette List       | Paletas de colores pixel art      | https://lospec.com/palette-list  |
| LibreSprite               | Versión gratuita de Aseprite      | https://libresprite.github.io/   |
| Piskel                    | Editor pixel art en navegador     | https://www.piskelapp.com/       |
| TexturePacker (free tier) | Empaquetar sprite sheets          | https://www.codeandweb.com/      |

### IA para generar sprites

| IA          | Cómo usarla para sprites                                |
|-------------|---------------------------------------------------------|
| ChatGPT Pro | DALL-E 3: pixel art sprites, sprite sheets              |
| Gemini Pro  | Imagen 3: pixel art, tilesets, UI elements              |
| Midjourney  | Pixel art characters (requiere suscripción)             |

> **Nota:** Los sprites generados por IA generalmente necesitan ajuste manual
> en Aseprite para que los frames coincidan exactamente con el tamaño del tile.

---

## 7. Nomenclatura de archivos de assets

```
public/assets/sprites/guardians/
  lynfa.png           ← sprite sheet completo
  lynfa_portrait.png  ← retrato para diálogos (64×64 o 80×80)

public/assets/sprites/enemies/
  virus_minor.png
  bacteria_invader.png
  infected_cell.png
  alpha_pathogen.png  ← mini jefe

public/assets/sprites/npcs/
  centinela_linfatico.png

public/assets/tilesets/
  lymph_node_tileset.png

public/assets/maps/
  lymph_node_01.json

public/assets/ui/
  hud_frame.png
  health_bar.png
  energy_bar.png
  icons.png           ← sprite sheet de iconos (ADN, Fotones, etc.)

public/assets/audio/
  bgm_lymph_node.ogg  ← música de fondo
  sfx_attack.ogg
  sfx_hurt.ogg
  sfx_victory.ogg
```

---

## 8. Próximos pasos de assets (en orden de prioridad)

1. **Usar placeholders** para comenzar desarrollo inmediatamente ← estamos aquí
2. Generar sprites de Lynfa (idle + walk) con IA como base
3. Ajustar sprites en Aseprite para que coincidan con el grid
4. Instalar Tiled y crear `lymph_node_01.json`
5. Crear tileset del ganglio linfático
6. Crear sprites de los 3 enemigos básicos
7. Crear retrato de Lynfa y del Centinela para diálogos
8. Arte de UI (barras, iconos)

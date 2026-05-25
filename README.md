# Guardianes de la Vida: Misión Celular 🦠⚔️

> **Demo jugable:** https://guardian-gus.github.io/guardianes-de-la-vida-action-rpg/

Un Action RPG 2D educativo ambientado en el sistema inmunológico humano.
Controla a **Lynfa**, un Plasmocito Guardián, mientras defiende el Ganglio Linfático
de virus, bacterias y patógenos.

---

## 🎮 Controles

### Teclado

| Tecla | Acción |
|-------|--------|
| ← ↑ → ↓ | Mover |
| `S` | Correr |
| `A` | Ataque básico |
| `D` | Habilidad especial (Ráfaga / Trampa) |
| `W` | Interactuar con NPC |
| `Enter` | Pausa |

### Móvil / Tablet

- **Joystick izquierdo** — Mover en 8 direcciones
- **A** (rojo) — Ataque básico
- **S** (naranja) — Correr (mantener presionado)
- **D** (azul) — Habilidad especial
- **W** (verde) — Interactuar
- **⏸** — Pausa

---

## 🚀 Correr localmente

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador → http://localhost:5173/
```

### Requisitos
- Node.js v20+
- npm v10+

---

## 🗂️ Estructura del proyecto

```
guardianes_de_la_vida_action_rpg/
├── public/
│   └── data/              # JSON de guardianes, enemigos, misiones
├── src/
│   ├── config/            # Constantes y configuración de Phaser
│   ├── entities/          # Player, Enemy, Boss, Projectile
│   ├── scenes/            # Todas las escenas del juego
│   └── systems/           # QuestSystem, SaveSystem
├── docs/                  # Documentación del proyecto
└── vite.config.js
```

---

## 🦠 Personajes

| Guardián | Rol | Habilidad |
|---------|-----|-----------|
| **Lynfa** | Plasmocito | Ráfaga y Trampa de Anticuerpos |
| **Eri** *(próximamente)* | Eritrocito | — |

### Enemigos
- **Virus Menor** — perseguidor rápido
- **Bacteria Invasora** — tanque lento
- **Célula Infectada** — daño por contacto
- **Patógeno Alfa** *(jefe)* — 3 fases de comportamiento

---

## 📋 Estado del proyecto

| Fase | Estado |
|------|--------|
| Base técnica (Vite + Phaser) | ✅ |
| Jugador con stats y combate | ✅ |
| Mapa con colisiones | ✅ |
| Sistema de combate | ✅ |
| Diálogos y misiones | ✅ |
| Mini jefe con 3 fases | ✅ |
| Sistema de guardado | ✅ |
| Controles móviles | ✅ |
| Arte pixel art | 🎨 En progreso |
| Publicación | ✅ |

---

## 📚 Contexto educativo

Este juego forma parte del proyecto **Guardianes de la Vida**,
una serie de herramientas educativas interactivas para la enseñanza
de Biología y Ciencias de la Salud.

---

## 🛠️ Tecnologías

- [Phaser 4](https://phaser.io/) — Motor de juego 2D
- [Vite 8](https://vitejs.dev/) — Build tool y dev server
- JavaScript ES2022 (módulos nativos)

---

## 📄 Licencia

Proyecto educativo — todos los derechos reservados.

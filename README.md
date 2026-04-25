# Terraria Clone

A 2D sandbox game inspired by Terraria, built with Phaser 3 and running in the browser.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)

## Setup

```bash
git clone https://github.com/Mobkert/terraria.git
cd terraria
npm install
```

## Running the Game

```bash
npm run dev
```

This starts a local dev server. Open **http://localhost:3000** in your browser to play.

## World Setup Options

When you click **Create World**, you can choose:

- **Game Mode**
  - `Survival`: default progression
  - `Creative`: invincibility and access via a creative inventory menu (double-tap SPACE to toggle flight)
- **Difficulty**
  - `Peaceful`: no hostile mobs spawn
  - `Easy`: fewer hostile mobs
  - `Normal`: standard hostile mob rate
  - `Hard`: more hostile mobs
- **World Type**
  - `Default`: standard terrain generation
  - `Superflat`: flat grass world with no trees
  - `Bigger Biomes`: wider biome stretches
  - `Hilly`: more hills and mountains

### Creative Inventory

- Open inventory with `E` in Creative mode to access the **Creative Inventory** panel.
- Choose item groups with categories:
  - `All`, `Building`, `Natural`, `Utility`, `Combat`, `Food`, `Materials`
- Click an entry to add **1** item.
- **Shift-click** an entry to add a **full stack**.

## Controls

| Key | Action |
|-----|--------|
| A | Move left |
| D | Move right |
| SPACE | Jump (double-tap in Creative to toggle fly mode; hold while flying to go up) |
| SHIFT | Fly down (while flying in Creative) |
| LMB | Break block |
| RMB | Place block / interact |
| E | Open inventory / crafting |
| 1-9 | Select hotbar slot |
| Scroll | Cycle hotbar |

## Building for Production

```bash
npm run build
```

The output goes to the `dist/` folder and can be hosted on any static file server.
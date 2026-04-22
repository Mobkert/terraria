# Game Development Plan - 2D Sandbox (Terraria-Inspired)

A 2D open-world sandbox game built with **Phaser 3** and **Vite**, running in the browser.

## Phase 1: Project Setup and Rendering Foundation (COMPLETED)

- Initialized project with npm, Phaser 3, and Vite dev server
- Created `index.html` with game container and pixel-perfect CSS
- Built `BootScene` to programmatically generate 32x32 pixel-art block textures and a player blob texture
- Set up `GameScene` with basic tile rendering to verify the pipeline
- Entry point in `main.js` configuring Phaser (1280x720, pixelArt mode)

**Key files:** `package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/data/blocks.js`, `src/scenes/BootScene.js`

## Phase 2: World Generation (COMPLETED)

- Procedural world generation (2400x800 tiles) using simplex noise with seeded RNG
- Terrain heightmap with multiple noise octaves for natural-looking hills
- Three biomes (Forest, Desert, Jungle) distributed via noise
- Block layering by depth: surface -> sub-surface (15 blocks) -> stone (60 blocks) -> deepslate
- Cave generation using layered noise with increasing density at depth
- Tree placement (forest/jungle) with trunk and leaf canopy
- Chest placement in underground caves
- Efficient chunk-based sprite rendering via `TileManager` with object pooling

**Key files:** `src/world/WorldGenerator.js`, `src/world/CaveGenerator.js`, `src/world/TileManager.js`

## Phase 3: Player Character (COMPLETED)

- Blue blob sprite with custom tile-based physics (gravity, velocity, collision)
- Movement: A/D for left/right, SPACE to jump
- Collision detection against the tile grid with edge-snapping resolution
- Camera smoothly follows the player
- Spawn point found at world center on the surface
- Held item display: selected hotbar item appears near the player's hand, rotates to follow the cursor. Tools render at full size, blocks at a smaller size

**Key files:** `src/entities/Player.js`, `README.md`

## Phase 4: Block Breaking and Placing (COMPLETED)

- Left mouse button to break blocks within 6-tile reach
- Break progress overlay with darkening and crack lines based on block hardness
- Blocks drop as `DroppedItem` entities with physics, bobbing, and magnetic pickup
- Right mouse button to place blocks (must be adjacent to existing block, not overlapping player)
- Cursor highlight showing targeted tile
- Basic inventory data model (9 hotbar + 27 main slots) with stacking

**Key files:** `src/systems/BlockBreakPlace.js`, `src/entities/DroppedItem.js`, `src/systems/Inventory.js`

## Phase 5: Inventory and Hotbar UI (COMPLETED)

- Separate `UIScene` overlay for all UI elements
- `HotbarUI`: 9-slot bar with item icons, stack counts, selection highlight
- `InventoryUI`: Full 36-slot panel (27 inventory + 9 hotbar)
  - Left-click: pick up, place, swap, merge stacks
  - Right-click: half-stack pickup, single item place
  - Shift-click: quick-move between hotbar and inventory
- Cursor-following item icon when dragging
- Player input disabled while inventory is open
- Hotbar selection via number keys 1-9 and scroll wheel

**Key files:** `src/scenes/UIScene.js`, `src/ui/HotbarUI.js`, `src/ui/InventoryUI.js`

## Phase 6: Crafting System (COMPLETED)

- Unified item type system extending block types (sticks, wooden pickaxe, wooden axe)
- Recipe definitions with ingredients, results, and workbench requirements
- `Crafting` helper class to check availability and consume ingredients
- `CraftingUI` panel with scrollable recipe list alongside inventory
- Hand crafting (press E) vs workbench crafting (right-click workbench)
- Tool speed bonuses: correct tool type mines 3x faster
- Item textures generated programmatically in BootScene

**Key files:** `src/data/items.js`, `src/data/recipes.js`, `src/systems/Crafting.js`, `src/ui/CraftingUI.js`

## Phase 7: Biome Variety and Visual Polish (COMPLETED)

- New blocks: Cactus (spawns in desert), Vine (hangs from jungle leaves, non-solid)
- Desert cacti generation on flat sand surfaces
- Jungle vine generation below leaf blocks
- Smooth biome transitions using noise-based blending at borders
- Sky gradient background that shifts from blue sky to dark underground with depth
- Two parallax mountain silhouette layers behind the terrain
- Biome tint overlay (warm orange for desert, green haze for jungle)
- Non-solid block collision support (vines are pass-through)

**Key files:** `src/scenes/GameScene.js` (background system), `src/world/WorldGenerator.js` (cacti, vines, transitions)

## Phase 8: Chests and Loot Tables (COMPLETED)

- Three-tier depth-based loot tables (shallow, medium, deep)
- `ChestManager` stores per-chest inventories, generates loot on first open
- `ChestUI` panel: 9-slot chest view above inventory with full click interactions
- Right-click chest to open, press E to close
- Breaking a chest drops all its contents as items
- New items: Stone Pickaxe (5x mining speed), Stone Axe (5x chopping speed)
- New recipes: stone tools (stone + sticks at workbench), craftable chests (8 planks at workbench)

**Key files:** `src/data/lootTables.js`, `src/systems/ChestManager.js`, `src/ui/ChestUI.js`

## Phase 9: Health System, Fall Damage, and Grass Essence (COMPLETED)

- Player has 100 HP, displayed as a health bar above the hotbar (green/yellow/red based on HP)
- Fall damage: falls greater than 3 blocks deal `(fallBlocks - 3) * 10` damage
- 1-second invincibility frames after taking damage (player flashes)
- Death at 0 HP: player fades, respawns at spawn point after 1.5 seconds with full health
- Grass Essence item: heals 15 HP, 10% drop chance from grass/jungle grass blocks
- Grass Essence found in cave chest loot at all depths
- Consumable system: hold right-click for 2 seconds with a consumable selected to use it (progress bar shown)

**Key files:** `src/entities/Player.js`, `src/ui/HotbarUI.js`, `src/systems/BlockBreakPlace.js`, `src/data/items.js`

## Phase 10: Cave Generation Overhaul (COMPLETED)

- Caves now only generate in stone and deepslate layers (depth > 16 blocks below surface), no more caves in dirt or sandstone
- Replaced noise-blob algorithm with worm/agent-based tunnel system: 60-100 random walkers carve 2-3 block wide tunnels through stone
- Tunnels change direction and width organically as they progress
- Large rooms (4-12 block radius) generate occasionally along tunnels, creating open caverns
- Chests restricted to cave areas in stone/deepslate with slightly increased spawn rate

**Key files:** `src/world/CaveGenerator.js`, `src/world/WorldGenerator.js`

## Phase 11: Lighting System and Torches (COMPLETED)

- Full dynamic lighting system with a per-tile light map (0-15 light levels)
- Sunlight: all tiles with a clear vertical path to the sky receive maximum light (15)
- BFS flood-fill propagation: light spreads from sources, decaying by 1 per tile, blocked by solid blocks
- Darkness overlay: semi-transparent black rectangles drawn over every visible tile based on its light level (fully transparent at 15, nearly opaque at 0)
- Torch block: placeable light source (light level 12), non-solid, craftable from 1 coal + 1 stick = 4 torches
- Coal item: found in cave chest loot at all depths, used for torch crafting
- Incremental light updates: placing or breaking any block recalculates light in a 32-tile radius, including boundary seeding from surrounding light
- Torches also appear in chest loot tables at all depths
- Non-solid blocks (torches, vines) can be placed where the player is standing

**Key files:** `src/world/TileManager.js` (light map, BFS, darkness overlay), `src/data/blocks.js` (TORCH), `src/data/items.js` (COAL), `src/data/recipes.js`, `src/data/lootTables.js`

## Phase 12: Ores, Furnace, Iron Tools, and Swords (COMPLETED)

- **Ore generation**: Coal ore veins (3-8 blocks) in stone layer, iron ore veins (2-5 blocks) in deep stone/deepslate layer. Placed using random walker algorithm
- **Mining tiers**: Coal and iron ore require a stone pickaxe (tier 2) or better to mine. Wooden pickaxe cannot break them
- **Coal ore** drops coal; **iron ore** drops raw iron
- **Furnace block**: craftable from 8 stone at workbench, interactable. Right-click to open smelting UI
- **Smelting system**: `FurnaceManager` tracks per-furnace state (input, fuel, output, progress). Place raw iron in input + coal as fuel → iron ingot after 3 seconds. Smelting continues automatically while input and fuel remain
- **FurnaceUI**: Three-slot panel (input, fuel, output) with progress arrow and flame indicator. Full click interactions (left/right/shift-click)
- **Iron tools**: Iron Pickaxe (8x speed, tier 3), Iron Axe (8x speed). Crafted from 3 iron ingots + 2 sticks at workbench
- **Swords**: Wooden Sword (10 dmg), Stone Sword (15 dmg), Iron Sword (20 dmg). Crafted from material + stick at workbench
- **New items**: Raw Iron, Iron Ingot added to item system with textures
- Breaking a furnace drops all its contents (input, fuel, output)
- Raw iron and iron ingots added to medium/deep chest loot tables

**Key files:** `src/systems/FurnaceManager.js`, `src/ui/FurnaceUI.js`, `src/world/WorldGenerator.js` (ore gen), `src/data/blocks.js`, `src/data/items.js`, `src/data/recipes.js`

## Phase 13: Enemies and Combat (COMPLETED)

- **Enemy base class** with tile-based physics, gravity, collision, AI movement, health, damage, knockback, and hurt flash
- **Zombie**: walks toward the player, melee contact damage (15 dmg, 40 HP), auto-jumps over 1-block walls
- **Skeleton**: keeps distance from the player, shoots arrow projectiles every 2.5s (8 dmg, 30 HP), has 250px shoot range
- **Bomb Zombie**: sprints at the player (fastest enemy, 85 speed), starts a 1.5s fuse when close, then explodes destroying blocks in a 3-tile radius (40 dmg, 25 HP). Flashes red/white during fuse
- **Arrow projectile**: fired by skeletons, affected by gravity, collides with solid blocks and the player, 5-second lifetime
- **Enemy spawner**: spawns enemies dynamically when the player is underground (5+ blocks below surface), only in dark areas (light level < 7), 15-25 tiles away from the player, max 6 enemies alive, 4-6 second cooldown. Spawn weights: 50% Zombie, 30% Skeleton, 20% Bomb Zombie
- **Sword combat**: left-click with a sword equipped attacks the nearest enemy in the aim direction within 60px range, 400ms attack cooldown. Deals knockback on hit
- **Despawn**: enemies more than 800px from the player are automatically removed
- Programmatic textures for all three enemy types and arrow projectile

**Key files:** `src/entities/Enemy.js`, `src/entities/Arrow.js`, `src/systems/EnemySpawner.js`, `src/systems/BlockBreakPlace.js` (combat), `src/scenes/GameScene.js`

## Phase 14: Birch Forest Biome (COMPLETED)

- Added 4 new block types: `BIRCH_WOOD` (33), `BIRCH_LEAVES` (34), `BIRCH_PLANKS` (35), `BIRCH_GRASS` (36)
- **Birch Wood**: white/cream bark with dark horizontal streaks, rendered as half-width trunk for a skinny appearance
- **Birch Leaves**: orange-colored with darker cluster details
- **Birch Planks**: light tan with subtle grain lines, interchangeable with regular planks in all crafting recipes
- **Birch Grass**: green base with orange speckled top, mixed 50/50 with regular grass in birch biomes
- New `BIRCH` biome added to WorldGenerator (noise range -0.3 to 0.0), with transition blending to adjacent biomes
- Birch trees are taller (5-8 blocks) with higher spawn density (spacing 4-5, 30% chance)
- Birch wood → birch planks recipe (1 wood → 4 planks, hand-craftable)
- Crafting interchangeability system: `INTERCHANGEABLE` map in recipes.js with `getBaseType()` helper; `Crafting.js` updated to count and consume equivalent item types
- Birch biome tint: subtle warm orange overlay (0xcc8844, alpha 0.04)
- Spawn point logic updated to avoid spawning inside birch trees

**Key files:** `src/data/blocks.js`, `src/scenes/BootScene.js`, `src/world/WorldGenerator.js`, `src/data/recipes.js`, `src/systems/Crafting.js`, `src/scenes/GameScene.js`

## Phase 15: Advancement System (COMPLETED)

- Added advancement tracker and UI, toggled with **P** key
- 6 advancements tracked in real-time:
  - **Explorer**: Visit every biome (Forest, Desert, Jungle, Birch Forest)
  - **Lumberjack**: Acquire any logs (wood or birch wood)
  - **Getting Stoned**: Acquire stone
  - **Fuel Up**: Acquire coal
  - **Iron Age**: Acquire iron (raw iron or iron ingot)
  - **Leaf Collector**: Get a full stack (99) of any leaves
- Panel shows completion count, icons, descriptions, and green "DONE" status
- Automatically closes when opening inventory, P closes the panel

**Key files:** `src/systems/AdvancementTracker.js`, `src/ui/AdvancementUI.js`, `src/scenes/UIScene.js`, `src/scenes/GameScene.js`

## Phase 16: Player Customization (COMPLETED)

- Added "Customize" button to the main menu, opening a dedicated customization screen
- **Colors**: 8 blob colors (Blue, Green, Red, Purple, Orange, Pink, Yellow, Cyan) with matching eye/outline tints
- **Accessories**: 5 options — None, Cowboy Hat, Bandana, Banana Peel Hat, Iron Ore Hat
- **Patterns**: 5 body patterns — None, Viney, Heart, Banana, Lightning
- Live preview of the blob at 4x scale while customizing
- Extracted player rendering into reusable `playerRenderer.js` utility; BootScene uses it for default textures
- "Save & Back" applies customization globally by regenerating `player` and `player_side` textures
- Customization state persists between menu and customize screens

**Key files:** `src/data/customization.js`, `src/utils/playerRenderer.js`, `src/scenes/CustomizeScene.js`, `src/scenes/MenuScene.js`, `src/scenes/BootScene.js`, `src/main.js`

## Phase 17: Background Block Layer (COMPLETED)

- Press **B** to toggle between "Frontground" and "Background" placement modes
- Mode indicator displayed next to the hotbar on the right
- Background blocks render behind foreground blocks at reduced opacity (45% alpha, depth -1)
- Player and entities do not collide with background blocks
- Background blocks can be placed adjacent to other background or foreground blocks
- Breaking in background mode only affects background blocks
- Cursor highlight turns blue when in background mode
- Separate `bgTiles` array in world data and `bgSprites` pool in TileManager

**Key files:** `src/world/TileManager.js`, `src/systems/BlockBreakPlace.js`, `src/ui/HotbarUI.js`, `src/scenes/UIScene.js`, `src/systems/Inventory.js`, `src/world/WorldGenerator.js`

## Phase 18: Slabs (COMPLETED)

- Added 5 slab types: Stone Slab, Deepslate Slab, Oak Slab, Birch Slab, Sandstone Slab
- Slabs are half-height blocks that occupy only the bottom half of a tile
- Crafted at a workbench: 3 base blocks → 6 slabs
- `halfHeight: true` property on BlockData drives both rendering and collision
- Slab textures render only the bottom half of the tile (top half transparent)
- Player, enemies, dropped items, and arrows all respect half-height collision
- Players and enemies land on the slab surface (tile midpoint) instead of tile top
- Placement overlap check accounts for the slab's reduced collision area

**Key files:** `src/data/blocks.js`, `src/data/recipes.js`, `src/scenes/BootScene.js`, `src/entities/Player.js`, `src/entities/Enemy.js`, `src/entities/DroppedItem.js`, `src/entities/Arrow.js`, `src/systems/BlockBreakPlace.js`

## Phase 19: Throwable Bombs (COMPLETED)

- Added **Gunpowder** item dropped by Bomb Zombies (65% on explode, 80% on kill without exploding)
- Added **Bomb** item craftable from 1 gunpowder + 1 coal (hand-craftable)
- Bombs are throwable projectiles: select in hotbar and LMB to throw towards the cursor
- Thrown bombs have gravity and spin mid-air
- Explodes on contact with a solid block or enemy
- Explosion deals 40 damage and destroys blocks in a radius of 3 (same as Bomb Zombie explosion)
- Explosion also damages the player if in range (with knockback)
- Visual explosion effect (expanding fireballs) on detonation
- Bomb Zombie `pendingDrops` system allows enemies to drop items on death

**Key files:** `src/data/items.js`, `src/data/recipes.js`, `src/entities/ThrownBomb.js`, `src/entities/Enemy.js`, `src/scenes/GameScene.js`, `src/systems/BlockBreakPlace.js`, `src/scenes/BootScene.js`

## Phase 20: Passive Animals and Food (COMPLETED)

- **Sheep, cow, pig** friendly mobs (Option C pixel style): wander, idle, random hops, auto-jump low ledges; `AnimalSpawner` uses low caps / long cooldowns, biome-weighted types (cows oak/forest, pigs birch, sheep jungle+desert, ~16% off-type each), desert included for sand-surface spawns
- **Sword and bombs** damage animals; drops spawn as `DroppedItem` on death; despawn if over 1000px from player
- **Sheep:** raw mutton + ~55% wool block drop; **cow:** 1–2 raw steak; **pig:** 1 raw porkchop
- **Furnace:** smelt raw mutton → cooked mutton, raw steak → cooked steak, raw porkchop → cooked porkchop (same rules as iron: coal fuel, 3s)
- **Consumables (RMB hold):** raw/cooked meats heal as specified; **bacon** (3 cooked porkchop at workbench) heals like cooked porkchop but uses shorter consume time (~0.65s)
- **Wool** block: soft decoration tile with texture detail in `BootScene`

**Key files:** `src/entities/Animal.js`, `src/systems/AnimalSpawner.js`, `src/data/items.js`, `src/data/blocks.js`, `src/data/recipes.js`, `src/systems/FurnaceManager.js`, `src/systems/BlockBreakPlace.js`, `src/entities/ThrownBomb.js`, `src/scenes/GameScene.js`, `src/scenes/BootScene.js`

## Controls Summary

| Key | Action |
|-----|--------|
| A | Move left |
| D | Move right |
| SPACE | Jump |
| LMB | Break block / sword attack / throw bomb |
| RMB | Place block / interact / use consumable (hold 2s) |
| E | Open inventory / crafting |
| 1-9 | Select hotbar slot |
| P | Open advancements |
| B | Toggle background/frontground mode |
| Scroll | Cycle hotbar |

## Tech Stack

- **Engine:** Phaser 3 (JavaScript)
- **Build:** Vite
- **Rendering:** Sprite-based with object pooling via TileManager
- **World:** 2400x800 tile grid stored in Uint8Array
- **Physics:** Custom tile-based collision (no Arcade Physics for tiles)
- **Textures:** All generated programmatically at boot (no external images)

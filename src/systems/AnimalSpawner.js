import { TILE_SIZE } from '../data/blocks.js';
import Animal from '../entities/Animal.js';

/** Hard cap — keeps herds from growing huge near the player. */
const MAX_ANIMALS = 7;

/** Base time between spawn attempts (ms). */
const SPAWN_COOLDOWN_MIN = 9000;
const SPAWN_COOLDOWN_MAX = 16000;

/** Extra delay per animal already alive (soft throttle). */
const EXTRA_MS_PER_ANIMAL = 1800;

const MIN_DIST_TILES = 12;
const MAX_DIST_TILES = 28;

const SPAWN_BIOMES = new Set(['forest', 'jungle', 'birch', 'desert']);

/**
 * Cumulative weights: sheep, then cow, then pig (must sum pig = 1).
 * Primary mob ~68%; the other two ~16% each so "wrong" biomes still appear.
 */
const BIOME_WEIGHTS = {
  forest: { sheep: 0.16, cow: 0.84, pig: 1.0 },
  birch: { sheep: 0.16, cow: 0.32, pig: 1.0 },
  jungle: { sheep: 0.68, cow: 0.84, pig: 1.0 },
  desert: { sheep: 0.68, cow: 0.84, pig: 1.0 },
};

function pickAnimalType(biome) {
  const w = BIOME_WEIGHTS[biome];
  const r = Math.random();
  if (!w) {
    if (r < 1 / 3) return 'SHEEP';
    if (r < 2 / 3) return 'COW';
    return 'PIG';
  }
  if (r < w.sheep) return 'SHEEP';
  if (r < w.cow) return 'COW';
  return 'PIG';
}

export default class AnimalSpawner {
  constructor(scene, tileManager, worldData) {
    this.scene = scene;
    this.tileManager = tileManager;
    this.worldData = worldData;
    this.timer = 3500;
  }

  scheduleNextSpawn(animalsLen) {
    const base = SPAWN_COOLDOWN_MIN + Math.random() * (SPAWN_COOLDOWN_MAX - SPAWN_COOLDOWN_MIN);
    const extra = Math.max(0, animalsLen) * EXTRA_MS_PER_ANIMAL;
    this.timer = base + extra;
  }

  update(delta, player, animals) {
    if (player.dead) return;

    const px = player.getTileX();
    const py = player.getTileY();
    const surfaceY = this.worldData.surfaceHeights[
      Math.max(0, Math.min(px, this.worldData.width - 1))
    ];

    if (py > surfaceY + 10) return;

    if (animals.length >= MAX_ANIMALS) return;

    this.timer -= delta;
    if (this.timer > 0) return;

    const dir = Math.random() < 0.5 ? -1 : 1;
    const dist =
      MIN_DIST_TILES + Math.floor(Math.random() * (MAX_DIST_TILES - MIN_DIST_TILES));
    const spawnTx = px + dir * dist;

    if (spawnTx < 2 || spawnTx >= this.worldData.width - 2) {
      this.scheduleNextSpawn(animals.length);
      return;
    }

    const biome = this.worldData.biomes[spawnTx];
    if (!SPAWN_BIOMES.has(biome)) {
      this.scheduleNextSpawn(animals.length);
      return;
    }

    let spawnTy = null;
    for (let y = surfaceY - 4; y <= surfaceY + 6; y++) {
      if (y < 2 || y >= this.worldData.height - 2) continue;
      const below = this.tileManager.getBlock(spawnTx, y + 1);
      const at = this.tileManager.getBlock(spawnTx, y);
      const above = this.tileManager.getBlock(spawnTx, y - 1);
      if (this.tileManager.isSolid(spawnTx, y + 1) && at === 0 && above === 0) {
        spawnTy = y;
        break;
      }
    }

    if (spawnTy === null) {
      this.scheduleNextSpawn(animals.length);
      return;
    }

    if (animals.length >= 4 && Math.random() < 0.22) {
      this.scheduleNextSpawn(animals.length);
      return;
    }

    const spawnX = spawnTx * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = (spawnTy + 1) * TILE_SIZE;

    const typeKey = pickAnimalType(biome);
    animals.push(new Animal(this.scene, spawnX, spawnY, typeKey, this.tileManager));

    this.scheduleNextSpawn(animals.length);
  }
}

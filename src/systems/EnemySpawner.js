import { TILE_SIZE, BlockTypes } from '../data/blocks.js';
import Enemy from '../entities/Enemy.js';

const MAX_ENEMIES = 6;
const SPAWN_COOLDOWN = 4000;
const MIN_SPAWN_DIST = 15;
const MAX_SPAWN_DIST = 25;

export default class EnemySpawner {
  constructor(scene, tileManager, worldData, options = {}) {
    this.scene = scene;
    this.tileManager = tileManager;
    this.worldData = worldData;
    this.difficulty = options.difficulty || 'normal';
    this.spawningEnabled = this.difficulty !== 'peaceful';
    this.spawnSettings = this.getSpawnSettings(this.difficulty);
    this.timer = this.spawnSettings.baseCooldown;
    this.wasNight = false;
  }

  getSpawnSettings(difficulty) {
    switch (difficulty) {
      case 'easy':
        return { maxEnemies: 4, baseCooldown: 5200, cooldownVariance: 2600 };
      case 'hard':
        return { maxEnemies: 10, baseCooldown: 2600, cooldownVariance: 1400 };
      case 'peaceful':
        return { maxEnemies: 0, baseCooldown: SPAWN_COOLDOWN, cooldownVariance: 0 };
      default:
        return { maxEnemies: MAX_ENEMIES, baseCooldown: SPAWN_COOLDOWN, cooldownVariance: 2000 };
    }
  }

  update(delta, player, enemies) {
    if (!this.spawningEnabled) return;
    if (player.dead) return;
    if (!this.scene.isNight) {
      this.wasNight = false;
      return;
    }

    if (!this.wasNight) {
      // Kick off fresh night with a quicker first spawn.
      this.timer = Math.min(this.timer, 700);
      this.wasNight = true;
    }

    const px = player.getTileX();

    if (enemies.length >= this.spawnSettings.maxEnemies) return;

    this.timer -= delta;
    if (this.timer > 0) return;
    const rawNightIntensity = this.scene.nightIntensity ?? 1;
    const nightIntensity = Math.max(0, Math.min(1, rawNightIntensity));
    const cooldownMul = 0.75 + (0.52 - 0.75) * nightIntensity;
    this.timer =
      this.spawnSettings.baseCooldown * cooldownMul +
      Math.random() * this.spawnSettings.cooldownVariance * cooldownMul;

    const dir = Math.random() < 0.5 ? -1 : 1;
    const dist = MIN_SPAWN_DIST + Math.floor(Math.random() * (MAX_SPAWN_DIST - MIN_SPAWN_DIST));
    const spawnTx = px + dir * dist;

    if (spawnTx < 0 || spawnTx >= this.worldData.width) return;

    let spawnTy = null;
    const searchCenter = this.worldData.surfaceHeights[spawnTx];
    for (let y = searchCenter - 8; y <= searchCenter + 20; y++) {
      if (y < 0 || y >= this.worldData.height - 1) continue;
      const at = this.tileManager.getBlock(spawnTx, y);
      const above = this.tileManager.getBlock(spawnTx, y - 1);
      if (this.tileManager.isSolid(spawnTx, y + 1) && at === 0 && above === 0) {
        spawnTy = y;
        break;
      }
    }

    if (spawnTy === null) return;

    const light = this.tileManager.getLight(spawnTx, spawnTy);
    if (light > 6) return;
    if (this.isNearTorch(spawnTx, spawnTy, 8)) return;

    const spawnX = spawnTx * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = (spawnTy + 1) * TILE_SIZE;

    const roll = Math.random();
    let type;
    if (roll < 0.5) type = 'ZOMBIE';
    else if (roll < 0.8) type = 'SKELETON';
    else type = 'BOMB_ZOMBIE';

    const enemy = new Enemy(this.scene, spawnX, spawnY, type, this.tileManager);
    enemies.push(enemy);
  }

  isNearTorch(tx, ty, radius) {
    for (let x = tx - radius; x <= tx + radius; x++) {
      for (let y = ty - radius; y <= ty + radius; y++) {
        if (this.tileManager.getBlock(x, y) === BlockTypes.TORCH) return true;
      }
    }
    return false;
  }
}

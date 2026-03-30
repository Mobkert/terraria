import { TILE_SIZE } from '../data/blocks.js';
import Enemy from '../entities/Enemy.js';

const MAX_ENEMIES = 6;
const SPAWN_COOLDOWN = 4000;
const MIN_SPAWN_DIST = 15;
const MAX_SPAWN_DIST = 25;
const UNDERGROUND_DEPTH = 5;

export default class EnemySpawner {
  constructor(scene, tileManager, worldData) {
    this.scene = scene;
    this.tileManager = tileManager;
    this.worldData = worldData;
    this.timer = SPAWN_COOLDOWN;
  }

  update(delta, player, enemies) {
    if (player.dead) return;

    const px = player.getTileX();
    const py = player.getTileY();
    const surfaceY = this.worldData.surfaceHeights[
      Math.max(0, Math.min(px, this.worldData.width - 1))
    ];

    if (py < surfaceY + UNDERGROUND_DEPTH) return;

    if (enemies.length >= MAX_ENEMIES) return;

    this.timer -= delta;
    if (this.timer > 0) return;
    this.timer = SPAWN_COOLDOWN + Math.random() * 2000;

    const dir = Math.random() < 0.5 ? -1 : 1;
    const dist = MIN_SPAWN_DIST + Math.floor(Math.random() * (MAX_SPAWN_DIST - MIN_SPAWN_DIST));
    const spawnTx = px + dir * dist;

    if (spawnTx < 0 || spawnTx >= this.worldData.width) return;

    const light = this.tileManager.getLight(spawnTx, py);
    if (light > 6) return;

    let spawnTy = null;
    for (let y = py - 5; y <= py + 10; y++) {
      if (y < 0 || y >= this.worldData.height - 1) continue;
      const below = this.tileManager.getBlock(spawnTx, y + 1);
      const at = this.tileManager.getBlock(spawnTx, y);
      const above = this.tileManager.getBlock(spawnTx, y - 1);
      if (this.tileManager.isSolid(spawnTx, y + 1) && at === 0 && above === 0) {
        spawnTy = y;
        break;
      }
    }

    if (spawnTy === null) return;

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
}

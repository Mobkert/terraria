import { rollLoot } from '../data/lootTables.js';

const CHEST_SLOTS = 9;

export default class ChestManager {
  constructor(worldData, rng) {
    this.worldData = worldData;
    this.rng = rng;
    this.chests = new Map();
  }

  key(x, y) {
    return `${x},${y}`;
  }

  getChest(x, y) {
    const k = this.key(x, y);
    if (!this.chests.has(k)) {
      this.chests.set(k, this.generateChest(x, y));
    }
    return this.chests.get(k);
  }

  generateChest(x, y) {
    const surfaceY = this.worldData.surfaceHeights[x] || 100;
    const depth = y - surfaceY;
    const loot = rollLoot(depth, this.rng);

    const slots = new Array(CHEST_SLOTS).fill(null);
    for (const item of loot) {
      for (let i = 0; i < CHEST_SLOTS; i++) {
        if (!slots[i]) {
          slots[i] = { type: item.type, count: item.count };
          break;
        }
      }
    }

    return slots;
  }

  removeChest(x, y) {
    this.chests.delete(this.key(x, y));
  }
}

import { BlockTypes } from '../data/blocks.js';
import { ItemTypes } from '../data/items.js';

export const Advancements = [
  {
    id: 'explore_all_biomes',
    name: 'Explorer',
    description: 'Visit every biome',
    icon: 'block_1',
  },
  {
    id: 'acquire_logs',
    name: 'Lumberjack',
    description: 'Acquire any logs',
    icon: 'block_7',
    items: [BlockTypes.WOOD, BlockTypes.BIRCH_WOOD],
  },
  {
    id: 'acquire_stone',
    name: 'Getting Stoned',
    description: 'Acquire stone',
    icon: 'block_3',
    items: [BlockTypes.STONE],
  },
  {
    id: 'acquire_coal',
    name: 'Fuel Up',
    description: 'Acquire coal',
    icon: 'item_22',
    items: [ItemTypes.COAL],
  },
  {
    id: 'acquire_iron',
    name: 'Iron Age',
    description: 'Acquire iron',
    icon: 'item_27',
    items: [ItemTypes.RAW_IRON, ItemTypes.IRON_INGOT],
  },
  {
    id: 'stack_leaves',
    name: 'Leaf Collector',
    description: 'Get a stack of any leaves',
    icon: 'block_8',
    items: [BlockTypes.LEAVES, BlockTypes.BIRCH_LEAVES],
    stackRequired: 99,
  },
];

const ALL_BIOMES = ['forest', 'desert', 'jungle', 'birch'];

export default class AdvancementTracker {
  constructor(inventory) {
    this.inventory = inventory;
    this.completed = {};
    this.visitedBiomes = new Set();
    this.dirty = true;
    this.pendingToasts = [];
  }

  update(currentBiome) {
    if (currentBiome && !this.visitedBiomes.has(currentBiome)) {
      this.visitedBiomes.add(currentBiome);
      this.dirty = true;
    }

    for (const adv of Advancements) {
      if (this.completed[adv.id]) continue;

      let justCompleted = false;

      if (adv.id === 'explore_all_biomes') {
        if (ALL_BIOMES.every(b => this.visitedBiomes.has(b))) {
          justCompleted = true;
        }
      } else if (adv.items) {
        const needed = adv.stackRequired || 1;
        for (const itemType of adv.items) {
          if (this.inventory.countItem(itemType) >= needed) {
            justCompleted = true;
            break;
          }
        }
      }

      if (justCompleted) {
        this.completed[adv.id] = true;
        this.dirty = true;
        this.pendingToasts.push(adv);
      }
    }
  }

  isCompleted(id) {
    return !!this.completed[id];
  }

  getCompletedCount() {
    return Object.keys(this.completed).length;
  }
}

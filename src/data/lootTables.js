import { BlockTypes } from './blocks.js';
import { ItemTypes } from './items.js';

const SHALLOW = [
  { type: BlockTypes.WOOD, count: [3, 8], weight: 5 },
  { type: BlockTypes.PLANKS, count: [2, 6], weight: 4 },
  { type: ItemTypes.STICK, count: [4, 10], weight: 4 },
  { type: BlockTypes.DIRT, count: [5, 15], weight: 3 },
  { type: ItemTypes.WOODEN_PICKAXE, count: [1, 1], weight: 2 },
  { type: ItemTypes.WOODEN_AXE, count: [1, 1], weight: 2 },
  { type: ItemTypes.GRASS_ESSENCE, count: [1, 3], weight: 3 },
  { type: ItemTypes.COAL, count: [2, 6], weight: 4 },
  { type: BlockTypes.TORCH, count: [3, 6], weight: 3 },
];

const MEDIUM = [
  { type: BlockTypes.STONE, count: [5, 15], weight: 4 },
  { type: BlockTypes.SANDSTONE, count: [3, 10], weight: 3 },
  { type: BlockTypes.PLANKS, count: [4, 12], weight: 3 },
  { type: ItemTypes.WOODEN_PICKAXE, count: [1, 1], weight: 3 },
  { type: ItemTypes.WOODEN_AXE, count: [1, 1], weight: 2 },
  { type: ItemTypes.STONE_PICKAXE, count: [1, 1], weight: 2 },
  { type: ItemTypes.STONE_AXE, count: [1, 1], weight: 1 },
  { type: BlockTypes.WORKBENCH, count: [1, 1], weight: 1 },
  { type: ItemTypes.GRASS_ESSENCE, count: [2, 5], weight: 3 },
  { type: ItemTypes.COAL, count: [3, 8], weight: 4 },
  { type: BlockTypes.TORCH, count: [4, 10], weight: 3 },
];

const DEEP = [
  { type: BlockTypes.STONE, count: [8, 20], weight: 3 },
  { type: BlockTypes.DEEPSLATE, count: [5, 12], weight: 3 },
  { type: ItemTypes.STONE_PICKAXE, count: [1, 1], weight: 4 },
  { type: ItemTypes.STONE_AXE, count: [1, 1], weight: 3 },
  { type: BlockTypes.PLANKS, count: [6, 16], weight: 2 },
  { type: BlockTypes.WORKBENCH, count: [1, 1], weight: 2 },
  { type: ItemTypes.GRASS_ESSENCE, count: [3, 6], weight: 3 },
  { type: ItemTypes.COAL, count: [5, 12], weight: 4 },
  { type: BlockTypes.TORCH, count: [6, 14], weight: 3 },
];

export function getLootTable(depth) {
  if (depth < 40) return SHALLOW;
  if (depth < 80) return MEDIUM;
  return DEEP;
}

export function rollLoot(depth, rng) {
  const table = getLootTable(depth);
  const totalWeight = table.reduce((sum, e) => sum + e.weight, 0);
  const itemCount = 2 + Math.floor(rng() * 4);
  const results = [];

  for (let i = 0; i < itemCount; i++) {
    let roll = rng() * totalWeight;
    for (const entry of table) {
      roll -= entry.weight;
      if (roll <= 0) {
        const [min, max] = entry.count;
        const count = min + Math.floor(rng() * (max - min + 1));
        const existing = results.find((r) => r.type === entry.type);
        if (existing) {
          existing.count += count;
        } else {
          results.push({ type: entry.type, count });
        }
        break;
      }
    }
  }

  return results;
}

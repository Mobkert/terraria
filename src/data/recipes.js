import { BlockTypes } from './blocks.js';
import { ItemTypes } from './items.js';

export const INTERCHANGEABLE = {
  [BlockTypes.BIRCH_PLANKS]: BlockTypes.PLANKS,
};

export function getBaseType(type) {
  return INTERCHANGEABLE[type] || type;
}

export const Recipes = [
  {
    result: { type: BlockTypes.PLANKS, count: 4 },
    ingredients: [{ type: BlockTypes.WOOD, count: 1 }],
    workbench: false,
  },
  {
    result: { type: BlockTypes.BIRCH_PLANKS, count: 4 },
    ingredients: [{ type: BlockTypes.BIRCH_WOOD, count: 1 }],
    workbench: false,
  },
  {
    result: { type: ItemTypes.STICK, count: 4 },
    ingredients: [{ type: BlockTypes.PLANKS, count: 1 }],
    workbench: false,
  },
  {
    result: { type: BlockTypes.WORKBENCH, count: 1 },
    ingredients: [{ type: BlockTypes.PLANKS, count: 4 }],
    workbench: false,
  },
  {
    result: { type: ItemTypes.WOODEN_PICKAXE, count: 1 },
    ingredients: [
      { type: BlockTypes.PLANKS, count: 3 },
      { type: ItemTypes.STICK, count: 2 },
    ],
    workbench: true,
  },
  {
    result: { type: ItemTypes.WOODEN_AXE, count: 1 },
    ingredients: [
      { type: BlockTypes.PLANKS, count: 3 },
      { type: ItemTypes.STICK, count: 2 },
    ],
    workbench: true,
  },
  {
    result: { type: ItemTypes.STONE_PICKAXE, count: 1 },
    ingredients: [
      { type: BlockTypes.STONE, count: 3 },
      { type: ItemTypes.STICK, count: 2 },
    ],
    workbench: true,
  },
  {
    result: { type: ItemTypes.STONE_AXE, count: 1 },
    ingredients: [
      { type: BlockTypes.STONE, count: 3 },
      { type: ItemTypes.STICK, count: 2 },
    ],
    workbench: true,
  },
  {
    result: { type: BlockTypes.CHEST, count: 1 },
    ingredients: [{ type: BlockTypes.PLANKS, count: 8 }],
    workbench: true,
  },
  {
    result: { type: BlockTypes.TORCH, count: 4 },
    ingredients: [
      { type: ItemTypes.COAL, count: 1 },
      { type: ItemTypes.STICK, count: 1 },
    ],
    workbench: false,
  },
  {
    result: { type: BlockTypes.FURNACE, count: 1 },
    ingredients: [{ type: BlockTypes.STONE, count: 8 }],
    workbench: true,
  },
  {
    result: { type: ItemTypes.IRON_PICKAXE, count: 1 },
    ingredients: [
      { type: ItemTypes.IRON_INGOT, count: 3 },
      { type: ItemTypes.STICK, count: 2 },
    ],
    workbench: true,
  },
  {
    result: { type: ItemTypes.IRON_AXE, count: 1 },
    ingredients: [
      { type: ItemTypes.IRON_INGOT, count: 3 },
      { type: ItemTypes.STICK, count: 2 },
    ],
    workbench: true,
  },
  {
    result: { type: ItemTypes.WOODEN_SWORD, count: 1 },
    ingredients: [
      { type: BlockTypes.PLANKS, count: 2 },
      { type: ItemTypes.STICK, count: 1 },
    ],
    workbench: true,
  },
  {
    result: { type: ItemTypes.STONE_SWORD, count: 1 },
    ingredients: [
      { type: BlockTypes.STONE, count: 2 },
      { type: ItemTypes.STICK, count: 1 },
    ],
    workbench: true,
  },
  {
    result: { type: ItemTypes.IRON_SWORD, count: 1 },
    ingredients: [
      { type: ItemTypes.IRON_INGOT, count: 2 },
      { type: ItemTypes.STICK, count: 1 },
    ],
    workbench: true,
  },
  {
    result: { type: BlockTypes.STONE_SLAB, count: 6 },
    ingredients: [{ type: BlockTypes.STONE, count: 3 }],
    workbench: true,
  },
  {
    result: { type: BlockTypes.DEEPSLATE_SLAB, count: 6 },
    ingredients: [{ type: BlockTypes.DEEPSLATE, count: 3 }],
    workbench: true,
  },
  {
    result: { type: BlockTypes.OAK_SLAB, count: 6 },
    ingredients: [{ type: BlockTypes.PLANKS, count: 3 }],
    workbench: true,
  },
  {
    result: { type: BlockTypes.BIRCH_SLAB, count: 6 },
    ingredients: [{ type: BlockTypes.BIRCH_PLANKS, count: 3 }],
    workbench: true,
  },
  {
    result: { type: BlockTypes.SANDSTONE_SLAB, count: 6 },
    ingredients: [{ type: BlockTypes.SANDSTONE, count: 3 }],
    workbench: true,
  },
  {
    result: { type: ItemTypes.BOMB, count: 1 },
    ingredients: [
      { type: ItemTypes.GUNPOWDER, count: 1 },
      { type: ItemTypes.COAL, count: 1 },
    ],
    workbench: false,
  },
];

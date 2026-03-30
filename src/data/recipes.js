import { BlockTypes } from './blocks.js';
import { ItemTypes } from './items.js';

export const Recipes = [
  {
    result: { type: BlockTypes.PLANKS, count: 4 },
    ingredients: [{ type: BlockTypes.WOOD, count: 1 }],
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
];

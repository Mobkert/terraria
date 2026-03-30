import { BlockTypes, BlockData } from './blocks.js';

export const ItemTypes = {
  ...BlockTypes,
  STICK: 13,
  WOODEN_PICKAXE: 14,
  WOODEN_AXE: 15,
  STONE_PICKAXE: 18,
  STONE_AXE: 19,
  GRASS_ESSENCE: 20,
  COAL: 22,
};

export const ItemData = {
  [ItemTypes.STICK]: {
    name: 'Stick',
    stackSize: 99,
  },
  [ItemTypes.WOODEN_PICKAXE]: {
    name: 'Wooden Pickaxe',
    stackSize: 1,
    toolType: 'pickaxe',
    toolSpeed: 3,
  },
  [ItemTypes.WOODEN_AXE]: {
    name: 'Wooden Axe',
    stackSize: 1,
    toolType: 'axe',
    toolSpeed: 3,
  },
  [ItemTypes.STONE_PICKAXE]: {
    name: 'Stone Pickaxe',
    stackSize: 1,
    toolType: 'pickaxe',
    toolSpeed: 5,
  },
  [ItemTypes.STONE_AXE]: {
    name: 'Stone Axe',
    stackSize: 1,
    toolType: 'axe',
    toolSpeed: 5,
  },
  [ItemTypes.GRASS_ESSENCE]: {
    name: 'Grass Essence',
    stackSize: 99,
    consumable: true,
    healAmount: 15,
  },
  [ItemTypes.COAL]: {
    name: 'Coal',
    stackSize: 99,
  },
};

export function getItemName(type) {
  if (BlockData[type]) return BlockData[type].name;
  if (ItemData[type]) return ItemData[type].name;
  return '?';
}

export function getItemTexture(type) {
  if (BlockData[type]) return `block_${type}`;
  return `item_${type}`;
}

export function isBlock(type) {
  return BlockData[type] !== undefined;
}

export function getMaxStack(type) {
  if (ItemData[type]?.stackSize !== undefined) return ItemData[type].stackSize;
  return 99;
}

export function getToolData(type) {
  return ItemData[type]?.toolType ? ItemData[type] : null;
}

export function getConsumableData(type) {
  return ItemData[type]?.consumable ? ItemData[type] : null;
}

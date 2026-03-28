import { BlockTypes, BlockData } from './blocks.js';

export const ItemTypes = {
  ...BlockTypes,
  STICK: 13,
  WOODEN_PICKAXE: 14,
  WOODEN_AXE: 15,
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
};

export function getItemName(type) {
  if (BlockData[type]) return BlockData[type].name;
  if (ItemData[type]) return ItemData[type].name;
  return '?';
}

export function getItemTexture(type) {
  if (type >= 1 && type <= 12) return `block_${type}`;
  return `item_${type}`;
}

export function isBlock(type) {
  return type >= 1 && type <= 12;
}

export function getMaxStack(type) {
  if (ItemData[type]?.stackSize !== undefined) return ItemData[type].stackSize;
  return 99;
}

export function getToolData(type) {
  return ItemData[type]?.toolType ? ItemData[type] : null;
}

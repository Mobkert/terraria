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
  RAW_IRON: 26,
  IRON_INGOT: 27,
  IRON_PICKAXE: 28,
  IRON_AXE: 29,
  WOODEN_SWORD: 30,
  STONE_SWORD: 31,
  IRON_SWORD: 32,
  GUNPOWDER: 42,
  BOMB: 43,
  RAW_MUTTON: 45,
  COOKED_MUTTON: 46,
  RAW_STEAK: 47,
  COOKED_STEAK: 48,
  RAW_PORKCHOP: 49,
  COOKED_PORKCHOP: 50,
  BACON: 51,
  TIME_SWITCHER: 52,
  /** Creative: right-click toggles normal rain on/off (until toggled again). */
  RAIN_CALLER: 53,
  /** Creative + acid rain mod: right-click toggles acid rain on/off. */
  ACID_RAIN_CALLER: 54,
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
    toolTier: 1,
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
    toolTier: 2,
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
  [ItemTypes.RAW_IRON]: {
    name: 'Raw Iron',
    stackSize: 99,
  },
  [ItemTypes.IRON_INGOT]: {
    name: 'Iron Ingot',
    stackSize: 99,
  },
  [ItemTypes.IRON_PICKAXE]: {
    name: 'Iron Pickaxe',
    stackSize: 1,
    toolType: 'pickaxe',
    toolSpeed: 8,
    toolTier: 3,
  },
  [ItemTypes.IRON_AXE]: {
    name: 'Iron Axe',
    stackSize: 1,
    toolType: 'axe',
    toolSpeed: 8,
  },
  [ItemTypes.WOODEN_SWORD]: {
    name: 'Wooden Sword',
    stackSize: 1,
    toolType: 'sword',
    damage: 10,
  },
  [ItemTypes.STONE_SWORD]: {
    name: 'Stone Sword',
    stackSize: 1,
    toolType: 'sword',
    damage: 15,
  },
  [ItemTypes.IRON_SWORD]: {
    name: 'Iron Sword',
    stackSize: 1,
    toolType: 'sword',
    damage: 20,
  },
  [ItemTypes.GUNPOWDER]: {
    name: 'Gunpowder',
    stackSize: 99,
  },
  [ItemTypes.BOMB]: {
    name: 'Bomb',
    stackSize: 99,
    throwable: true,
    damage: 40,
    explodeRadius: 3,
  },
  [ItemTypes.RAW_MUTTON]: {
    name: 'Raw Mutton',
    stackSize: 99,
    consumable: true,
    healAmount: 4,
  },
  [ItemTypes.COOKED_MUTTON]: {
    name: 'Cooked Mutton',
    stackSize: 99,
    consumable: true,
    healAmount: 15,
  },
  [ItemTypes.RAW_STEAK]: {
    name: 'Raw Steak',
    stackSize: 99,
    consumable: true,
    healAmount: 7,
  },
  [ItemTypes.COOKED_STEAK]: {
    name: 'Cooked Steak',
    stackSize: 99,
    consumable: true,
    healAmount: 23,
  },
  [ItemTypes.RAW_PORKCHOP]: {
    name: 'Raw Porkchop',
    stackSize: 99,
    consumable: true,
    healAmount: 5,
  },
  [ItemTypes.COOKED_PORKCHOP]: {
    name: 'Cooked Porkchop',
    stackSize: 99,
    consumable: true,
    healAmount: 17,
  },
  [ItemTypes.BACON]: {
    name: 'Bacon',
    stackSize: 99,
    consumable: true,
    healAmount: 17,
    consumeTime: 650,
  },
  [ItemTypes.TIME_SWITCHER]: {
    name: 'Time Switcher',
    stackSize: 1,
    timeToggle: true,
  },
  [ItemTypes.RAIN_CALLER]: {
    name: 'Rain Caller',
    stackSize: 1,
    weatherToggle: 'rain',
  },
  [ItemTypes.ACID_RAIN_CALLER]: {
    name: 'Acid Rain Caller',
    stackSize: 1,
    weatherToggle: 'acid',
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

import { ItemTypes } from '../data/items.js';

const SMELT_RECIPES = [
  { input: ItemTypes.RAW_IRON, output: ItemTypes.IRON_INGOT, count: 1 },
];

const SMELT_TIME = 3000;

export function getSmeltRecipe(inputType) {
  return SMELT_RECIPES.find((r) => r.input === inputType) || null;
}

export default class FurnaceManager {
  constructor() {
    this.furnaces = new Map();
  }

  key(x, y) {
    return `${x},${y}`;
  }

  getFurnace(x, y) {
    const k = this.key(x, y);
    if (!this.furnaces.has(k)) {
      this.furnaces.set(k, {
        inputSlot: null,
        fuelSlot: null,
        outputSlot: null,
        progress: 0,
        burning: false,
      });
    }
    return this.furnaces.get(k);
  }

  removeFurnace(x, y) {
    this.furnaces.delete(this.key(x, y));
  }

  update(delta) {
    for (const furnace of this.furnaces.values()) {
      this.tickFurnace(furnace, delta);
    }
  }

  tickFurnace(f, delta) {
    if (!f.inputSlot || !f.fuelSlot) {
      f.burning = false;
      f.progress = 0;
      return;
    }

    const recipe = getSmeltRecipe(f.inputSlot.type);
    if (!recipe) {
      f.burning = false;
      f.progress = 0;
      return;
    }

    if (f.fuelSlot.type !== ItemTypes.COAL) {
      f.burning = false;
      f.progress = 0;
      return;
    }

    if (f.outputSlot && (f.outputSlot.type !== recipe.output || f.outputSlot.count >= 99)) {
      f.burning = false;
      f.progress = 0;
      return;
    }

    f.burning = true;
    f.progress += delta;

    if (f.progress >= SMELT_TIME) {
      f.progress = 0;

      f.inputSlot.count -= 1;
      if (f.inputSlot.count <= 0) f.inputSlot = null;

      f.fuelSlot.count -= 1;
      if (f.fuelSlot.count <= 0) f.fuelSlot = null;

      if (f.outputSlot && f.outputSlot.type === recipe.output) {
        f.outputSlot.count += recipe.count;
      } else {
        f.outputSlot = { type: recipe.output, count: recipe.count };
      }
    }
  }
}

export { SMELT_TIME };

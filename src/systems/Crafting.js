import { Recipes, INTERCHANGEABLE, getBaseType } from '../data/recipes.js';

export default class Crafting {
  static getAvailable(inventory, hasWorkbench) {
    return Recipes.filter((r) => {
      if (r.workbench && !hasWorkbench) return false;
      return Crafting.canCraft(r, inventory);
    });
  }

  static _countWithEquivalents(inventory, type) {
    let total = inventory.countItem(type);
    for (const [altType, baseType] of Object.entries(INTERCHANGEABLE)) {
      const alt = Number(altType);
      if (baseType === type && alt !== type) {
        total += inventory.countItem(alt);
      }
      if (alt === type && baseType !== type) {
        total += inventory.countItem(baseType);
      }
    }
    return total;
  }

  static _removeWithEquivalents(inventory, type, count) {
    let remaining = count;
    remaining -= (inventory.countItem(type) - (inventory.removeItem(type, remaining) ? 0 : 0));
    inventory.removeItem(type, Math.min(count, inventory.countItem(type)));

    if (remaining > 0) {
      for (const [altType, baseType] of Object.entries(INTERCHANGEABLE)) {
        if (remaining <= 0) break;
        const alt = Number(altType);
        if (baseType === type && alt !== type) {
          const have = inventory.countItem(alt);
          const take = Math.min(have, remaining);
          if (take > 0) { inventory.removeItem(alt, take); remaining -= take; }
        }
        if (alt === type && baseType !== type) {
          const have = inventory.countItem(baseType);
          const take = Math.min(have, remaining);
          if (take > 0) { inventory.removeItem(baseType, take); remaining -= take; }
        }
      }
    }
  }

  static canCraft(recipe, inventory) {
    for (const ing of recipe.ingredients) {
      if (Crafting._countWithEquivalents(inventory, ing.type) < ing.count) return false;
    }
    return true;
  }

  static craft(recipe, inventory) {
    if (!Crafting.canCraft(recipe, inventory)) return false;

    for (const ing of recipe.ingredients) {
      let remaining = ing.count;
      const have = inventory.countItem(ing.type);
      const take = Math.min(have, remaining);
      if (take > 0) { inventory.removeItem(ing.type, take); remaining -= take; }

      if (remaining > 0) {
        for (const [altType, baseType] of Object.entries(INTERCHANGEABLE)) {
          if (remaining <= 0) break;
          const alt = Number(altType);
          if (baseType === ing.type && alt !== ing.type) {
            const altHave = inventory.countItem(alt);
            const altTake = Math.min(altHave, remaining);
            if (altTake > 0) { inventory.removeItem(alt, altTake); remaining -= altTake; }
          }
          if (alt === ing.type && baseType !== ing.type) {
            const altHave = inventory.countItem(baseType);
            const altTake = Math.min(altHave, remaining);
            if (altTake > 0) { inventory.removeItem(baseType, altTake); remaining -= altTake; }
          }
        }
      }
    }

    inventory.addItem(recipe.result.type, recipe.result.count);
    return true;
  }
}

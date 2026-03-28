import { Recipes } from '../data/recipes.js';

export default class Crafting {
  static getAvailable(inventory, hasWorkbench) {
    return Recipes.filter((r) => {
      if (r.workbench && !hasWorkbench) return false;
      return Crafting.canCraft(r, inventory);
    });
  }

  static canCraft(recipe, inventory) {
    for (const ing of recipe.ingredients) {
      if (inventory.countItem(ing.type) < ing.count) return false;
    }
    return true;
  }

  static craft(recipe, inventory) {
    if (!Crafting.canCraft(recipe, inventory)) return false;

    for (const ing of recipe.ingredients) {
      inventory.removeItem(ing.type, ing.count);
    }

    inventory.addItem(recipe.result.type, recipe.result.count);
    return true;
  }
}

import { getMaxStack, isBlock } from '../data/items.js';

export default class Inventory {
  constructor() {
    this.hotbar = new Array(9).fill(null);
    this.slots = new Array(27).fill(null);
    this.selectedSlot = 0;
    this.MAX_STACK = 99;
    this.dirty = true;
    this.isOpen = false;
    this.craftingRequest = null;
    this.chestRequest = null;
  }

  addItem(type, count = 1) {
    const maxStack = getMaxStack(type);
    let remaining = count;

    remaining = this._stackInto(this.hotbar, type, remaining, maxStack);
    if (remaining <= 0) { this.dirty = true; return true; }

    remaining = this._stackInto(this.slots, type, remaining, maxStack);
    if (remaining <= 0) { this.dirty = true; return true; }

    remaining = this._addToEmpty(this.hotbar, type, remaining, maxStack);
    if (remaining <= 0) { this.dirty = true; return true; }

    remaining = this._addToEmpty(this.slots, type, remaining, maxStack);
    this.dirty = true;
    return remaining <= 0;
  }

  _stackInto(arr, type, count, maxStack) {
    for (let i = 0; i < arr.length && count > 0; i++) {
      if (arr[i] && arr[i].type === type && arr[i].count < maxStack) {
        const toAdd = Math.min(count, maxStack - arr[i].count);
        arr[i].count += toAdd;
        count -= toAdd;
      }
    }
    return count;
  }

  _addToEmpty(arr, type, count, maxStack) {
    for (let i = 0; i < arr.length && count > 0; i++) {
      if (!arr[i]) {
        const toAdd = Math.min(count, maxStack);
        arr[i] = { type, count: toAdd };
        count -= toAdd;
      }
    }
    return count;
  }

  countItem(type) {
    let total = 0;
    for (const slot of this.hotbar) {
      if (slot && slot.type === type) total += slot.count;
    }
    for (const slot of this.slots) {
      if (slot && slot.type === type) total += slot.count;
    }
    return total;
  }

  removeItem(type, count) {
    let remaining = count;
    remaining = this._removeFrom(this.slots, type, remaining);
    if (remaining > 0) remaining = this._removeFrom(this.hotbar, type, remaining);
    this.dirty = true;
    return remaining <= 0;
  }

  _removeFrom(arr, type, count) {
    for (let i = 0; i < arr.length && count > 0; i++) {
      if (arr[i] && arr[i].type === type) {
        const toRemove = Math.min(count, arr[i].count);
        arr[i].count -= toRemove;
        count -= toRemove;
        if (arr[i].count <= 0) arr[i] = null;
      }
    }
    return count;
  }

  getSelectedItem() {
    return this.hotbar[this.selectedSlot];
  }

  consumeSelected(count = 1) {
    const item = this.hotbar[this.selectedSlot];
    if (!item || item.count < count) return false;
    item.count -= count;
    if (item.count <= 0) this.hotbar[this.selectedSlot] = null;
    this.dirty = true;
    return true;
  }

  isBlock(type) {
    return isBlock(type);
  }
}

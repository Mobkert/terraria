export default class Inventory {
  constructor() {
    this.hotbar = new Array(9).fill(null);
    this.slots = new Array(27).fill(null);
    this.selectedSlot = 0;
    this.MAX_STACK = 99;
    this.dirty = true;
  }

  addItem(type, count = 1) {
    let remaining = count;
    remaining = this._stackInto(this.hotbar, type, remaining);
    if (remaining <= 0) { this.dirty = true; return true; }

    remaining = this._stackInto(this.slots, type, remaining);
    if (remaining <= 0) { this.dirty = true; return true; }

    remaining = this._addToEmpty(this.hotbar, type, remaining);
    if (remaining <= 0) { this.dirty = true; return true; }

    remaining = this._addToEmpty(this.slots, type, remaining);
    this.dirty = true;
    return remaining <= 0;
  }

  _stackInto(arr, type, count) {
    for (let i = 0; i < arr.length && count > 0; i++) {
      if (arr[i] && arr[i].type === type && arr[i].count < this.MAX_STACK) {
        const toAdd = Math.min(count, this.MAX_STACK - arr[i].count);
        arr[i].count += toAdd;
        count -= toAdd;
      }
    }
    return count;
  }

  _addToEmpty(arr, type, count) {
    for (let i = 0; i < arr.length && count > 0; i++) {
      if (!arr[i]) {
        const toAdd = Math.min(count, this.MAX_STACK);
        arr[i] = { type, count: toAdd };
        count -= toAdd;
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
    return type >= 1 && type <= 12;
  }
}

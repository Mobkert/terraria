import HotbarUI from '../ui/HotbarUI.js';
import InventoryUI from '../ui/InventoryUI.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  init(data) {
    this.inventory = data.inventory;
  }

  create() {
    this.hotbarUI = new HotbarUI(this, this.inventory);
    this.inventoryUI = new InventoryUI(this, this.inventory);

    this.input.keyboard.on('keydown-E', () => {
      this.inventoryUI.toggle();
      if (this.inventoryUI.isOpen) {
        this.hotbarUI.setVisible(false);
      } else {
        this.hotbarUI.setVisible(true);
      }
    });

    const keyNames = [
      'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE',
      'SIX', 'SEVEN', 'EIGHT', 'NINE',
    ];
    for (let i = 0; i < 9; i++) {
      this.input.keyboard.on(`keydown-${keyNames[i]}`, () => {
        this.inventory.selectedSlot = i;
        this.inventory.dirty = true;
      });
    }

    this.input.on('wheel', (_pointer, _gos, _dx, deltaY) => {
      if (this.inventoryUI.isOpen) return;
      if (deltaY > 0) {
        this.inventory.selectedSlot = (this.inventory.selectedSlot + 1) % 9;
      } else if (deltaY < 0) {
        this.inventory.selectedSlot = (this.inventory.selectedSlot + 8) % 9;
      }
      this.inventory.dirty = true;
    });
  }

  update() {
    this.hotbarUI.update();
    this.inventoryUI.update();
    this.inventory.dirty = false;
  }
}

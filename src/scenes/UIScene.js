import HotbarUI from '../ui/HotbarUI.js';
import InventoryUI from '../ui/InventoryUI.js';
import CraftingUI from '../ui/CraftingUI.js';

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
    this.craftingUI = new CraftingUI(this, this.inventory);

    this.input.keyboard.on('keydown-E', () => {
      if (this.inventoryUI.isOpen) {
        this.closeInventory();
      } else {
        this.openInventory(false);
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

  openInventory(hasWorkbench) {
    this.inventoryUI.toggle();
    this.hotbarUI.setVisible(false);
    this.craftingUI.show(hasWorkbench);
  }

  closeInventory() {
    this.inventoryUI.toggle();
    this.hotbarUI.setVisible(true);
    this.craftingUI.hide();
  }

  update() {
    if (this.inventory.craftingRequest) {
      const mode = this.inventory.craftingRequest;
      this.inventory.craftingRequest = null;
      if (!this.inventoryUI.isOpen) {
        this.openInventory(mode === 'workbench');
      }
    }

    this.hotbarUI.update();
    this.inventoryUI.update();
    this.craftingUI.update();
    this.inventory.dirty = false;
  }
}

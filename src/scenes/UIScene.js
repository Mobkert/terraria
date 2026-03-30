import HotbarUI from '../ui/HotbarUI.js';
import InventoryUI from '../ui/InventoryUI.js';
import CraftingUI from '../ui/CraftingUI.js';
import ChestUI from '../ui/ChestUI.js';
import FurnaceUI from '../ui/FurnaceUI.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  init(data) {
    this.inventory = data.inventory;
    this.chestManager = data.chestManager;
    this.furnaceManager = data.furnaceManager;
    this.player = data.player;
  }

  create() {
    this.hotbarUI = new HotbarUI(this, this.inventory, this.player);
    this.inventoryUI = new InventoryUI(this, this.inventory);
    this.craftingUI = new CraftingUI(this, this.inventory);
    this.chestUI = new ChestUI(this, this.inventory, this.inventoryUI);
    this.furnaceUI = new FurnaceUI(this, this.inventory, this.inventoryUI);

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

  openChest(x, y) {
    const chestSlots = this.chestManager.getChest(x, y);
    if (!this.inventoryUI.isOpen) {
      this.inventoryUI.toggle();
    }
    this.hotbarUI.setVisible(false);
    this.craftingUI.hide();
    this.furnaceUI.hide();
    this.chestUI.show(chestSlots);
  }

  openFurnace(x, y) {
    const furnace = this.furnaceManager.getFurnace(x, y);
    if (!this.inventoryUI.isOpen) {
      this.inventoryUI.toggle();
    }
    this.hotbarUI.setVisible(false);
    this.craftingUI.hide();
    this.chestUI.hide();
    this.furnaceUI.show(furnace);
  }

  closeInventory() {
    this.inventoryUI.toggle();
    this.hotbarUI.setVisible(true);
    this.craftingUI.hide();
    this.chestUI.hide();
    this.furnaceUI.hide();
  }

  update() {
    if (this.inventory.craftingRequest) {
      const mode = this.inventory.craftingRequest;
      this.inventory.craftingRequest = null;
      if (!this.inventoryUI.isOpen) {
        this.openInventory(mode === 'workbench');
      }
    }

    if (this.inventory.chestRequest) {
      const { x, y } = this.inventory.chestRequest;
      this.inventory.chestRequest = null;
      if (!this.inventoryUI.isOpen) {
        this.openChest(x, y);
      }
    }

    if (this.inventory.furnaceRequest) {
      const { x, y } = this.inventory.furnaceRequest;
      this.inventory.furnaceRequest = null;
      if (!this.inventoryUI.isOpen) {
        this.openFurnace(x, y);
      }
    }

    this.hotbarUI.update();
    this.inventoryUI.update();
    this.craftingUI.update();
    this.chestUI.update();
    this.furnaceUI.update();
    this.inventory.dirty = false;
  }
}

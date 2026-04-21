import HotbarUI from '../ui/HotbarUI.js';
import InventoryUI from '../ui/InventoryUI.js';
import CraftingUI from '../ui/CraftingUI.js';
import ChestUI from '../ui/ChestUI.js';
import FurnaceUI from '../ui/FurnaceUI.js';
import AdvancementUI from '../ui/AdvancementUI.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  init(data) {
    this.inventory = data.inventory;
    this.chestManager = data.chestManager;
    this.furnaceManager = data.furnaceManager;
    this.player = data.player;
    this.advancementTracker = data.advancementTracker;
  }

  create() {
    this.hotbarUI = new HotbarUI(this, this.inventory, this.player);
    this.inventoryUI = new InventoryUI(this, this.inventory);
    this.craftingUI = new CraftingUI(this, this.inventory);
    this.chestUI = new ChestUI(this, this.inventory, this.inventoryUI);
    this.furnaceUI = new FurnaceUI(this, this.inventory, this.inventoryUI);
    this.advancementUI = new AdvancementUI(this, this.advancementTracker);

    this.input.keyboard.on('keydown-P', () => {
      if (this.inventoryUI.isOpen) return;
      this.advancementUI.toggle();
    });

    this.input.keyboard.on('keydown-E', () => {
      if (this.advancementUI.isOpen) {
        this.advancementUI.toggle();
        return;
      }
      if (this.inventoryUI.isOpen) {
        this.closeInventory();
      } else {
        this.openInventory(false);
      }
    });

    this.input.keyboard.on('keydown-B', () => {
      if (this.inventoryUI.isOpen || this.advancementUI.isOpen) return;
      this.inventory.bgMode = !this.inventory.bgMode;
      this.inventory.dirty = true;
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

    this.toastQueue = [];
    this.activeToast = null;
  }

  showAdvancementToast(adv) {
    const sw = this.cameras.main.width;
    const toastW = 260;
    const toastH = 52;
    const startX = sw + toastW;
    const endX = sw - toastW - 12;
    const toastY = 12;

    const container = this.add.container(startX, toastY);
    container.setDepth(500);

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRoundedRect(0, 0, toastW, toastH, 8);
    bg.lineStyle(2, 0x44aa44, 1);
    bg.strokeRoundedRect(0, 0, toastW, toastH, 8);
    container.add(bg);

    if (this.textures.exists(adv.icon)) {
      const icon = this.add.image(14, toastH / 2, adv.icon);
      icon.setDisplaySize(28, 28);
      container.add(icon);
    }

    const header = this.add.text(34, 6, 'Advancement Complete!', {
      fontSize: '11px', color: '#ffdd44', fontStyle: 'bold',
    });
    container.add(header);

    const name = this.add.text(34, 24, adv.name, {
      fontSize: '14px', color: '#88ff88', fontStyle: 'bold',
    });
    container.add(name);

    this.tweens.add({
      targets: container,
      x: endX,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(3000, () => {
          this.tweens.add({
            targets: container,
            x: startX,
            duration: 300,
            ease: 'Cubic.easeIn',
            onComplete: () => {
              container.destroy();
              this.activeToast = null;
              this.processToastQueue();
            },
          });
        });
      },
    });

    this.activeToast = container;
  }

  processToastQueue() {
    if (this.activeToast || this.toastQueue.length === 0) return;
    const adv = this.toastQueue.shift();
    this.showAdvancementToast(adv);
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

    while (this.advancementTracker.pendingToasts.length > 0) {
      const adv = this.advancementTracker.pendingToasts.shift();
      this.toastQueue.push(adv);
    }
    this.processToastQueue();

    this.hotbarUI.update();
    this.inventoryUI.update();
    this.craftingUI.update();
    this.chestUI.update();
    this.furnaceUI.update();
    this.advancementUI.update();
    this.inventory.dirty = false;
  }
}

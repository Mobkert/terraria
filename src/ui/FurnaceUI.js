import { getItemTexture, getMaxStack } from '../data/items.js';
import { SMELT_TIME, getSmeltRecipe } from '../systems/FurnaceManager.js';

const SLOT = 44;
const ICON = 30;

export default class FurnaceUI {
  constructor(scene, inventory, inventoryUI) {
    this.scene = scene;
    this.inventory = inventory;
    this.inventoryUI = inventoryUI;
    this.furnace = null;
    this.isOpen = false;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(310);
    this.container.setVisible(false);

    this.slotObjects = {};
    this.build();
  }

  build() {
    const sw = this.scene.cameras.main.width;
    const sh = this.scene.cameras.main.height;

    const panelW = 220;
    const panelH = 140;

    const invPanelH = 3 * SLOT + 2 * 4 + SLOT + 12 + 16 * 2 + 16;
    const panelX = (sw - panelW) / 2;
    const panelY = (sh - invPanelH) / 2 - panelH - 8;

    const panel = this.scene.add.graphics();
    panel.fillStyle(0x2e1a0e, 0.92);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 8);
    panel.lineStyle(2, 0x6b4226, 1);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 8);
    this.container.add(panel);

    const title = this.scene.add.text(sw / 2, panelY + 6, 'Furnace', {
      fontSize: '13px',
      color: '#ccaa77',
    });
    title.setOrigin(0.5, 0);
    this.container.add(title);

    const baseY = panelY + 28;

    this.slotObjects.input = this.createSlot(panelX + 30, baseY, 'input');
    this.slotObjects.fuel = this.createSlot(panelX + 30, baseY + SLOT + 10, 'fuel');
    this.slotObjects.output = this.createSlot(panelX + 145, baseY + SLOT / 2 + 5, 'output');

    this.arrowGfx = this.scene.add.graphics();
    this.container.add(this.arrowGfx);
    this.arrowX = panelX + 88;
    this.arrowY = baseY + SLOT / 2 + 5;

    this.flameGfx = this.scene.add.graphics();
    this.container.add(this.flameGfx);
    this.flameX = panelX + 30 + SLOT / 2;
    this.flameY = baseY + SLOT + 4;
  }

  createSlot(x, y, name) {
    const bg = this.scene.add.rectangle(
      x + SLOT / 2, y + SLOT / 2, SLOT, SLOT, 0x3a2a1a, 1,
    );
    bg.setStrokeStyle(1, 0x6b5533);
    bg.setInteractive();
    this.container.add(bg);

    const icon = this.scene.add.image(x + SLOT / 2, y + SLOT / 2, 'player');
    icon.setDisplaySize(ICON, ICON);
    icon.setVisible(false);
    this.container.add(icon);

    const count = this.scene.add.text(x + SLOT - 4, y + SLOT - 4, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    count.setOrigin(1, 1);
    this.container.add(count);

    bg.on('pointerdown', (pointer) => {
      if (!this.furnace) return;
      if (pointer.leftButtonDown()) {
        if (pointer.event.shiftKey) {
          this.shiftClick(name);
        } else {
          this.leftClick(name);
        }
      } else if (pointer.rightButtonDown()) {
        this.rightClick(name);
      }
      this.inventory.dirty = true;
    });

    bg.on('pointerover', () => bg.setStrokeStyle(1, 0xccaa77));
    bg.on('pointerout', () => bg.setStrokeStyle(1, 0x6b5533));

    return { bg, icon, count };
  }

  getSlot(name) {
    return this.furnace[name + 'Slot'];
  }

  setSlot(name, val) {
    this.furnace[name + 'Slot'] = val;
  }

  leftClick(name) {
    const slot = this.getSlot(name);
    const cursor = this.inventoryUI.cursorItem;

    if (name === 'output') {
      if (!cursor && slot) {
        this.inventoryUI.cursorItem = { ...slot };
        this.setSlot(name, null);
      } else if (cursor && slot && cursor.type === slot.type) {
        const max = getMaxStack(slot.type);
        const space = max - cursor.count;
        const toAdd = Math.min(slot.count, space);
        cursor.count += toAdd;
        slot.count -= toAdd;
        if (slot.count <= 0) this.setSlot(name, null);
      }
      return;
    }

    if (!cursor) {
      if (slot) {
        this.inventoryUI.cursorItem = { ...slot };
        this.setSlot(name, null);
      }
    } else {
      if (!slot) {
        this.setSlot(name, { ...cursor });
        this.inventoryUI.cursorItem = null;
      } else if (slot.type === cursor.type) {
        const max = getMaxStack(slot.type);
        const space = max - slot.count;
        const toAdd = Math.min(cursor.count, space);
        slot.count += toAdd;
        cursor.count -= toAdd;
        if (cursor.count <= 0) this.inventoryUI.cursorItem = null;
      } else {
        const temp = { ...slot };
        this.setSlot(name, { ...cursor });
        this.inventoryUI.cursorItem = temp;
      }
    }
  }

  rightClick(name) {
    const slot = this.getSlot(name);
    const cursor = this.inventoryUI.cursorItem;

    if (name === 'output') {
      this.leftClick(name);
      return;
    }

    if (!cursor) {
      if (slot && slot.count > 1) {
        const half = Math.ceil(slot.count / 2);
        this.inventoryUI.cursorItem = { type: slot.type, count: half };
        slot.count -= half;
      } else if (slot) {
        this.inventoryUI.cursorItem = { ...slot };
        this.setSlot(name, null);
      }
    } else {
      if (!slot) {
        this.setSlot(name, { type: cursor.type, count: 1 });
        cursor.count -= 1;
        if (cursor.count <= 0) this.inventoryUI.cursorItem = null;
      } else if (slot.type === cursor.type) {
        const max = getMaxStack(slot.type);
        if (slot.count < max) {
          slot.count += 1;
          cursor.count -= 1;
          if (cursor.count <= 0) this.inventoryUI.cursorItem = null;
        }
      }
    }
  }

  shiftClick(name) {
    const slot = this.getSlot(name);
    if (!slot) return;
    const added = this.inventory.addItem(slot.type, slot.count);
    if (added) this.setSlot(name, null);
  }

  show(furnace) {
    this.furnace = furnace;
    this.isOpen = true;
    this.container.setVisible(true);
    this.inventory.dirty = true;
  }

  hide() {
    this.isOpen = false;
    this.furnace = null;
    this.container.setVisible(false);
    this.arrowGfx.clear();
    this.flameGfx.clear();
  }

  update() {
    if (!this.isOpen || !this.furnace) return;

    this.refreshSlots();
    this.drawArrow();
    this.drawFlame();
  }

  refreshSlots() {
    for (const name of ['input', 'fuel', 'output']) {
      const obj = this.slotObjects[name];
      const item = this.getSlot(name);
      if (item) {
        obj.icon.setTexture(getItemTexture(item.type));
        obj.icon.setVisible(true);
        obj.count.setText(item.count > 1 ? String(item.count) : '');
      } else {
        obj.icon.setVisible(false);
        obj.count.setText('');
      }
    }
  }

  drawArrow() {
    const g = this.arrowGfx;
    g.clear();

    const x = this.arrowX;
    const y = this.arrowY;

    g.fillStyle(0x555555, 1);
    g.fillRect(x, y + 10, 40, 10);
    g.fillTriangle(x + 40, y + 5, x + 40, y + 25, x + 52, y + 15);

    if (this.furnace.burning) {
      const ratio = this.furnace.progress / SMELT_TIME;
      g.fillStyle(0x44cc44, 1);
      g.fillRect(x, y + 10, 40 * ratio, 10);
    }
  }

  drawFlame() {
    const g = this.flameGfx;
    g.clear();

    if (!this.furnace.burning) return;

    const x = this.flameX;
    const y = this.flameY;

    g.fillStyle(0xff6600, 0.8);
    g.fillTriangle(x - 4, y + 6, x + 4, y + 6, x, y - 4);
    g.fillStyle(0xffaa00, 0.9);
    g.fillTriangle(x - 2, y + 5, x + 2, y + 5, x, y - 1);
  }
}

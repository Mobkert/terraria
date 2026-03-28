import { getItemTexture, getMaxStack } from '../data/items.js';

const SLOT = 44;
const GAP = 4;
const ICON = 30;
const COLS = 9;

export default class ChestUI {
  constructor(scene, inventory, inventoryUI) {
    this.scene = scene;
    this.inventory = inventory;
    this.inventoryUI = inventoryUI;
    this.chestSlots = null;
    this.isOpen = false;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(310);
    this.container.setVisible(false);

    this.slotObjects = [];
    this.build();
  }

  build() {
    const sw = this.scene.cameras.main.width;
    const sh = this.scene.cameras.main.height;

    const gridW = COLS * SLOT + (COLS - 1) * GAP;
    const panelPad = 16;
    const panelW = gridW + panelPad * 2;
    const panelH = SLOT + panelPad * 2 + 20;

    const invPanelH = 3 * SLOT + 2 * GAP + SLOT + 12 + panelPad * 2 + 16;
    const panelX = (sw - panelW) / 2;
    const panelY = (sh - invPanelH) / 2 - panelH - 8;

    const panel = this.scene.add.graphics();
    panel.fillStyle(0x2e1a0e, 0.92);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 8);
    panel.lineStyle(2, 0x6b4226, 1);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 8);
    this.container.add(panel);

    const title = this.scene.add.text(sw / 2, panelY + 6, 'Chest', {
      fontSize: '13px',
      color: '#ccaa77',
    });
    title.setOrigin(0.5, 0);
    this.container.add(title);

    const gridX = panelX + panelPad;
    const gridY = panelY + panelPad + 16;

    for (let col = 0; col < COLS; col++) {
      const x = gridX + col * (SLOT + GAP);
      this.createSlot(x, gridY, col);
    }
  }

  createSlot(x, y, idx) {
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
      if (!this.chestSlots) return;
      if (pointer.leftButtonDown()) {
        if (pointer.event.shiftKey) {
          this.shiftClick(idx);
        } else {
          this.leftClick(idx);
        }
      } else if (pointer.rightButtonDown()) {
        this.rightClick(idx);
      }
      this.inventory.dirty = true;
    });

    bg.on('pointerover', () => bg.setStrokeStyle(1, 0xccaa77));
    bg.on('pointerout', () => bg.setStrokeStyle(1, 0x6b5533));

    this.slotObjects.push({ bg, icon, count, idx });
  }

  leftClick(idx) {
    const slot = this.chestSlots[idx];
    const cursor = this.inventoryUI.cursorItem;

    if (!cursor) {
      if (slot) {
        this.inventoryUI.cursorItem = { ...slot };
        this.chestSlots[idx] = null;
      }
    } else {
      if (!slot) {
        this.chestSlots[idx] = { ...cursor };
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
        this.chestSlots[idx] = { ...cursor };
        this.inventoryUI.cursorItem = temp;
      }
    }
  }

  rightClick(idx) {
    const slot = this.chestSlots[idx];
    const cursor = this.inventoryUI.cursorItem;

    if (!cursor) {
      if (slot && slot.count > 1) {
        const half = Math.ceil(slot.count / 2);
        this.inventoryUI.cursorItem = { type: slot.type, count: half };
        slot.count -= half;
      } else if (slot) {
        this.inventoryUI.cursorItem = { ...slot };
        this.chestSlots[idx] = null;
      }
    } else {
      if (!slot) {
        this.chestSlots[idx] = { type: cursor.type, count: 1 };
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

  shiftClick(idx) {
    const slot = this.chestSlots[idx];
    if (!slot) return;

    const added = this.inventory.addItem(slot.type, slot.count);
    if (added) {
      this.chestSlots[idx] = null;
    }
  }

  show(chestSlots) {
    this.chestSlots = chestSlots;
    this.isOpen = true;
    this.container.setVisible(true);
    this.inventory.dirty = true;
  }

  hide() {
    this.isOpen = false;
    this.chestSlots = null;
    this.container.setVisible(false);
  }

  update() {
    if (!this.isOpen || !this.chestSlots) return;

    if (this.inventory.dirty) {
      this.refreshSlots();
    }
  }

  refreshSlots() {
    for (const s of this.slotObjects) {
      const item = this.chestSlots[s.idx];
      if (item) {
        s.icon.setTexture(getItemTexture(item.type));
        s.icon.setVisible(true);
        s.count.setText(item.count > 1 ? String(item.count) : '');
      } else {
        s.icon.setVisible(false);
        s.count.setText('');
      }
    }
  }
}

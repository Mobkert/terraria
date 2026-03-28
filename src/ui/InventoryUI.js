import { BlockData, TILE_SIZE } from '../data/blocks.js';

const SLOT = 44;
const GAP = 4;
const ICON = 30;
const COLS = 9;
const INV_ROWS = 3;

export default class InventoryUI {
  constructor(scene, inventory) {
    this.scene = scene;
    this.inventory = inventory;
    this.isOpen = false;
    this.cursorItem = null;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(300);
    this.container.setVisible(false);

    this.slotObjects = [];
    this.build();
    this.createCursorIcon();
  }

  build() {
    const sw = this.scene.cameras.main.width;
    const sh = this.scene.cameras.main.height;

    this.overlay = this.scene.add.rectangle(sw / 2, sh / 2, sw, sh, 0x000000, 0.5);
    this.overlay.setInteractive();
    this.container.add(this.overlay);

    const gridW = COLS * SLOT + (COLS - 1) * GAP;
    const invH = INV_ROWS * SLOT + (INV_ROWS - 1) * GAP;
    const hotbarH = SLOT;
    const sectionGap = 12;
    const totalH = invH + sectionGap + hotbarH;
    const panelPad = 16;

    const panelW = gridW + panelPad * 2;
    const panelH = totalH + panelPad * 2;
    const panelX = (sw - panelW) / 2;
    const panelY = (sh - panelH) / 2;

    const panel = this.scene.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.92);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 8);
    panel.lineStyle(2, 0x444466, 1);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 8);
    this.container.add(panel);

    const title = this.scene.add.text(sw / 2, panelY + 6, 'Inventory', {
      fontSize: '13px',
      color: '#aaaacc',
    });
    title.setOrigin(0.5, 0);
    this.container.add(title);

    const gridX = panelX + panelPad;
    const gridY = panelY + panelPad + 16;

    for (let row = 0; row < INV_ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const idx = row * COLS + col;
        const x = gridX + col * (SLOT + GAP);
        const y = gridY + row * (SLOT + GAP);
        this.createSlot(x, y, 'inv', idx);
      }
    }

    const hotbarY = gridY + invH + sectionGap;
    for (let col = 0; col < COLS; col++) {
      const x = gridX + col * (SLOT + GAP);
      this.createSlot(x, hotbarY, 'hotbar', col);
    }
  }

  createSlot(x, y, section, idx) {
    const bg = this.scene.add.rectangle(
      x + SLOT / 2, y + SLOT / 2, SLOT, SLOT, 0x2a2a3e, 1,
    );
    bg.setStrokeStyle(1, 0x555577);
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
      if (pointer.leftButtonDown()) {
        if (pointer.event.shiftKey) {
          this.shiftClick(section, idx);
        } else {
          this.leftClick(section, idx);
        }
      } else if (pointer.rightButtonDown()) {
        this.rightClick(section, idx);
      }
      this.inventory.dirty = true;
    });

    bg.on('pointerover', () => {
      bg.setStrokeStyle(1, 0xaaaacc);
    });

    bg.on('pointerout', () => {
      const isSel = section === 'hotbar' && idx === this.inventory.selectedSlot;
      bg.setStrokeStyle(1, isSel ? 0xffff00 : 0x555577);
    });

    this.slotObjects.push({ bg, icon, count, section, idx });
  }

  createCursorIcon() {
    this.cursorIcon = this.scene.add.image(0, 0, 'player');
    this.cursorIcon.setDisplaySize(ICON, ICON);
    this.cursorIcon.setDepth(400);
    this.cursorIcon.setVisible(false);

    this.cursorCount = this.scene.add.text(0, 0, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.cursorCount.setOrigin(1, 1);
    this.cursorCount.setDepth(401);
    this.cursorCount.setVisible(false);
  }

  getSlotArray(section) {
    return section === 'hotbar' ? this.inventory.hotbar : this.inventory.slots;
  }

  leftClick(section, idx) {
    const arr = this.getSlotArray(section);
    const slot = arr[idx];

    if (!this.cursorItem) {
      if (slot) {
        this.cursorItem = { ...slot };
        arr[idx] = null;
      }
    } else {
      if (!slot) {
        arr[idx] = { ...this.cursorItem };
        this.cursorItem = null;
      } else if (slot.type === this.cursorItem.type) {
        const space = this.inventory.MAX_STACK - slot.count;
        const toAdd = Math.min(this.cursorItem.count, space);
        slot.count += toAdd;
        this.cursorItem.count -= toAdd;
        if (this.cursorItem.count <= 0) this.cursorItem = null;
      } else {
        const temp = { ...slot };
        arr[idx] = { ...this.cursorItem };
        this.cursorItem = temp;
      }
    }
  }

  rightClick(section, idx) {
    const arr = this.getSlotArray(section);
    const slot = arr[idx];

    if (!this.cursorItem) {
      if (slot && slot.count > 1) {
        const half = Math.ceil(slot.count / 2);
        this.cursorItem = { type: slot.type, count: half };
        slot.count -= half;
      } else if (slot) {
        this.cursorItem = { ...slot };
        arr[idx] = null;
      }
    } else {
      if (!slot) {
        arr[idx] = { type: this.cursorItem.type, count: 1 };
        this.cursorItem.count -= 1;
        if (this.cursorItem.count <= 0) this.cursorItem = null;
      } else if (slot.type === this.cursorItem.type && slot.count < this.inventory.MAX_STACK) {
        slot.count += 1;
        this.cursorItem.count -= 1;
        if (this.cursorItem.count <= 0) this.cursorItem = null;
      }
    }
  }

  shiftClick(section, idx) {
    const srcArr = this.getSlotArray(section);
    const item = srcArr[idx];
    if (!item) return;

    const destArr = section === 'hotbar' ? this.inventory.slots : this.inventory.hotbar;

    let remaining = item.count;

    for (let i = 0; i < destArr.length && remaining > 0; i++) {
      if (destArr[i] && destArr[i].type === item.type && destArr[i].count < this.inventory.MAX_STACK) {
        const toAdd = Math.min(remaining, this.inventory.MAX_STACK - destArr[i].count);
        destArr[i].count += toAdd;
        remaining -= toAdd;
      }
    }

    for (let i = 0; i < destArr.length && remaining > 0; i++) {
      if (!destArr[i]) {
        const toAdd = Math.min(remaining, this.inventory.MAX_STACK);
        destArr[i] = { type: item.type, count: toAdd };
        remaining -= toAdd;
      }
    }

    if (remaining <= 0) {
      srcArr[idx] = null;
    } else {
      srcArr[idx].count = remaining;
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.container.setVisible(this.isOpen);
    this.inventory.isOpen = this.isOpen;

    if (!this.isOpen) {
      if (this.cursorItem) {
        this.inventory.addItem(this.cursorItem.type, this.cursorItem.count);
        this.cursorItem = null;
      }
      this.cursorIcon.setVisible(false);
      this.cursorCount.setVisible(false);
    }

    this.inventory.dirty = true;
  }

  update() {
    if (!this.isOpen) return;

    if (this.inventory.dirty) {
      this.refreshSlots();
    }

    const pointer = this.scene.input.activePointer;

    if (this.cursorItem) {
      this.cursorIcon.setTexture(`block_${this.cursorItem.type}`);
      this.cursorIcon.setPosition(pointer.x + 12, pointer.y + 12);
      this.cursorIcon.setVisible(true);
      this.cursorCount.setPosition(pointer.x + 26, pointer.y + 26);
      this.cursorCount.setText(
        this.cursorItem.count > 1 ? String(this.cursorItem.count) : '',
      );
      this.cursorCount.setVisible(true);
    } else {
      this.cursorIcon.setVisible(false);
      this.cursorCount.setVisible(false);
    }
  }

  refreshSlots() {
    for (const s of this.slotObjects) {
      const arr = this.getSlotArray(s.section);
      const item = arr[s.idx];

      const isSel = s.section === 'hotbar' && s.idx === this.inventory.selectedSlot;
      s.bg.setStrokeStyle(1, isSel ? 0xffff00 : 0x555577);

      if (item) {
        s.icon.setTexture(`block_${item.type}`);
        s.icon.setVisible(true);
        s.count.setText(item.count > 1 ? String(item.count) : '');
      } else {
        s.icon.setVisible(false);
        s.count.setText('');
      }
    }
  }
}

import { BlockData, BlockTypes } from '../data/blocks.js';
import { ItemData, ItemTypes, getItemTexture, getMaxStack } from '../data/items.js';

const SLOT = 44;
const GAP = 4;
const ICON = 30;
const COLS = 9;
const INV_ROWS = 3;
const CREATIVE_COLS = 5;
const CREATIVE_ROWS = 4;
const CREATIVE_PANEL_H = 290;

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
    this.creativeSlots = [];
    this.creativeCategoryButtons = [];
    this.creativeCategory = 'all';
    this.creativeScrollOffset = 0;
    this.creativeItems = [];

    this.creativeCategories = [
      { id: 'all', label: 'All' },
      { id: 'building', label: 'Building' },
      { id: 'natural', label: 'Natural' },
      { id: 'utility', label: 'Utility' },
      { id: 'tools', label: 'Tools' },
      { id: 'combat', label: 'Combat' },
      { id: 'food', label: 'Food' },
      { id: 'materials', label: 'Materials' },
    ];

    this.build();
    this.createCursorIcon();

    this.scrollHandler = (pointer, _gos, _dx, dy) => {
      if (!this.isOpen || !this.inventory.creativeMode || !this.creativeGridBounds) return;
      const px = pointer.x;
      const py = pointer.y;
      const b = this.creativeGridBounds;
      if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
        if (dy > 0) this.scrollCreative(1);
        else if (dy < 0) this.scrollCreative(-1);
      }
    };
    this.scene.input.on('wheel', this.scrollHandler);
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
    const creativePanelH = this.inventory.creativeMode ? CREATIVE_PANEL_H : 0;
    const creativeGap = this.inventory.creativeMode ? 10 : 0;
    const fullH = panelH + creativePanelH + creativeGap;
    const panelX = (sw - panelW) / 2;
    const panelY = (sh - fullH) / 2 + creativePanelH + creativeGap;

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

    if (this.inventory.creativeMode) {
      this.createCreativePanel(panelX, panelY - creativeGap - creativePanelH);
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

  createCreativePanel(x, y) {
    const panelW = 328;
    const panelH = CREATIVE_PANEL_H;
    this.creativePanel = { x, y, w: panelW, h: panelH };

    const panel = this.scene.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.92);
    panel.fillRoundedRect(x, y, panelW, panelH, 8);
    panel.lineStyle(2, 0x444466, 1);
    panel.strokeRoundedRect(x, y, panelW, panelH, 8);
    this.container.add(panel);

    const title = this.scene.add.text(x + panelW / 2, y + 6, 'Creative Inventory', {
      fontSize: '13px',
      color: '#aaaacc',
    });
    title.setOrigin(0.5, 0);
    this.container.add(title);

    this.createCreativeCategoryButtons(x + 8, y + 28, panelW - 16);
    this.createCreativeGrid(x + 10, y + 88);
  }

  createCreativeCategoryButtons(startX, startY, width) {
    const cols = 4;
    const btnGap = 4;
    const btnW = Math.floor((width - btnGap * (cols - 1)) / cols);
    const btnH = 24;

    for (let i = 0; i < this.creativeCategories.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (btnW + btnGap);
      const y = startY + row * (btnH + btnGap);
      const cat = this.creativeCategories[i];

      const bg = this.scene.add.rectangle(x + btnW / 2, y + btnH / 2, btnW, btnH, 0x2a2a3e, 1);
      bg.setStrokeStyle(1, 0x555577);
      bg.setInteractive({ useHandCursor: true });
      this.container.add(bg);

      const text = this.scene.add.text(x + btnW / 2, y + btnH / 2, cat.label, {
        fontSize: '10px',
        color: '#ddddee',
      }).setOrigin(0.5);
      this.container.add(text);

      bg.on('pointerdown', () => {
        this.creativeCategory = cat.id;
        this.creativeScrollOffset = 0;
        this.refreshCreativeCategoryStyles();
        this.refreshCreativeSlots();
      });

      bg.on('pointerover', () => bg.setStrokeStyle(1, 0xaaaacc));
      bg.on('pointerout', () => this.refreshCreativeCategoryStyles());

      this.creativeCategoryButtons.push({ bg, text, id: cat.id });
    }
  }

  createCreativeGrid(startX, startY) {
    for (let row = 0; row < CREATIVE_ROWS; row++) {
      for (let col = 0; col < CREATIVE_COLS; col++) {
        const x = startX + col * (SLOT + GAP);
        const y = startY + row * (SLOT + GAP);

        const bg = this.scene.add.rectangle(x + SLOT / 2, y + SLOT / 2, SLOT, SLOT, 0x2a2a3e, 1);
        bg.setStrokeStyle(1, 0x555577);
        bg.setInteractive({ useHandCursor: true });
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
        }).setOrigin(1, 1);
        this.container.add(count);

        bg.on('pointerdown', (pointer) => {
          const entry = this.creativeSlots.find((slot) => slot.bg === bg);
          if (!entry || entry.type == null) return;
          const amount = pointer.event.shiftKey ? getMaxStack(entry.type) : 1;
          this.giveCreativeItem(entry.type, amount);
          this.inventory.dirty = true;
        });

        bg.on('pointerover', () => bg.setStrokeStyle(1, 0xaaaacc));
        bg.on('pointerout', () => bg.setStrokeStyle(1, 0x555577));

        this.creativeSlots.push({ bg, icon, count, type: null });
      }
    }

    this.creativeGridBounds = {
      x: startX,
      y: startY,
      w: CREATIVE_COLS * SLOT + (CREATIVE_COLS - 1) * GAP,
      h: CREATIVE_ROWS * SLOT + (CREATIVE_ROWS - 1) * GAP,
    };
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

  getCreativeItems() {
    const blockIds = Object.keys(BlockData).map(Number).filter((t) => t !== BlockTypes.AIR);
    const itemIds = Object.keys(ItemData).map(Number);
    return [...blockIds, ...itemIds];
  }

  getCreativeItemsByCategory() {
    const all = this.getCreativeItems();

    if (this.creativeCategory === 'all') return all;

    if (this.creativeCategory === 'building') {
      const set = new Set([
        BlockTypes.STONE,
        BlockTypes.DEEPSLATE,
        BlockTypes.SANDSTONE,
        BlockTypes.PLANKS,
        BlockTypes.BIRCH_PLANKS,
        BlockTypes.STONE_SLAB,
        BlockTypes.DEEPSLATE_SLAB,
        BlockTypes.OAK_SLAB,
        BlockTypes.BIRCH_SLAB,
        BlockTypes.SANDSTONE_SLAB,
        BlockTypes.WOOL,
      ]);
      return all.filter((t) => set.has(t));
    }

    if (this.creativeCategory === 'natural') {
      const set = new Set([
        BlockTypes.GRASS,
        BlockTypes.DIRT,
        BlockTypes.STONE,
        BlockTypes.DEEPSLATE,
        BlockTypes.SAND,
        BlockTypes.SANDSTONE,
        BlockTypes.WOOD,
        BlockTypes.LEAVES,
        BlockTypes.JUNGLE_GRASS,
        BlockTypes.CACTUS,
        BlockTypes.VINE,
        BlockTypes.BIRCH_WOOD,
        BlockTypes.BIRCH_LEAVES,
        BlockTypes.BIRCH_GRASS,
      ]);
      return all.filter((t) => set.has(t));
    }

    if (this.creativeCategory === 'utility') {
      const set = new Set([
        BlockTypes.WORKBENCH,
        BlockTypes.CHEST,
        BlockTypes.FURNACE,
        BlockTypes.TORCH,
        ItemTypes.TIME_SWITCHER,
      ]);
      return all.filter((t) => set.has(t));
    }

    if (this.creativeCategory === 'tools') {
      return all.filter((t) => {
        const toolType = ItemData[t]?.toolType;
        return toolType === 'pickaxe' || toolType === 'axe';
      });
    }

    if (this.creativeCategory === 'combat') {
      return all.filter((t) => ItemData[t]?.toolType === 'sword' || ItemData[t]?.throwable === true);
    }

    if (this.creativeCategory === 'food') {
      return all.filter((t) => ItemData[t]?.consumable === true);
    }

    if (this.creativeCategory === 'materials') {
      return all.filter((t) => {
        if (BlockData[t]) return false;
        const item = ItemData[t];
        if (!item) return false;
        return !item.toolType && !item.throwable && !item.consumable;
      });
    }

    return all;
  }

  giveCreativeItem(type, amount) {
    if (this.inventory.addItem(type, amount)) return;
    this.inventory.hotbar[this.inventory.selectedSlot] = { type, count: amount };
  }

  scrollCreative(dir) {
    const maxOffset = Math.max(0, this.creativeItems.length - this.creativeSlots.length);
    this.creativeScrollOffset = Math.max(0, Math.min(maxOffset, this.creativeScrollOffset + dir));
    this.refreshCreativeSlots();
  }

  refreshCreativeCategoryStyles() {
    if (!this.inventory.creativeMode) return;
    for (const btn of this.creativeCategoryButtons) {
      const isActive = btn.id === this.creativeCategory;
      btn.bg.setFillStyle(isActive ? 0x3f5f92 : 0x2a2a3e, 1);
      btn.bg.setStrokeStyle(1, isActive ? 0xbcd8ff : 0x555577);
      btn.text.setColor(isActive ? '#ffffff' : '#ddddee');
    }
  }

  refreshCreativeSlots() {
    if (!this.inventory.creativeMode) return;

    this.creativeItems = this.getCreativeItemsByCategory();
    for (let i = 0; i < this.creativeSlots.length; i++) {
      const slot = this.creativeSlots[i];
      const type = this.creativeItems[this.creativeScrollOffset + i];
      slot.type = type ?? null;

      if (type != null) {
        slot.icon.setTexture(getItemTexture(type));
        slot.icon.setDisplaySize(ICON, ICON);
        slot.icon.setVisible(true);
        const stack = getMaxStack(type);
        slot.count.setText(stack > 1 ? String(stack) : '');
      } else {
        slot.icon.setVisible(false);
        slot.count.setText('');
      }
    }
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

    if (this.isOpen && this.inventory.creativeMode) {
      this.refreshCreativeCategoryStyles();
      this.refreshCreativeSlots();
    }

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
      if (this.inventory.creativeMode) this.refreshCreativeSlots();
    }

    const pointer = this.scene.input.activePointer;

    if (this.cursorItem) {
      this.cursorIcon.setTexture(getItemTexture(this.cursorItem.type));
      this.cursorIcon.setDisplaySize(ICON, ICON);
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
        s.icon.setTexture(getItemTexture(item.type));
        s.icon.setDisplaySize(ICON, ICON);
        s.icon.setVisible(true);
        s.count.setText(item.count > 1 ? String(item.count) : '');
      } else {
        s.icon.setVisible(false);
        s.count.setText('');
      }
    }

    if (this.inventory.creativeMode) {
      this.refreshCreativeCategoryStyles();
    }
  }
}

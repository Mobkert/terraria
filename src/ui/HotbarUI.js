import { TILE_SIZE } from '../data/blocks.js';
import { getItemTexture } from '../data/items.js';

const SLOT_SIZE = 44;
const GAP = 4;
const ICON_SIZE = 30;

export default class HotbarUI {
  constructor(scene, inventory, player) {
    this.scene = scene;
    this.inventory = inventory;
    this.player = player;

    this.gfx = scene.add.graphics().setDepth(200);
    this.icons = [];
    this.counts = [];

    const totalW = 9 * SLOT_SIZE + 8 * GAP;
    this.startX = (scene.cameras.main.width - totalW) / 2;
    this.y = scene.cameras.main.height - SLOT_SIZE - 8;

    for (let i = 0; i < 9; i++) {
      const cx = this.startX + i * (SLOT_SIZE + GAP) + SLOT_SIZE / 2;
      const cy = this.y + SLOT_SIZE / 2;

      const icon = scene.add.image(cx, cy, 'player');
      icon.setDisplaySize(ICON_SIZE, ICON_SIZE);
      icon.setDepth(202);
      icon.setVisible(false);

      const count = scene.add.text(cx + 15, cy + 15, '', {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      });
      count.setOrigin(1, 1);
      count.setDepth(203);

      this.icons.push(icon);
      this.counts.push(count);
    }

    this.healthGfx = scene.add.graphics().setDepth(200);
    this.healthText = scene.add.text(0, 0, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.healthText.setDepth(201);
    this.healthText.setOrigin(0.5, 0.5);

    this.lastHealth = -1;
    this.lastDirty = true;
  }

  update() {
    const healthChanged = this.player && this.player.health !== this.lastHealth;

    if (!this.inventory.dirty && !healthChanged) return;

    const g = this.gfx;
    g.clear();

    for (let i = 0; i < 9; i++) {
      const x = this.startX + i * (SLOT_SIZE + GAP);

      g.fillStyle(0x1a1a1a, 0.9);
      g.fillRect(x, this.y, SLOT_SIZE, SLOT_SIZE);

      if (i === this.inventory.selectedSlot) {
        g.lineStyle(2, 0xffff00, 1);
      } else {
        g.lineStyle(1, 0x555555, 1);
      }
      g.strokeRect(x, this.y, SLOT_SIZE, SLOT_SIZE);

      const item = this.inventory.hotbar[i];
      if (item) {
        this.icons[i].setTexture(getItemTexture(item.type));
        this.icons[i].setVisible(true);
        this.counts[i].setText(item.count > 1 ? String(item.count) : '');
      } else {
        this.icons[i].setVisible(false);
        this.counts[i].setText('');
      }
    }

    if (this.player) {
      this.drawHealthBar();
      this.lastHealth = this.player.health;
    }
  }

  drawHealthBar() {
    const hg = this.healthGfx;
    hg.clear();

    const totalW = 9 * SLOT_SIZE + 8 * GAP;
    const barW = totalW;
    const barH = 12;
    const barX = this.startX;
    const barY = this.y - barH - 6;

    hg.fillStyle(0x1a1a1a, 0.9);
    hg.fillRect(barX, barY, barW, barH);

    const ratio = this.player.health / this.player.maxHealth;
    const fillColor = ratio > 0.5 ? 0x44cc44 : ratio > 0.25 ? 0xcccc22 : 0xcc2222;
    hg.fillStyle(fillColor, 1);
    hg.fillRect(barX + 1, barY + 1, (barW - 2) * ratio, barH - 2);

    hg.lineStyle(1, 0x555555, 1);
    hg.strokeRect(barX, barY, barW, barH);

    this.healthText.setPosition(barX + barW / 2, barY + barH / 2);
    this.healthText.setText(`${this.player.health} / ${this.player.maxHealth}`);
  }

  setVisible(v) {
    this.gfx.setVisible(v);
    this.healthGfx.setVisible(v);
    this.healthText.setVisible(v);
    for (const icon of this.icons) icon.setVisible(v && false);
    for (const count of this.counts) count.setVisible(v);
    if (v) this.inventory.dirty = true;
  }
}

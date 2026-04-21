import { Advancements } from '../systems/AdvancementTracker.js';

const ROW_H = 52;
const ICON_SIZE = 32;

export default class AdvancementUI {
  constructor(scene, tracker) {
    this.scene = scene;
    this.tracker = tracker;
    this.isOpen = false;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(350);
    this.container.setVisible(false);

    this.rows = [];
    this.build();
  }

  build() {
    const sw = this.scene.cameras.main.width;
    const sh = this.scene.cameras.main.height;

    this.panelW = 320;
    this.panelH = 50 + Advancements.length * ROW_H + 16;
    this.panelX = (sw - this.panelW) / 2;
    this.panelY = (sh - this.panelH) / 2;

    this.bg = this.scene.add.graphics();
    this.bg.fillStyle(0x1a1a2e, 0.95);
    this.bg.fillRoundedRect(this.panelX, this.panelY, this.panelW, this.panelH, 10);
    this.bg.lineStyle(2, 0x5555aa, 1);
    this.bg.strokeRoundedRect(this.panelX, this.panelY, this.panelW, this.panelH, 10);
    this.container.add(this.bg);

    this.titleText = this.scene.add.text(
      this.panelX + this.panelW / 2,
      this.panelY + 12,
      'Advancements (0/' + Advancements.length + ')',
      { fontSize: '16px', color: '#ccccff', fontStyle: 'bold' },
    );
    this.titleText.setOrigin(0.5, 0);
    this.container.add(this.titleText);

    const listY = this.panelY + 46;

    for (let i = 0; i < Advancements.length; i++) {
      const adv = Advancements[i];
      const y = listY + i * ROW_H;

      const rowBg = this.scene.add.graphics();
      this.container.add(rowBg);

      let icon = null;
      if (this.scene.textures.exists(adv.icon)) {
        icon = this.scene.add.image(this.panelX + 24, y + ROW_H / 2, adv.icon);
        icon.setDisplaySize(ICON_SIZE, ICON_SIZE);
        this.container.add(icon);
      }

      const nameText = this.scene.add.text(
        this.panelX + 48, y + 6, adv.name,
        { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' },
      );
      this.container.add(nameText);

      const descText = this.scene.add.text(
        this.panelX + 48, y + 24, adv.description,
        { fontSize: '11px', color: '#888899' },
      );
      this.container.add(descText);

      const checkText = this.scene.add.text(
        this.panelX + this.panelW - 16, y + ROW_H / 2, '',
        { fontSize: '18px', color: '#44dd44' },
      );
      checkText.setOrigin(1, 0.5);
      this.container.add(checkText);

      this.rows.push({ rowBg, icon, nameText, descText, checkText, adv });
    }

    this.refreshRows();
  }

  refreshRows() {
    const completedCount = this.tracker.getCompletedCount();
    this.titleText.setText('Advancements (' + completedCount + '/' + Advancements.length + ')');

    for (const row of this.rows) {
      const done = this.tracker.isCompleted(row.adv.id);
      const y = row.nameText.y - 6;

      row.rowBg.clear();
      if (done) {
        row.rowBg.fillStyle(0x225522, 0.4);
      } else {
        row.rowBg.fillStyle(0x222233, 0.4);
      }
      row.rowBg.fillRoundedRect(this.panelX + 8, y, this.panelW - 16, ROW_H - 4, 6);

      row.nameText.setColor(done ? '#88ff88' : '#ffffff');
      row.descText.setColor(done ? '#66aa66' : '#888899');
      row.checkText.setText(done ? 'DONE' : '');

      if (row.icon) {
        row.icon.setAlpha(done ? 1.0 : 0.4);
      }
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.container.setVisible(this.isOpen);
    if (this.isOpen) {
      this.refreshRows();
    }
  }

  update() {
    if (!this.isOpen) return;
    if (this.tracker.dirty) {
      this.refreshRows();
      this.tracker.dirty = false;
    }
  }
}

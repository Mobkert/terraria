import { TILE_SIZE } from '../data/blocks.js';
import { BlobColors, Accessories, Patterns, DefaultCustomization } from '../data/customization.js';
import { generatePlayerCanvases } from '../utils/playerRenderer.js';

export default class CustomizeScene extends Phaser.Scene {
  constructor() {
    super('CustomizeScene');
  }

  init(data) {
    this.customization = data.customization
      ? { ...data.customization }
      : { ...DefaultCustomization };
    this.mods = data && data.mods ? { ...data.mods } : undefined;
  }

  create() {
    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#0a1628');

    this.add.text(width / 2, 24, 'Customize Your Blob', {
      fontSize: '32px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    this.previewImage = this.add.image(width / 2, height * 0.28, 'player');
    this.previewImage.setScale(4);

    this.buildColorPicker(width, height);
    this.buildAccessoryPicker(width, height);
    this.buildPatternPicker(width, height);
    this.buildButtons(width, height);

    this.updatePreview();
  }

  buildColorPicker(sw, sh) {
    const startY = sh * 0.46;
    this.add.text(sw * 0.08, startY, 'Color', {
      fontSize: '16px', color: '#aabbcc', fontStyle: 'bold',
    });

    this.colorSwatches = [];
    const swatchSize = 28;
    const gap = 6;
    const totalW = BlobColors.length * (swatchSize + gap) - gap;
    const startX = sw * 0.08;

    BlobColors.forEach((col, i) => {
      const x = startX + i * (swatchSize + gap);
      const y = startY + 26;

      const gfx = this.add.graphics();
      this.drawSwatch(gfx, x, y, swatchSize, col.mid, col.id === this.customization.color);

      const zone = this.add.zone(x + swatchSize / 2, y + swatchSize / 2, swatchSize, swatchSize)
        .setInteractive({ useHandCursor: true });

      zone.on('pointerdown', () => {
        this.customization.color = col.id;
        this.refreshSwatches();
        this.updatePreview();
      });

      this.colorSwatches.push({ gfx, col, x, y, swatchSize });
    });
  }

  drawSwatch(gfx, x, y, size, color, selected) {
    gfx.clear();
    if (selected) {
      gfx.lineStyle(3, 0xffffff, 1);
      gfx.strokeRect(x - 2, y - 2, size + 4, size + 4);
    }
    gfx.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
    gfx.fillRect(x, y, size, size);
  }

  refreshSwatches() {
    this.colorSwatches.forEach(s => {
      this.drawSwatch(s.gfx, s.x, s.y, s.swatchSize, s.col.mid, s.col.id === this.customization.color);
    });
  }

  buildAccessoryPicker(sw, sh) {
    const startY = sh * 0.56;
    this.add.text(sw * 0.08, startY, 'Accessory', {
      fontSize: '16px', color: '#aabbcc', fontStyle: 'bold',
    });

    const btnW = 130;
    const btnH = 30;
    const gap = 8;
    const startX = sw * 0.08;
    this.accButtons = [];

    Accessories.forEach((acc, i) => {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const x = startX + col * (btnW + gap);
      const y = startY + 26 + row * (btnH + gap);

      const bg = this.add.graphics();
      const text = this.add.text(x + btnW / 2, y + btnH / 2, acc.name, {
        fontSize: '12px', color: '#ffffff',
      }).setOrigin(0.5);

      const zone = this.add.zone(x + btnW / 2, y + btnH / 2, btnW, btnH)
        .setInteractive({ useHandCursor: true });

      zone.on('pointerdown', () => {
        this.customization.accessory = acc.id;
        this.refreshAccButtons();
        this.updatePreview();
      });

      this.accButtons.push({ bg, text, acc, x, y, btnW, btnH });
    });
    this.refreshAccButtons();
  }

  refreshAccButtons() {
    this.accButtons.forEach(b => {
      b.bg.clear();
      const selected = b.acc.id === this.customization.accessory;
      b.bg.fillStyle(selected ? 0x3366aa : 0x222244, 0.9);
      b.bg.fillRoundedRect(b.x, b.y, b.btnW, b.btnH, 5);
      if (selected) {
        b.bg.lineStyle(2, 0x77bbee, 1);
        b.bg.strokeRoundedRect(b.x, b.y, b.btnW, b.btnH, 5);
      }
    });
  }

  buildPatternPicker(sw, sh) {
    const startY = sh * 0.70;
    this.add.text(sw * 0.08, startY, 'Pattern', {
      fontSize: '16px', color: '#aabbcc', fontStyle: 'bold',
    });

    const btnW = 130;
    const btnH = 30;
    const gap = 8;
    const startX = sw * 0.08;
    this.patButtons = [];

    Patterns.forEach((pat, i) => {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const x = startX + col * (btnW + gap);
      const y = startY + 26 + row * (btnH + gap);

      const bg = this.add.graphics();
      const text = this.add.text(x + btnW / 2, y + btnH / 2, pat.name, {
        fontSize: '12px', color: '#ffffff',
      }).setOrigin(0.5);

      const zone = this.add.zone(x + btnW / 2, y + btnH / 2, btnW, btnH)
        .setInteractive({ useHandCursor: true });

      zone.on('pointerdown', () => {
        this.customization.pattern = pat.id;
        this.refreshPatButtons();
        this.updatePreview();
      });

      this.patButtons.push({ bg, text, pat, x, y, btnW, btnH });
    });
    this.refreshPatButtons();
  }

  refreshPatButtons() {
    this.patButtons.forEach(b => {
      b.bg.clear();
      const selected = b.pat.id === this.customization.pattern;
      b.bg.fillStyle(selected ? 0x3366aa : 0x222244, 0.9);
      b.bg.fillRoundedRect(b.x, b.y, b.btnW, b.btnH, 5);
      if (selected) {
        b.bg.lineStyle(2, 0x77bbee, 1);
        b.bg.strokeRoundedRect(b.x, b.y, b.btnW, b.btnH, 5);
      }
    });
  }

  buildButtons(sw, sh) {
    const y = sh * 0.90;

    this.createButton(sw * 0.35, y, 'Back', () => {
      this.scene.start('MenuScene', {
        customization: this.customization,
        mods: this.mods,
      });
    });

    this.createButton(sw * 0.65, y, 'Save & Back', () => {
      this.applyCustomization();
      this.scene.start('MenuScene', {
        customization: this.customization,
        mods: this.mods,
      });
    });
  }

  createButton(x, y, label, callback) {
    const btnW = 180;
    const btnH = 44;

    const bg = this.add.graphics();
    bg.fillStyle(0x3366aa, 0.9);
    bg.fillRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);
    bg.lineStyle(2, 0x5599dd, 1);
    bg.strokeRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);

    const text = this.add.text(x, y, label, {
      fontSize: '18px', fontFamily: 'Arial', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    const hitZone = this.add.zone(x, y, btnW, btnH).setInteractive({ useHandCursor: true });

    hitZone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x4488cc, 1);
      bg.fillRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);
      bg.lineStyle(2, 0x77bbee, 1);
      bg.strokeRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);
      text.setScale(1.05);
    });

    hitZone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x3366aa, 0.9);
      bg.fillRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);
      bg.lineStyle(2, 0x5599dd, 1);
      bg.strokeRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);
      text.setScale(1);
    });

    hitZone.on('pointerdown', callback);
  }

  updatePreview() {
    const { front } = generatePlayerCanvases(this.customization);
    if (this.textures.exists('preview_player')) this.textures.remove('preview_player');
    this.textures.addCanvas('preview_player', front);
    this.previewImage.setTexture('preview_player');
    this.previewImage.setDisplaySize(TILE_SIZE * 4, TILE_SIZE * 8);
  }

  applyCustomization() {
    const { front, side } = generatePlayerCanvases(this.customization);
    if (this.textures.exists('player')) this.textures.remove('player');
    if (this.textures.exists('player_side')) this.textures.remove('player_side');
    this.textures.addCanvas('player', front);
    this.textures.addCanvas('player_side', side);
  }
}

import { BlockTypes, TILE_SIZE } from '../data/blocks.js';
import { DefaultCustomization } from '../data/customization.js';
import { defaultModsState, loadMods, saveMods } from '../data/mods.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  init(data) {
    this.customization = (data && data.customization)
      ? { ...data.customization }
      : { ...DefaultCustomization };
    this.modsState =
      data && data.mods != null
        ? { ...defaultModsState(), ...data.mods }
        : loadMods();
  }

  create() {
    this.renderMainMenu();
  }

  renderMainMenu() {
    const { width, height } = this.cameras.main;

    this.cameras.main.setBackgroundColor('#0a1628');
    this.children.removeAll(true);

    this.drawBackground(width, height);

    this.add.text(width / 2, height * 0.18, 'Terraria Clone', {
      fontSize: '56px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.28, 'A 2D Sandbox Adventure', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#aabbcc',
    }).setOrigin(0.5);

    this.createButton(width / 2, height * 0.42, 'Create World', () => {
      this.showCreateWorldMenu();
    });

    this.createButton(width / 2, height * 0.54, 'Mods', () => {
      this.showModsMenu();
    });

    this.createButton(width / 2, height * 0.66, 'Customize', () => {
      this.scene.start('CustomizeScene', { customization: this.customization, mods: this.modsState });
    });
  }

  showCreateWorldMenu() {
    const { width, height } = this.cameras.main;
    this.children.removeAll(true);
    this.cameras.main.setBackgroundColor('#0a1628');
    this.drawBackground(width, height);

    this.worldSettings = {
      gameMode: 'survival',
      difficulty: 'normal',
      worldType: 'default',
    };

    const panelW = 620;
    const panelH = 420;
    const px = width / 2 - panelW / 2;
    const py = height / 2 - panelH / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x0f1f3a, 0.95);
    panel.fillRoundedRect(px, py, panelW, panelH, 12);
    panel.lineStyle(2, 0x4d7ab3, 1);
    panel.strokeRoundedRect(px, py, panelW, panelH, 12);

    this.add.text(width / 2, py + 36, 'Create World Settings', {
      fontSize: '34px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.createOptionSelector(
      width / 2,
      py + 120,
      'Game Mode',
      ['survival', 'creative'],
      (value) => this.worldSettings.gameMode = value,
      this.formatModeLabel,
    );

    this.createOptionSelector(
      width / 2,
      py + 190,
      'Difficulty',
      ['peaceful', 'easy', 'normal', 'hard'],
      (value) => this.worldSettings.difficulty = value,
      this.formatDifficultyLabel,
    );

    this.createOptionSelector(
      width / 2,
      py + 260,
      'World Type',
      ['default', 'superflat', 'bigger_biomes', 'hilly'],
      (value) => this.worldSettings.worldType = value,
      this.formatWorldTypeLabel,
    );

    this.createSmallButton(width / 2 - 120, py + 350, 'Back', () => {
      this.renderMainMenu();
    });

    this.createSmallButton(width / 2 + 120, py + 350, 'Create', () => {
      const seed = Math.floor(Math.random() * 2147483647);
      this.showLoadingWorld(seed, this.worldSettings);
    });
  }

  showModsMenu() {
    const { width, height } = this.cameras.main;
    this.children.removeAll(true);
    this.cameras.main.setBackgroundColor('#0a1628');
    this.drawBackground(width, height);

    const panelW = 720;
    const panelH = 400;
    const px = width / 2 - panelW / 2;
    const py = height / 2 - panelH / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x0f1f3a, 0.95);
    panel.fillRoundedRect(px, py, panelW, panelH, 12);
    panel.lineStyle(2, 0x4d7ab3, 1);
    panel.strokeRoundedRect(px, py, panelW, panelH, 12);

    this.add.text(width / 2, py + 32, 'Mods', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, py + 72, 'Enabled mods apply to new worlds until you turn them off.', {
      fontSize: '15px',
      fontFamily: 'Arial',
      color: '#9aaec4',
    }).setOrigin(0.5);

    const rows = [
      {
        key: 'randomDrops',
        title: 'Random Drops',
        desc: 'Broken blocks drop a random block or item (can be unobtainable).',
      },
      {
        key: 'acidRain',
        title: 'Acid Rain',
        desc: 'Random acid storms (0.5% base chance). Hurts under open sky. Normal rain is always in the game.',
      },
    ];

    let y = py + 140;
    for (const row of rows) {
      this.createModToggleRow(width / 2, y, row.key, row.title, row.desc);
      y += 120;
    }

    this.createSmallButton(width / 2, py + panelH - 44, 'Back', () => {
      saveMods(this.modsState);
      this.renderMainMenu();
    }, 200, 48);
  }

  /**
   * @param {string} key
   * @param {string} title
   * @param {string} desc
   */
  createModToggleRow(cx, cy, key, title, desc) {
    this.add.text(cx - 300, cy - 28, title, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#e8f0ff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);

    this.add.text(cx - 300, cy + 8, desc, {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#8a9bb0',
      wordWrap: { width: 420 },
    }).setOrigin(0, 0);

    const trackW = 88;
    const trackH = 36;
    const switchX = cx + 260;
    const trackY = cy - trackH / 2;

    const drawSwitch = (on) => {
      track.clear();
      track.fillStyle(on ? 0x3a9e5a : 0x555566, 1);
      track.fillRoundedRect(switchX - trackW / 2, trackY, trackW, trackH, trackH / 2);
      track.lineStyle(2, on ? 0x66dd88 : 0x778899, 1);
      track.strokeRoundedRect(switchX - trackW / 2, trackY, trackW, trackH, trackH / 2);
      knob.setX(on ? switchX + trackW / 2 - 20 : switchX - trackW / 2 + 20);
      label.setText(on ? 'ON' : 'OFF');
      label.setStyle({ fill: on ? '#ccffdd' : '#ccccdd' });
    };

    const track = this.add.graphics();
    const knob = this.add.circle(switchX, cy, 14, 0xf0f4ff, 1);
    knob.setStrokeStyle(2, 0x222233);
    knob.setDepth(1);
    track.setDepth(0);
    const label = this.add.text(switchX, cy + 32, '', {
      fontSize: '14px',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    const refresh = () => drawSwitch(!!this.modsState[key]);
    refresh();

    const zone = this.add.zone(switchX, cy, trackW + 24, trackH + 24).setInteractive({ useHandCursor: true });
    zone.on('pointerdown', () => {
      const next = !this.modsState[key];
      if (next) {
        this.showModEnablingOverlay(() => {
          this.modsState[key] = true;
          saveMods(this.modsState);
          refresh();
        });
      } else {
        this.modsState[key] = false;
        saveMods(this.modsState);
        refresh();
      }
    });
  }

  showModEnablingOverlay(done) {
    const { width, height } = this.cameras.main;
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, width, height);
    overlay.setDepth(500);

    const txt = this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '40px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(501);

    this.input.enabled = false;
    this.time.delayedCall(1000, () => {
      overlay.destroy();
      txt.destroy();
      this.input.enabled = true;
      done();
    });
  }

  drawBackground(width, height) {
    const sky = this.add.image(0, 0, 'sky_gradient');
    sky.setOrigin(0, 0);
    sky.setDisplaySize(width, height);

    const cols = Math.ceil(width / TILE_SIZE) + 1;
    const surfaceY = Math.floor(height * 0.55);
    const layers = [
      { block: BlockTypes.GRASS, rows: 1 },
      { block: BlockTypes.DIRT, rows: 4 },
      { block: BlockTypes.STONE, rows: 6 },
      { block: BlockTypes.DEEPSLATE, rows: 8 },
    ];

    let currentY = surfaceY;
    for (const layer of layers) {
      for (let row = 0; row < layer.rows; row++) {
        if (currentY >= height) break;
        for (let col = 0; col < cols; col++) {
          const tile = this.add.image(
            col * TILE_SIZE,
            currentY + row * TILE_SIZE,
            `block_${layer.block}`
          );
          tile.setOrigin(0, 0);
          tile.setAlpha(0.7);
        }
      }
      currentY += layer.rows * TILE_SIZE;
    }

    this.drawTrees(surfaceY, cols);
  }

  drawTrees(surfaceY, cols) {
    const treePositions = [3, 8, 14, 20, 25, 31, 37];
    for (const col of treePositions) {
      if (col >= cols) continue;
      const trunkHeight = 4 + Math.floor(Math.random() * 3);
      const baseX = col * TILE_SIZE;

      for (let i = 0; i < trunkHeight; i++) {
        const trunk = this.add.image(baseX, surfaceY - (i + 1) * TILE_SIZE, `block_${BlockTypes.WOOD}`);
        trunk.setOrigin(0, 0);
        trunk.setAlpha(0.7);
      }

      const topY = surfaceY - trunkHeight * TILE_SIZE;
      for (let lx = -2; lx <= 2; lx++) {
        for (let ly = -2; ly <= 0; ly++) {
          if (Math.abs(lx) === 2 && ly === 0) continue;
          const leaf = this.add.image(baseX + lx * TILE_SIZE, topY + ly * TILE_SIZE, `block_${BlockTypes.LEAVES}`);
          leaf.setOrigin(0, 0);
          leaf.setAlpha(0.6);
        }
      }
    }
  }

  showLoadingWorld(seed, settings = {}) {
    this.children.removeAll(true);

    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor('#000000');

    const loadText = this.add.text(width / 2, height / 2, 'Loading World.', {
      fontSize: '42px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    let dotCount = 1;
    this.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        dotCount = (dotCount % 3) + 1;
        loadText.setText('Loading World' + '.'.repeat(dotCount));
      },
    });

    this.time.delayedCall(1750, () => {
      this.scene.start('GameScene', {
        seed,
        gameMode: settings.gameMode || 'survival',
        difficulty: settings.difficulty || 'normal',
        worldType: settings.worldType || 'default',
        mods: { ...this.modsState },
      });
    });
  }

  formatModeLabel(mode) {
    return mode === 'creative' ? 'Creative' : 'Survival';
  }

  formatDifficultyLabel(diff) {
    const map = {
      peaceful: 'Peaceful',
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard',
    };
    return map[diff] || diff;
  }

  formatWorldTypeLabel(type) {
    const map = {
      default: 'Default',
      superflat: 'Superflat',
      bigger_biomes: 'Bigger Biomes',
      hilly: 'Hilly',
    };
    return map[type] || type;
  }

  createOptionSelector(x, y, title, values, onChange, formatFn) {
    let index = 0;

    this.add.text(x, y - 24, title, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#cdddff',
    }).setOrigin(0.5);

    const valueText = this.add.text(x, y + 4, formatFn(values[index]), {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const refresh = () => {
      const current = values[index];
      valueText.setText(formatFn(current));
      onChange(current);
    };

    this.createSmallButton(x - 180, y + 4, '<', () => {
      index = (index + values.length - 1) % values.length;
      refresh();
    }, 56, 42);

    this.createSmallButton(x + 180, y + 4, '>', () => {
      index = (index + 1) % values.length;
      refresh();
    }, 56, 42);

    refresh();
  }

  createSmallButton(x, y, label, callback, btnW = 150, btnH = 50) {
    const bg = this.add.graphics();
    bg.fillStyle(0x3366aa, 0.95);
    bg.fillRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);
    bg.lineStyle(2, 0x77bbee, 1);
    bg.strokeRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);

    const text = this.add.text(x, y, label, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    const hitZone = this.add.zone(x, y, btnW, btnH).setInteractive({ useHandCursor: true });
    hitZone.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x4488cc, 1);
      bg.fillRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);
      bg.lineStyle(2, 0x99ccff, 1);
      bg.strokeRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);
      text.setScale(1.05);
    });
    hitZone.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x3366aa, 0.95);
      bg.fillRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);
      bg.lineStyle(2, 0x77bbee, 1);
      bg.strokeRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);
      text.setScale(1);
    });
    hitZone.on('pointerdown', callback);
  }

  createButton(x, y, label, callback) {
    const btnW = 280;
    const btnH = 56;

    const bg = this.add.graphics();
    bg.fillStyle(0x3366aa, 0.9);
    bg.fillRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);
    bg.lineStyle(2, 0x5599dd, 1);
    bg.strokeRoundedRect(x - btnW / 2, y - btnH / 2, btnW, btnH, 8);

    const text = this.add.text(x, y, label, {
      fontSize: '26px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
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
}

import { BlockTypes, TILE_SIZE } from '../data/blocks.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.cameras.main.setBackgroundColor('#0a1628');

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

    this.createButton(width / 2, height * 0.52, 'Create World', () => {
      const seed = Math.floor(Math.random() * 2147483647);
      this.showLoadingWorld(seed);
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

  showLoadingWorld(seed) {
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
      this.scene.start('GameScene', { seed });
    });
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

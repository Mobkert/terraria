import { BlockData, TILE_SIZE } from '../data/blocks.js';
import {
  generateWorld,
  findSpawnPoint,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from '../world/WorldGenerator.js';
import TileManager from '../world/TileManager.js';
import Player from '../entities/Player.js';
import Inventory from '../systems/Inventory.js';
import BlockBreakPlace from '../systems/BlockBreakPlace.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#87CEEB');

    this.worldData = generateWorld(42);
    this.tileManager = new TileManager(this, this.worldData);

    this.cameras.main.setBounds(
      0,
      0,
      WORLD_WIDTH * TILE_SIZE,
      WORLD_HEIGHT * TILE_SIZE,
    );

    const spawn = findSpawnPoint(this.worldData);
    const spawnX = spawn.x * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = this.worldData.surfaceHeights[spawn.x] * TILE_SIZE;

    this.player = new Player(this, spawnX, spawnY, this.tileManager);
    this.inventory = new Inventory();
    this.blockSystem = new BlockBreakPlace(
      this,
      this.tileManager,
      this.player,
      this.inventory,
    );

    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    this.tileManager.update();

    this.createHotbarDisplay();
    this.setupHotbarInput();

    this.infoText = this.add
      .text(10, 10, '', {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(100);
  }

  createHotbarDisplay() {
    this.hotbarGfx = this.add.graphics();
    this.hotbarGfx.setScrollFactor(0);
    this.hotbarGfx.setDepth(200);

    this.hotbarIcons = [];
    this.hotbarCounts = [];

    const slotSize = 40;
    const gap = 4;
    const totalWidth = 9 * slotSize + 8 * gap;
    const startX = (this.cameras.main.width - totalWidth) / 2;
    const y = this.cameras.main.height - slotSize - 10;

    for (let i = 0; i < 9; i++) {
      const cx = startX + i * (slotSize + gap) + slotSize / 2;
      const cy = y + slotSize / 2;

      const icon = this.add.image(cx, cy, 'player');
      icon.setDisplaySize(28, 28);
      icon.setScrollFactor(0);
      icon.setDepth(202);
      icon.setVisible(false);

      const count = this.add.text(cx + 14, cy + 14, '', {
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2,
      });
      count.setOrigin(1, 1);
      count.setScrollFactor(0);
      count.setDepth(203);

      this.hotbarIcons.push(icon);
      this.hotbarCounts.push(count);
    }
  }

  setupHotbarInput() {
    const keyNames = [
      'ONE',
      'TWO',
      'THREE',
      'FOUR',
      'FIVE',
      'SIX',
      'SEVEN',
      'EIGHT',
      'NINE',
    ];
    for (let i = 0; i < 9; i++) {
      this.input.keyboard.on(`keydown-${keyNames[i]}`, () => {
        this.inventory.selectedSlot = i;
        this.inventory.dirty = true;
      });
    }

    this.input.on('wheel', (_pointer, _gos, _dx, deltaY) => {
      if (deltaY > 0) {
        this.inventory.selectedSlot = (this.inventory.selectedSlot + 1) % 9;
      } else if (deltaY < 0) {
        this.inventory.selectedSlot = (this.inventory.selectedSlot + 8) % 9;
      }
      this.inventory.dirty = true;
    });
  }

  updateHotbarDisplay() {
    if (!this.inventory.dirty) return;
    this.inventory.dirty = false;

    const g = this.hotbarGfx;
    g.clear();

    const slotSize = 40;
    const gap = 4;
    const totalWidth = 9 * slotSize + 8 * gap;
    const startX = (this.cameras.main.width - totalWidth) / 2;
    const y = this.cameras.main.height - slotSize - 10;

    for (let i = 0; i < 9; i++) {
      const x = startX + i * (slotSize + gap);

      g.fillStyle(0x222222, 0.85);
      g.fillRect(x, y, slotSize, slotSize);

      if (i === this.inventory.selectedSlot) {
        g.lineStyle(2, 0xffff00, 1);
      } else {
        g.lineStyle(1, 0x666666, 0.9);
      }
      g.strokeRect(x, y, slotSize, slotSize);

      const item = this.inventory.hotbar[i];
      const icon = this.hotbarIcons[i];
      const count = this.hotbarCounts[i];

      if (item) {
        icon.setTexture(`block_${item.type}`);
        icon.setVisible(true);
        count.setText(item.count > 1 ? item.count.toString() : '');
      } else {
        icon.setVisible(false);
        count.setText('');
      }
    }
  }

  update(time, delta) {
    this.player.update(delta);
    this.blockSystem.update(delta);
    this.tileManager.update();
    this.updateHotbarDisplay();

    const tx = this.player.getTileX();
    const ty = this.player.getTileY();
    const biome = this.worldData.biomes[tx] || '?';
    const selected = this.inventory.getSelectedItem();
    const itemName = selected ? BlockData[selected.type]?.name || '?' : 'Empty';
    this.infoText.setText(
      `Pos: ${tx},${ty} | Biome: ${biome} | Hand: ${itemName} | LMB=mine RMB=place Scroll=select`,
    );
  }
}

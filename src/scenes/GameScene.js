import { TILE_SIZE } from '../data/blocks.js';
import { getItemName } from '../data/items.js';
import Enemy from '../entities/Enemy.js';
import {
  generateWorld,
  findSpawnPoint,
  mulberry32,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from '../world/WorldGenerator.js';
import TileManager from '../world/TileManager.js';
import Player from '../entities/Player.js';
import Inventory from '../systems/Inventory.js';
import BlockBreakPlace from '../systems/BlockBreakPlace.js';
import ChestManager from '../systems/ChestManager.js';
import FurnaceManager from '../systems/FurnaceManager.js';
import EnemySpawner from '../systems/EnemySpawner.js';
import Arrow from '../entities/Arrow.js';

const BIOME_TINTS = {
  forest: { color: 0x000000, alpha: 0 },
  desert: { color: 0xcc8833, alpha: 0.08 },
  jungle: { color: 0x225533, alpha: 0.1 },
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.worldData = generateWorld(42);
    this.tileManager = new TileManager(this, this.worldData);

    const worldPxW = WORLD_WIDTH * TILE_SIZE;
    const worldPxH = WORLD_HEIGHT * TILE_SIZE;

    this.cameras.main.setBounds(0, 0, worldPxW, worldPxH);
    this.cameras.main.setBackgroundColor('#0a1628');

    this.createBackground(worldPxW, worldPxH);

    const spawn = findSpawnPoint(this.worldData);
    const spawnX = spawn.x * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = this.worldData.surfaceHeights[spawn.x] * TILE_SIZE;

    this.inventory = new Inventory();
    this.player = new Player(this, spawnX, spawnY, this.tileManager, this.inventory);
    this.chestManager = new ChestManager(this.worldData, mulberry32(42 + 999));
    this.furnaceManager = new FurnaceManager();

    this.enemies = [];
    this.arrows = [];
    this.enemySpawner = new EnemySpawner(this, this.tileManager, this.worldData);

    this.blockSystem = new BlockBreakPlace(
      this,
      this.tileManager,
      this.player,
      this.inventory,
      this.chestManager,
      this.furnaceManager,
    );
    this.blockSystem.enemies = this.enemies;

    const bombX = spawnX + 100;
    const bombY = spawnY;
    this.enemies.push(new Enemy(this, bombX, bombY, 'BOMB_ZOMBIE', this.tileManager));

    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    this.tileManager.update();

    this.scene.launch('UIScene', {
      inventory: this.inventory,
      chestManager: this.chestManager,
      furnaceManager: this.furnaceManager,
      player: this.player,
    });

    this.biomeTint = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000, 0,
    );
    this.biomeTint.setScrollFactor(0);
    this.biomeTint.setDepth(50);

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

  createBackground(worldPxW, worldPxH) {
    this.skyH = this.cameras.main.height * 4;
    this.skyBg = this.add.image(
      this.cameras.main.width / 2,
      0,
      'sky_gradient',
    );
    this.skyBg.setDisplaySize(this.cameras.main.width, this.skyH);
    this.skyBg.setOrigin(0.5, 0);
    this.skyBg.setScrollFactor(0, 0);
    this.skyBg.setDepth(-10);

    this.createMountainLayer(worldPxW, 0.15, 0x2a3a4a, 0.5, -8, 120);
    this.createMountainLayer(worldPxW, 0.3, 0x3a4a3a, 0.6, -7, 80);
  }

  createMountainLayer(worldPxW, scrollFactorX, color, alpha, depth, heightScale) {
    const g = this.add.graphics();
    g.setDepth(depth);
    g.setScrollFactor(scrollFactorX, 0.4);

    const segW = 4;
    const surfaceBase = 100 * TILE_SIZE;
    const baseY = surfaceBase - 40;

    g.fillStyle(color, alpha);
    g.beginPath();
    g.moveTo(0, baseY + heightScale);

    for (let px = 0; px < worldPxW; px += segW) {
      const n1 = Math.sin(px * 0.002 + scrollFactorX * 10) * 0.5;
      const n2 = Math.sin(px * 0.005 + scrollFactorX * 20) * 0.3;
      const n3 = Math.sin(px * 0.0008) * 0.8;
      const h = (n1 + n2 + n3) * heightScale;
      g.lineTo(px, baseY - h);
    }

    g.lineTo(worldPxW, baseY + heightScale);
    g.closePath();
    g.fillPath();
  }

  update(time, delta) {
    this.player.update(delta);
    this.blockSystem.update(delta);
    this.furnaceManager.update(delta);
    this.enemySpawner.update(delta, this.player, this.enemies);
    this.updateEnemies(delta);
    this.updateArrows(delta);
    this.tileManager.update();

    this.updateSkyPosition();
    this.updateBiomeTint();

    const tx = this.player.getTileX();
    const ty = this.player.getTileY();
    const biome = this.worldData.biomes[tx] || '?';
    const selected = this.inventory.getSelectedItem();
    const itemName = selected ? getItemName(selected.type) : 'Empty';
    this.infoText.setText(
      `Pos: ${tx},${ty} | Biome: ${biome} | Hand: ${itemName}`,
    );
  }

  spawnArrow(x, y, angle, damage) {
    const arrow = new Arrow(this, x, y, angle, damage, this.tileManager);
    this.arrows.push(arrow);
  }

  updateEnemies(delta) {
    const spawnArrowFn = (x, y, angle, dmg) => this.spawnArrow(x, y, angle, dmg);

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(delta, this.player, this.enemies, spawnArrowFn);

      if (enemy.dead) {
        this.enemies.splice(i, 1);
        continue;
      }

      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 800) {
        enemy.die();
        this.enemies.splice(i, 1);
      }
    }
  }

  updateArrows(delta) {
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];
      arrow.update(delta, this.player);
      if (arrow.dead) this.arrows.splice(i, 1);
    }
  }

  updateSkyPosition() {
    const cam = this.cameras.main;
    const worldH = WORLD_HEIGHT * TILE_SIZE;
    const maxCamScroll = worldH - cam.height;
    const scrollRatio = Phaser.Math.Clamp(cam.scrollY / maxCamScroll, 0, 1);
    const maxShift = this.skyH - cam.height;
    this.skyBg.setY(-scrollRatio * maxShift);
  }

  updateBiomeTint() {
    const tx = this.player.getTileX();
    const biome = this.worldData.biomes[tx] || 'forest';
    const tint = BIOME_TINTS[biome] || BIOME_TINTS.forest;
    this.biomeTint.setFillStyle(tint.color, tint.alpha);
  }
}

import { TILE_SIZE } from '../data/blocks.js';
import {
  generateWorld,
  findSpawnPoint,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from '../world/WorldGenerator.js';
import TileManager from '../world/TileManager.js';

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

    this.playerSprite = this.add.image(
      spawn.x * TILE_SIZE + TILE_SIZE / 2,
      spawn.y * TILE_SIZE,
      'player',
    );
    this.playerSprite.setOrigin(0.5, 1);
    this.playerSprite.setDepth(10);

    this.cameras.main.centerOn(
      spawn.x * TILE_SIZE,
      spawn.y * TILE_SIZE,
    );

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D',
    });

    this.tileManager.update();

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

  update() {
    const speed = 10;
    const cam = this.cameras.main;

    if (this.cursors.left.isDown || this.wasd.left.isDown) cam.scrollX -= speed;
    if (this.cursors.right.isDown || this.wasd.right.isDown)
      cam.scrollX += speed;
    if (this.cursors.up.isDown || this.wasd.up.isDown) cam.scrollY -= speed;
    if (this.cursors.down.isDown || this.wasd.down.isDown)
      cam.scrollY += speed;

    this.tileManager.update();

    const tileX = Math.floor((cam.scrollX + cam.width / 2) / TILE_SIZE);
    const tileY = Math.floor((cam.scrollY + cam.height / 2) / TILE_SIZE);
    const biome = this.worldData.biomes[tileX] || '?';
    this.infoText.setText(
      `Pos: ${tileX},${tileY} | Biome: ${biome} | Tiles: ${this.tileManager.sprites.size} | WASD/Arrows to explore`,
    );
  }
}

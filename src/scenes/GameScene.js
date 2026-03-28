import { TILE_SIZE } from '../data/blocks.js';
import {
  generateWorld,
  findSpawnPoint,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from '../world/WorldGenerator.js';
import TileManager from '../world/TileManager.js';
import Player from '../entities/Player.js';

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

    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

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

  update(time, delta) {
    this.player.update(delta);
    this.tileManager.update();

    const tx = this.player.getTileX();
    const ty = this.player.getTileY();
    const biome = this.worldData.biomes[tx] || '?';
    this.infoText.setText(
      `Pos: ${tx},${ty} | Biome: ${biome} | A/D move, SPACE jump`,
    );
  }
}

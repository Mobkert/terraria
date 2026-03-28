import { BlockTypes, TILE_SIZE } from '../data/blocks.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#87CEEB');

    const worldWidth = 40;
    const worldHeight = 22;
    const surfaceY = 10;

    for (let x = 0; x < worldWidth; x++) {
      for (let y = 0; y < worldHeight; y++) {
        let blockType = BlockTypes.AIR;

        if (y === surfaceY) {
          blockType = BlockTypes.GRASS;
        } else if (y > surfaceY && y <= surfaceY + 4) {
          blockType = BlockTypes.DIRT;
        } else if (y > surfaceY + 4 && y <= surfaceY + 8) {
          blockType = BlockTypes.STONE;
        } else if (y > surfaceY + 8) {
          blockType = BlockTypes.DEEPSLATE;
        }

        if (blockType !== BlockTypes.AIR) {
          this.add.image(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            `block_${blockType}`
          );
        }
      }
    }

    this.buildTree(10, surfaceY);
    this.buildTree(20, surfaceY);
    this.buildTree(30, surfaceY);

    this.buildDesertStrip(33, 40, surfaceY);

    const player = this.add.image(
      5 * TILE_SIZE + TILE_SIZE / 2,
      surfaceY * TILE_SIZE - TILE_SIZE,
      'player'
    );
    player.setOrigin(0.5, 1);

    this.add.text(10, 10, 'Phase 1 — Rendering Test (all blocks + player blob)', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#00000088',
      padding: { x: 8, y: 4 },
    });
  }

  buildTree(tileX, surfaceY) {
    const trunkHeight = 5;
    for (let ty = surfaceY - trunkHeight; ty < surfaceY; ty++) {
      this.add.image(
        tileX * TILE_SIZE + TILE_SIZE / 2,
        ty * TILE_SIZE + TILE_SIZE / 2,
        `block_${BlockTypes.WOOD}`
      );
    }

    for (let lx = tileX - 2; lx <= tileX + 2; lx++) {
      for (let ly = surfaceY - trunkHeight - 2; ly <= surfaceY - trunkHeight + 1; ly++) {
        if (lx === tileX && ly > surfaceY - trunkHeight) continue;
        this.add.image(
          lx * TILE_SIZE + TILE_SIZE / 2,
          ly * TILE_SIZE + TILE_SIZE / 2,
          `block_${BlockTypes.LEAVES}`
        );
      }
    }
  }

  buildDesertStrip(startX, endX, surfaceY) {
    for (let x = startX; x < endX; x++) {
      for (let y = surfaceY; y < 22; y++) {
        let blockType;
        if (y === surfaceY) {
          blockType = BlockTypes.SAND;
        } else if (y <= surfaceY + 4) {
          blockType = BlockTypes.SANDSTONE;
        } else if (y <= surfaceY + 8) {
          blockType = BlockTypes.STONE;
        } else {
          blockType = BlockTypes.DEEPSLATE;
        }

        this.add.image(
          x * TILE_SIZE + TILE_SIZE / 2,
          y * TILE_SIZE + TILE_SIZE / 2,
          `block_${blockType}`
        );
      }
    }
  }
}

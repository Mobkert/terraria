import { BlockTypes, TILE_SIZE } from '../data/blocks.js';

export default class TileManager {
  constructor(scene, worldData) {
    this.scene = scene;
    this.tiles = worldData.tiles;
    this.w = worldData.width;
    this.h = worldData.height;
    this.sprites = new Map();
    this.pool = [];
    this.lastBounds = null;
    this.BUFFER = 3;
  }

  tileKey(x, y) {
    return x * this.h + y;
  }

  getBlock(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return BlockTypes.AIR;
    return this.tiles[y * this.w + x];
  }

  setBlock(x, y, type) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    this.tiles[y * this.w + x] = type;
    this.refreshTile(x, y);
  }

  refreshTile(x, y) {
    const k = this.tileKey(x, y);
    const existing = this.sprites.get(k);
    if (existing) {
      existing.setVisible(false);
      existing.setActive(false);
      this.pool.push(existing);
      this.sprites.delete(k);
    }

    const blockType = this.getBlock(x, y);
    if (blockType !== BlockTypes.AIR) {
      this.placeSprite(x, y, blockType, k);
    }
  }

  placeSprite(x, y, blockType, k) {
    let sprite = this.pool.pop();
    if (sprite) {
      sprite.setTexture(`block_${blockType}`);
      sprite.setPosition(
        x * TILE_SIZE + TILE_SIZE / 2,
        y * TILE_SIZE + TILE_SIZE / 2,
      );
      sprite.setVisible(true);
      sprite.setActive(true);
    } else {
      sprite = this.scene.add.image(
        x * TILE_SIZE + TILE_SIZE / 2,
        y * TILE_SIZE + TILE_SIZE / 2,
        `block_${blockType}`,
      );
    }
    this.sprites.set(k, sprite);
  }

  getVisibleBounds() {
    const cam = this.scene.cameras.main;
    const b = this.BUFFER;
    return {
      left: Math.max(0, Math.floor(cam.scrollX / TILE_SIZE) - b),
      top: Math.max(0, Math.floor(cam.scrollY / TILE_SIZE) - b),
      right: Math.min(
        this.w - 1,
        Math.ceil((cam.scrollX + cam.width) / TILE_SIZE) + b,
      ),
      bottom: Math.min(
        this.h - 1,
        Math.ceil((cam.scrollY + cam.height) / TILE_SIZE) + b,
      ),
    };
  }

  update() {
    const bounds = this.getVisibleBounds();

    const lb = this.lastBounds;
    if (
      lb &&
      bounds.left === lb.left &&
      bounds.right === lb.right &&
      bounds.top === lb.top &&
      bounds.bottom === lb.bottom
    ) {
      return;
    }

    for (const [k, sprite] of this.sprites) {
      const y = k % this.h;
      const x = (k - y) / this.h;
      if (
        x < bounds.left ||
        x > bounds.right ||
        y < bounds.top ||
        y > bounds.bottom
      ) {
        sprite.setVisible(false);
        sprite.setActive(false);
        this.pool.push(sprite);
        this.sprites.delete(k);
      }
    }

    for (let x = bounds.left; x <= bounds.right; x++) {
      for (let y = bounds.top; y <= bounds.bottom; y++) {
        const k = this.tileKey(x, y);
        if (this.sprites.has(k)) continue;

        const blockType = this.getBlock(x, y);
        if (blockType !== BlockTypes.AIR) {
          this.placeSprite(x, y, blockType, k);
        }
      }
    }

    this.lastBounds = { ...bounds };
  }
}

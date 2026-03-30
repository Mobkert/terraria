import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';

export default class TileManager {
  constructor(scene, worldData) {
    this.scene = scene;
    this.tiles = worldData.tiles;
    this.w = worldData.width;
    this.h = worldData.height;
    this.surfaceHeights = worldData.surfaceHeights;
    this.sprites = new Map();
    this.pool = [];
    this.lastBounds = null;
    this.BUFFER = 3;

    this.lightMap = new Uint8Array(this.w * this.h);
    this.darknessGfx = scene.add.graphics();
    this.darknessGfx.setDepth(9);
    this.lastDarkBounds = null;

    this.calculateAllLight();
  }

  tileKey(x, y) {
    return x * this.h + y;
  }

  getBlock(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return BlockTypes.AIR;
    return this.tiles[y * this.w + x];
  }

  getLight(x, y) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return 15;
    return this.lightMap[y * this.w + x];
  }

  setBlock(x, y, type) {
    if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
    this.tiles[y * this.w + x] = type;
    this.refreshTile(x, y);
    this.updateLightArea(x, y, 16);
    this.lastDarkBounds = null;
  }

  isSolid(x, y) {
    const block = this.getBlock(x, y);
    if (block === BlockTypes.AIR) return false;
    const data = BlockData[block];
    return !data || data.solid !== false;
  }

  calculateAllLight() {
    this.lightMap.fill(0);

    const queue = [];
    const SUB_SURFACE_DEPTH = 15;

    for (let x = 0; x < this.w; x++) {
      const sy = this.surfaceHeights ? this.surfaceHeights[x] : this.h;

      for (let y = 0; y <= sy && y < this.h; y++) {
        const idx = y * this.w + x;
        this.lightMap[idx] = 15;
        queue.push(x, y, 15);
      }

      for (let y = sy + 1; y < this.h; y++) {
        if (this.isSolid(x, y)) break;
        const idx = y * this.w + x;
        this.lightMap[idx] = 15;
        queue.push(x, y, 15);
      }

      for (let d = 1; d <= SUB_SURFACE_DEPTH; d++) {
        const y = sy + d;
        if (y < 0 || y >= this.h) continue;
        const block = this.getBlock(x, y);
        if (block === BlockTypes.AIR) continue;
        const ambient = Math.max(0, Math.round(13 - d * 0.7));
        const idx = y * this.w + x;
        if (this.lightMap[idx] < ambient) {
          this.lightMap[idx] = ambient;
          queue.push(x, y, ambient);
        }
      }
    }

    for (let x = 0; x < this.w; x++) {
      for (let y = 0; y < this.h; y++) {
        const block = this.getBlock(x, y);
        const data = BlockData[block];
        if (data && data.lightLevel) {
          const idx = y * this.w + x;
          if (this.lightMap[idx] < data.lightLevel) {
            this.lightMap[idx] = data.lightLevel;
            queue.push(x, y, data.lightLevel);
          }
        }
      }
    }

    this.propagateLight(queue);
  }

  propagateLight(queue) {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let i = 0;

    while (i < queue.length) {
      const cx = queue[i++];
      const cy = queue[i++];
      const cl = queue[i++];

      if (cl <= 1) continue;
      const nl = cl - 1;

      for (const [dx, dy] of dirs) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || nx >= this.w || ny < 0 || ny >= this.h) continue;

        const nIdx = ny * this.w + nx;
        if (this.lightMap[nIdx] >= nl) continue;

        this.lightMap[nIdx] = nl;
        if (!this.isSolid(nx, ny)) {
          queue.push(nx, ny, nl);
        }
      }
    }
  }

  updateLightArea(cx, cy, radius) {
    const minX = Math.max(0, cx - radius);
    const maxX = Math.min(this.w - 1, cx + radius);
    const minY = Math.max(0, cy - radius);
    const maxY = Math.min(this.h - 1, cy + radius);

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        this.lightMap[y * this.w + x] = 0;
      }
    }

    const queue = [];

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const block = this.getBlock(x, y);
        const data = BlockData[block];

        const sy = this.surfaceHeights ? this.surfaceHeights[x] : this.h;
        const atOrAboveSurface = y <= sy;

        let skyLit = false;
        if (atOrAboveSurface) {
          skyLit = true;
        } else if (!this.isSolid(x, y)) {
          let blocked = false;
          for (let sy2 = sy + 1; sy2 < y; sy2++) {
            if (this.isSolid(x, sy2)) { blocked = true; break; }
          }
          if (!blocked) skyLit = true;
        }

        let ambient = 0;
        const d = y - sy;
        if (d >= 1 && d <= 15 && block !== BlockTypes.AIR) {
          ambient = Math.max(0, Math.round(13 - d * 0.7));
        }

        if (skyLit) {
          this.lightMap[y * this.w + x] = 15;
          queue.push(x, y, 15);
        } else if (ambient > 0) {
          this.lightMap[y * this.w + x] = ambient;
          queue.push(x, y, ambient);
        } else if (data && data.lightLevel) {
          this.lightMap[y * this.w + x] = data.lightLevel;
          queue.push(x, y, data.lightLevel);
        }
      }
    }

    for (let x = minX; x <= maxX; x++) {
      for (const by of [minY - 1, maxY + 1]) {
        if (by >= 0 && by < this.h) {
          const l = this.lightMap[by * this.w + x];
          if (l > 0 && !this.isSolid(x, by)) queue.push(x, by, l);
        }
      }
    }
    for (let y = minY; y <= maxY; y++) {
      for (const bx of [minX - 1, maxX + 1]) {
        if (bx >= 0 && bx < this.w) {
          const l = this.lightMap[y * this.w + bx];
          if (l > 0 && !this.isSolid(bx, y)) queue.push(bx, y, l);
        }
      }
    }

    this.propagateLightBounded(queue, minX, minY, maxX, maxY);
  }

  propagateLightBounded(queue, minX, minY, maxX, maxY) {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let i = 0;

    while (i < queue.length) {
      const cx = queue[i++];
      const cy = queue[i++];
      const cl = queue[i++];

      if (cl <= 1) continue;
      const nl = cl - 1;

      for (const [dx, dy] of dirs) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < minX || nx > maxX || ny < minY || ny > maxY) continue;

        const nIdx = ny * this.w + nx;
        if (this.lightMap[nIdx] >= nl) continue;

        this.lightMap[nIdx] = nl;
        if (!this.isSolid(nx, ny)) {
          queue.push(nx, ny, nl);
        }
      }
    }
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
    const boundsChanged = !lb ||
      bounds.left !== lb.left ||
      bounds.right !== lb.right ||
      bounds.top !== lb.top ||
      bounds.bottom !== lb.bottom;

    if (boundsChanged) {
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

    this.updateDarkness(bounds, boundsChanged);
  }

  updateDarkness(bounds, boundsChanged) {
    const db = this.lastDarkBounds;
    const darkChanged = boundsChanged || !db ||
      bounds.left !== db.left ||
      bounds.right !== db.right ||
      bounds.top !== db.top ||
      bounds.bottom !== db.bottom;

    if (!darkChanged) return;

    const g = this.darknessGfx;
    g.clear();

    for (let x = bounds.left; x <= bounds.right; x++) {
      for (let y = bounds.top; y <= bounds.bottom; y++) {
        const light = this.getLight(x, y);
        if (light >= 15) continue;

        const alpha = (1 - light / 15) * 0.93;
        g.fillStyle(0x000000, alpha);
        g.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    this.lastDarkBounds = { ...bounds };
  }
}

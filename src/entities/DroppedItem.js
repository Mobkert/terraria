import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';
import { getItemTexture } from '../data/items.js';

function isSolid(block) {
  if (block === BlockTypes.AIR) return false;
  const data = BlockData[block];
  return !data || data.solid !== false;
}

export default class DroppedItem {
  constructor(scene, x, y, blockType, tileManager) {
    this.scene = scene;
    this.tileManager = tileManager;
    this.blockType = blockType;

    this.sprite = scene.add.image(x, y, getItemTexture(blockType));
    this.sprite.setScale(0.5);
    this.sprite.setDepth(5);

    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 100;
    this.vy = -150;

    this.GRAVITY = 500;
    this.MAX_FALL = 400;
    this.PICKUP_RANGE = 56;
    this.MAGNET_RANGE = 48;

    this.collected = false;
    this.lifetime = 60000;
    this.bobTime = Math.random() * Math.PI * 2;
  }

  update(delta, player) {
    if (this.collected) return false;

    const dt = delta / 1000;

    this.vy += this.GRAVITY * dt;
    if (this.vy > this.MAX_FALL) this.vy = this.MAX_FALL;

    const newX = this.x + this.vx * dt;
    const txNew = Math.floor(newX / TILE_SIZE);
    const tyMid = Math.floor(this.y / TILE_SIZE);
    if (!isSolid(this.tileManager.getBlock(txNew, tyMid))) {
      this.x = newX;
    } else {
      this.vx = 0;
    }

    const newY = this.y + this.vy * dt;
    const txMid = Math.floor(this.x / TILE_SIZE);
    const tyNew = Math.floor(newY / TILE_SIZE);
    if (!isSolid(this.tileManager.getBlock(txMid, tyNew))) {
      this.y = newY;
    } else {
      if (this.vy > 0) {
        this.y = tyNew * TILE_SIZE - 1;
      }
      this.vy = 0;
      this.vx *= 0.85;
    }

    const pcx = player.x;
    const pcy = player.y - player.height / 2;
    const dx = pcx - this.x;
    const dy = pcy - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.MAGNET_RANGE) {
      const pull = 350;
      this.vx = (dx / dist) * pull;
      this.vy = (dy / dist) * pull;

      if (dist < 18) {
        this.collected = true;
        this.sprite.destroy();
        return true;
      }
    }

    this.bobTime += dt * 3;
    this.sprite.setPosition(this.x, this.y + Math.sin(this.bobTime) * 2);

    this.lifetime -= delta;
    if (this.lifetime <= 0) {
      this.collected = true;
      this.sprite.destroy();
      return false;
    }

    return false;
  }

  destroy() {
    if (!this.collected) {
      this.collected = true;
      this.sprite.destroy();
    }
  }
}

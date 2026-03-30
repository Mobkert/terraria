import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';

export default class Arrow {
  constructor(scene, x, y, angle, damage, tileManager) {
    this.scene = scene;
    this.tileManager = tileManager;
    this.damage = damage;

    this.sprite = scene.add.image(x, y, 'arrow');
    this.sprite.setDisplaySize(16, 6);
    this.sprite.setDepth(7);
    this.sprite.setRotation(angle);

    this.x = x;
    this.y = y;

    const SPEED = 280;
    this.vx = Math.cos(angle) * SPEED;
    this.vy = Math.sin(angle) * SPEED;

    this.dead = false;
    this.lifetime = 5000;
    this.GRAVITY = 200;
  }

  update(delta, player) {
    if (this.dead) return;

    const dt = delta / 1000;

    this.vy += this.GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.sprite.setPosition(this.x, this.y);
    this.sprite.setRotation(Math.atan2(this.vy, this.vx));

    const tx = Math.floor(this.x / TILE_SIZE);
    const ty = Math.floor(this.y / TILE_SIZE);
    const block = this.tileManager.getBlock(tx, ty);
    if (block !== BlockTypes.AIR) {
      const data = BlockData[block];
      if (!data || data.solid !== false) {
        this.die();
        return;
      }
    }

    const dx = player.x - this.x;
    const dy = (player.y - player.height / 2) - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 24 && !player.dead) {
      player.takeDamage(this.damage);
      this.die();
      return;
    }

    this.lifetime -= delta;
    if (this.lifetime <= 0) this.die();
  }

  die() {
    this.dead = true;
    this.sprite.destroy();
  }
}

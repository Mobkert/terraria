import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';

export default class ThrownBomb {
  constructor(scene, x, y, vx, vy, damage, explodeRadius, tileManager, enemies) {
    this.scene = scene;
    this.tileManager = tileManager;
    this.enemies = enemies;
    this.damage = damage;
    this.explodeRadius = explodeRadius;

    this.sprite = scene.add.image(x, y, 'item_43');
    this.sprite.setDisplaySize(14, 14);
    this.sprite.setDepth(9);

    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;

    this.dead = false;
    this.lifetime = 8000;
    this.GRAVITY = 450;
    this.rotation = 0;
  }

  update(delta, player) {
    if (this.dead) return;

    const dt = delta / 1000;

    this.vy += this.GRAVITY * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.rotation += dt * 8;
    this.sprite.setPosition(this.x, this.y);
    this.sprite.setRotation(this.rotation);

    const tx = Math.floor(this.x / TILE_SIZE);
    const ty = Math.floor(this.y / TILE_SIZE);
    const block = this.tileManager.getBlock(tx, ty);
    if (block !== BlockTypes.AIR) {
      const data = BlockData[block];
      if (!data || data.solid !== false) {
        if (data && data.halfHeight) {
          if (this.y >= ty * TILE_SIZE + TILE_SIZE / 2) {
            this.explode(player);
            return;
          }
        } else {
          this.explode(player);
          return;
        }
      }
    }

    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - this.x;
      const dy = (enemy.y - enemy.height / 2) - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 24) {
        this.explode(player);
        return;
      }
    }

    this.lifetime -= delta;
    if (this.lifetime <= 0) {
      this.explode(player);
    }
  }

  explode(player) {
    if (this.dead) return;
    this.dead = true;

    const cx = Math.floor(this.x / TILE_SIZE);
    const cy = Math.floor(this.y / TILE_SIZE);
    const r = this.explodeRadius;

    for (let bx = cx - r; bx <= cx + r; bx++) {
      for (let by = cy - r; by <= cy + r; by++) {
        const d = Math.sqrt((bx - cx) ** 2 + (by - cy) ** 2);
        if (d <= r) {
          const block = this.tileManager.getBlock(bx, by);
          if (block !== BlockTypes.AIR && block !== BlockTypes.CHEST &&
              block !== BlockTypes.WORKBENCH && block !== BlockTypes.FURNACE) {
            this.tileManager.setBlock(bx, by, BlockTypes.AIR);
          }
        }
      }
    }

    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - this.x;
      const dy = (enemy.y - enemy.height / 2) - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (r + 2) * TILE_SIZE) {
        const knockDir = dx !== 0 ? dx / Math.abs(dx) : 1;
        enemy.takeDamage(this.damage, knockDir);
      }
    }

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < (r + 2) * TILE_SIZE) {
      player.takeDamage(this.damage);
      const kb = dx !== 0 ? (dx / Math.abs(dx)) * 300 : 0;
      player.vx += kb;
      player.vy -= 200;
    }

    this.drawExplosionEffect();
    this.sprite.destroy();
  }

  drawExplosionEffect() {
    const gfx = this.scene.add.graphics();
    gfx.setDepth(20);

    gfx.fillStyle(0xff6622, 0.7);
    gfx.fillCircle(this.x, this.y, this.explodeRadius * TILE_SIZE * 0.8);
    gfx.fillStyle(0xffaa22, 0.5);
    gfx.fillCircle(this.x, this.y, this.explodeRadius * TILE_SIZE * 0.5);
    gfx.fillStyle(0xffffaa, 0.4);
    gfx.fillCircle(this.x, this.y, this.explodeRadius * TILE_SIZE * 0.25);

    this.scene.time.delayedCall(200, () => gfx.destroy());
  }
}

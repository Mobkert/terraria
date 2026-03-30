import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';

export const EnemyTypes = {
  ZOMBIE: {
    name: 'Zombie',
    texture: 'enemy_zombie',
    health: 40,
    damage: 15,
    speed: 60,
    width: 20,
    height: 48,
    knockback: 200,
    attackCooldown: 1000,
  },
  SKELETON: {
    name: 'Skeleton',
    texture: 'enemy_skeleton',
    health: 30,
    damage: 8,
    speed: 45,
    width: 18,
    height: 48,
    knockback: 180,
    attackCooldown: 800,
    shootInterval: 2500,
    shootRange: 250,
    preferredDist: 120,
  },
  BOMB_ZOMBIE: {
    name: 'Bomb Zombie',
    texture: 'enemy_bomb',
    health: 25,
    damage: 40,
    speed: 85,
    width: 20,
    height: 48,
    knockback: 150,
    attackCooldown: 99999,
    explodeRadius: 3,
    explodeDist: 40,
    fuseTime: 1500,
  },
};

function isSolid(block) {
  if (block === BlockTypes.AIR) return false;
  const data = BlockData[block];
  return !data || data.solid !== false;
}

export default class Enemy {
  constructor(scene, x, y, type, tileManager) {
    this.scene = scene;
    this.tileManager = tileManager;
    this.type = type;
    this.config = EnemyTypes[type];

    this.sprite = scene.add.image(x, y, this.config.texture);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(8);

    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.width = this.config.width;
    this.height = this.config.height;

    this.health = this.config.health;
    this.dead = false;
    this.onGround = false;
    this.direction = Math.random() < 0.5 ? -1 : 1;

    this.attackTimer = 0;
    this.shootTimer = this.config.shootInterval || 0;
    this.hurtFlash = 0;

    this.fusing = false;
    this.fuseTimer = 0;

    this.GRAVITY = 720;
    this.MAX_FALL = 640;
    this.JUMP_SPEED = 350;
  }

  update(delta, player, enemies, spawnArrowFn) {
    if (this.dead) return;

    const dt = delta / 1000;

    if (this.hurtFlash > 0) {
      this.hurtFlash -= dt;
      this.sprite.setTint(0xff4444);
      if (this.hurtFlash <= 0) this.sprite.clearTint();
    }

    if (this.attackTimer > 0) this.attackTimer -= delta;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this.ai(dt, dx, dy, dist, player, spawnArrowFn);

    this.vy += this.GRAVITY * dt;
    if (this.vy > this.MAX_FALL) this.vy = this.MAX_FALL;

    this.moveAxis(dt);

    this.onGround = this.collidesAt(this.x, this.y + 1);

    this.sprite.setPosition(Math.round(this.x), Math.round(this.y));
    this.sprite.setFlipX(dx < 0);

    if (!player.dead && this.attackTimer <= 0 && dist < 36 && this.type !== 'BOMB_ZOMBIE') {
      player.takeDamage(this.config.damage);
      this.attackTimer = this.config.attackCooldown;
      const kb = dx > 0 ? -this.config.knockback : this.config.knockback;
      player.vx += kb;
    }
  }

  ai(dt, dx, dy, dist, player, spawnArrowFn) {
    const cfg = this.config;

    if (this.type === 'BOMB_ZOMBIE') {
      this.direction = dx > 0 ? 1 : -1;
      this.vx = this.direction * cfg.speed;

      if (dist < cfg.explodeDist && !this.fusing) {
        this.fusing = true;
        this.fuseTimer = cfg.fuseTime;
      }

      if (this.fusing) {
        this.fuseTimer -= dt * 1000;
        this.vx = 0;
        this.sprite.setTint(
          Math.floor(this.fuseTimer / 200) % 2 === 0 ? 0xffffff : 0xff2200,
        );
        if (this.fuseTimer <= 0) {
          this.explode(player);
          return;
        }
      }

      this.tryJump(dx);
      return;
    }

    if (this.type === 'SKELETON') {
      if (dist < cfg.preferredDist) {
        this.direction = dx > 0 ? -1 : 1;
      } else {
        this.direction = dx > 0 ? 1 : -1;
      }
      this.vx = this.direction * cfg.speed;

      this.shootTimer -= dt * 1000;
      if (this.shootTimer <= 0 && dist < cfg.shootRange && spawnArrowFn) {
        const angle = Math.atan2(dy, dx);
        spawnArrowFn(this.x, this.y - this.height * 0.6, angle, cfg.damage);
        this.shootTimer = cfg.shootInterval;
      }

      this.tryJump(dx);
      return;
    }

    this.direction = dx > 0 ? 1 : -1;
    this.vx = this.direction * cfg.speed;
    this.tryJump(dx);
  }

  tryJump(dx) {
    if (!this.onGround) return;

    const checkX = this.x + (dx > 0 ? 1 : -1) * (this.width / 2 + 4);
    const checkY = this.y - 2;
    const tx = Math.floor(checkX / TILE_SIZE);
    const ty = Math.floor(checkY / TILE_SIZE);

    if (isSolid(this.tileManager.getBlock(tx, ty))) {
      this.vy = -this.JUMP_SPEED;
    }
  }

  explode(player) {
    const cx = Math.floor(this.x / TILE_SIZE);
    const cy = Math.floor((this.y - this.height / 2) / TILE_SIZE);
    const r = this.config.explodeRadius;

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

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < (r + 2) * TILE_SIZE) {
      player.takeDamage(this.config.damage);
      const kb = dx !== 0 ? (dx / Math.abs(dx)) * 350 : 0;
      player.vx += kb;
      player.vy -= 250;
    }

    this.die();
  }

  takeDamage(amount, knockDir) {
    if (this.dead) return;
    this.health -= amount;
    this.hurtFlash = 0.2;
    this.vx += knockDir * 250;
    this.vy -= 150;
    if (this.health <= 0) this.die();
  }

  die() {
    this.dead = true;
    this.sprite.destroy();
  }

  moveAxis(dt) {
    const dx = this.vx * dt;
    if (dx !== 0) {
      const newX = this.x + dx;
      if (!this.collidesAt(newX, this.y)) {
        this.x = newX;
      } else {
        this.vx = 0;
      }
    }

    const dy = this.vy * dt;
    if (dy !== 0) {
      const newY = this.y + dy;
      if (!this.collidesAt(this.x, newY)) {
        this.y = newY;
      } else {
        if (dy > 0) {
          this.y = Math.floor(newY / TILE_SIZE) * TILE_SIZE;
        } else {
          const headY = newY - this.height;
          this.y = (Math.floor(headY / TILE_SIZE) + 1) * TILE_SIZE + this.height + 0.01;
        }
        this.vy = 0;
      }
    }
  }

  collidesAt(x, y) {
    const left = x - this.width / 2;
    const right = x + this.width / 2 - 0.01;
    const top = y - this.height;
    const bottom = y - 0.01;

    const tLeft = Math.floor(left / TILE_SIZE);
    const tRight = Math.floor(right / TILE_SIZE);
    const tTop = Math.floor(top / TILE_SIZE);
    const tBottom = Math.floor(bottom / TILE_SIZE);

    for (let tx = tLeft; tx <= tRight; tx++) {
      for (let ty = tTop; ty <= tBottom; ty++) {
        if (isSolid(this.tileManager.getBlock(tx, ty))) return true;
      }
    }
    return false;
  }
}

import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';
import { ItemTypes } from '../data/items.js';

export const AnimalTypes = {
  SHEEP: {
    texture: 'animal_sheep',
    health: 20,
    speed: 38,
    width: 18,
    height: 40,
    knockback: 180,
  },
  COW: {
    texture: 'animal_cow',
    health: 32,
    speed: 32,
    width: 22,
    height: 44,
    knockback: 160,
  },
  PIG: {
    texture: 'animal_pig',
    health: 22,
    speed: 42,
    width: 18,
    height: 36,
    knockback: 170,
  },
};

function isSolid(block) {
  if (block === BlockTypes.AIR) return false;
  const data = BlockData[block];
  return !data || data.solid !== false;
}

export default class Animal {
  constructor(scene, x, y, typeKey, tileManager) {
    this.scene = scene;
    this.tileManager = tileManager;
    this.typeKey = typeKey;
    this.config = AnimalTypes[typeKey];

    this.sprite = scene.add.image(x, y, this.config.texture);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(7);

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

    this.behaviorTimer = 1000 + Math.random() * 2500;
    this.walking = false;

    this.hurtFlash = 0;
    this.pendingDrops = [];

    this.GRAVITY = 720;
    this.MAX_FALL = 520;
    this.JUMP_SPEED = 320;
  }

  update(delta) {
    if (this.dead) return;

    const dt = delta / 1000;

    if (this.hurtFlash > 0) {
      this.hurtFlash -= dt;
      this.sprite.setTint(0xffaaaa);
      if (this.hurtFlash <= 0) this.sprite.clearTint();
    }

    this.behaviorTimer -= delta;
    if (this.behaviorTimer <= 0) {
      this.pickBehavior();
    }

    if (this.walking) {
      this.vx = this.direction * this.config.speed;
      this.tryJumpAhead();
    } else {
      this.vx = 0;
    }

    if (this.onGround && Math.random() < 0.0012 * delta) {
      this.vy = -this.JUMP_SPEED;
    }

    this.vy += this.GRAVITY * dt;
    if (this.vy > this.MAX_FALL) this.vy = this.MAX_FALL;

    this.moveAxis(dt);

    this.onGround = this.collidesAt(this.x, this.y + 1);

    this.sprite.setPosition(Math.round(this.x), Math.round(this.y));
    this.sprite.setFlipX(this.direction < 0);
  }

  pickBehavior() {
    const r = Math.random();
    if (this.walking) {
      this.walking = false;
      this.behaviorTimer = 800 + Math.random() * 2200;
    } else if (r < 0.62) {
      this.walking = true;
      this.direction = Math.random() < 0.5 ? -1 : 1;
      this.behaviorTimer = 1200 + Math.random() * 3200;
    } else {
      this.walking = false;
      this.behaviorTimer = 600 + Math.random() * 1800;
    }
  }

  tryJumpAhead() {
    if (!this.onGround) return;

    const checkX = this.x + this.direction * (this.width / 2 + 4);
    const checkY = this.y - 2;
    const tx = Math.floor(checkX / TILE_SIZE);
    const ty = Math.floor(checkY / TILE_SIZE);

    if (isSolid(this.tileManager.getBlock(tx, ty))) {
      this.vy = -this.JUMP_SPEED;
    }
  }

  takeDamage(amount, knockDir) {
    if (this.dead) return;
    this.health -= amount;
    this.hurtFlash = 0.2;
    this.vx += knockDir * this.config.knockback;
    this.vy -= 130;
    if (this.health <= 0) {
      this.queueDrops();
      this.die();
    }
  }

  queueDrops() {
    const { x, y } = this;
    if (this.typeKey === 'SHEEP') {
      this.pendingDrops.push({ type: ItemTypes.RAW_MUTTON, x, y });
      if (Math.random() < 0.55) {
        this.pendingDrops.push({ type: BlockTypes.WOOL, x: x + (Math.random() < 0.5 ? -6 : 6), y: y - 4 });
      }
    } else if (this.typeKey === 'COW') {
      this.pendingDrops.push({ type: ItemTypes.RAW_STEAK, x, y });
      if (Math.random() < 0.35) {
        this.pendingDrops.push({ type: ItemTypes.RAW_STEAK, x: x + 8, y: y - 2 });
      }
    } else {
      this.pendingDrops.push({ type: ItemTypes.RAW_PORKCHOP, x, y });
    }
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
        this.direction *= -1;
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
          const bottom = newY - 0.01;
          const tBottomY = Math.floor(bottom / TILE_SIZE);
          const pLeft = Math.floor((this.x - this.width / 2) / TILE_SIZE);
          const pRight = Math.floor((this.x + this.width / 2 - 0.01) / TILE_SIZE);
          let onlySlabs = true;
          let hasAnySlab = false;
          for (let tx = pLeft; tx <= pRight; tx++) {
            const block = this.tileManager.getBlock(tx, tBottomY);
            if (block !== BlockTypes.AIR) {
              const data = BlockData[block];
              if (data && data.solid !== false) {
                if (data.halfHeight) hasAnySlab = true;
                else onlySlabs = false;
              }
            }
          }
          if (onlySlabs && hasAnySlab) {
            this.y = tBottomY * TILE_SIZE + TILE_SIZE / 2;
          } else {
            this.y = Math.floor(newY / TILE_SIZE) * TILE_SIZE;
          }
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
        const block = this.tileManager.getBlock(tx, ty);
        if (block !== BlockTypes.AIR) {
          const data = BlockData[block];
          if (!data || data.solid !== false) {
            if (data && data.halfHeight) {
              const slabTop = ty * TILE_SIZE + TILE_SIZE / 2;
              if (bottom < slabTop) continue;
            }
            return true;
          }
        }
      }
    }
    return false;
  }
}

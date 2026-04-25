import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';
import { getItemTexture, getToolData } from '../data/items.js';

export default class Player {
  constructor(scene, x, y, tileManager, inventory, options = {}) {
    this.scene = scene;
    this.tileManager = tileManager;
    this.inventory = inventory;

    this.sprite = scene.add.image(x, y, 'player');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(10);

    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.width = 22;
    this.height = 54;

    this.onGround = false;

    this.health = 100;
    this.maxHealth = 100;
    this.dead = false;
    this.invincibleTimer = 0;
    this.fallStartY = null;
    this.creativeMode = options.creativeMode === true;
    this.isFlying = false;
    this.flightTapTimer = 0;
    this.flightTapWindow = 280;

    this.spawnX = x;
    this.spawnY = y;

    this.MOVE_SPEED = 220;
    this.JUMP_SPEED = 400;
    this.GRAVITY = 720;
    this.MAX_FALL = 640;

    this.keys = scene.input.keyboard.addKeys({
      left: 'A',
      right: 'D',
      jump: 'SPACE',
      down: 'SHIFT',
    });

    this.jumpPressed = false;
    this.currentTexture = 'player';

    this.heldItem = scene.add.image(x, y, 'player');
    this.heldItem.setDisplaySize(20, 20);
    this.heldItem.setOrigin(0.5, 0.5);
    this.heldItem.setDepth(11);
    this.heldItem.setVisible(false);
    this.heldItemType = null;
    this.HELD_OFFSET = 20;

    this.swinging = false;
    this.swingTimer = 0;
    this.swingDuration = 300;
    this.swingDirection = 1;
    this.swingStartAngle = 0;
    this.swingEndAngle = 0;
    this.swingTrailAlpha = 0;

    this.swingTrail = scene.add.graphics();
    this.swingTrail.setDepth(9);
  }

  update(delta) {
    if (this.dead) return;

    const dt = delta / 1000;
    if (this.flightTapTimer > 0) this.flightTapTimer -= delta;

    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
      this.sprite.setAlpha(Math.sin(this.invincibleTimer * 10) > 0 ? 1 : 0.3);
      if (this.invincibleTimer <= 0) this.sprite.setAlpha(1);
    }

    this.vx = 0;
    const justPressedJump = this.keys.jump.isDown && !this.jumpPressed;
    if (this.creativeMode && justPressedJump) {
      if (this.flightTapTimer > 0) {
        this.isFlying = !this.isFlying;
        this.flightTapTimer = 0;
        this.vy = 0;
        this.fallStartY = null;
      } else {
        this.flightTapTimer = this.flightTapWindow;
      }
    }

    if (!this.inventory.isOpen) {
      if (this.keys.left.isDown) this.vx = -this.MOVE_SPEED;
      if (this.keys.right.isDown) this.vx = this.MOVE_SPEED;

      if (this.creativeMode && this.isFlying) {
        this.vy = 0;
        if (this.keys.jump.isDown) this.vy = -this.MOVE_SPEED;
        else if (this.keys.down.isDown) this.vy = this.MOVE_SPEED;
      } else if (this.keys.jump.isDown && this.onGround && !this.jumpPressed) {
        this.vy = -this.JUMP_SPEED;
      }
    }
    this.jumpPressed = this.keys.jump.isDown;

    if (!(this.creativeMode && this.isFlying)) {
      this.vy += this.GRAVITY * dt;
      if (this.vy > this.MAX_FALL) this.vy = this.MAX_FALL;
    }

    const wasOnGround = this.onGround;

    if (!wasOnGround && this.fallStartY === null) {
      this.fallStartY = this.y;
    }

    this.moveAxis(dt);

    this.onGround = (this.creativeMode && this.isFlying) ? false : this.collidesAt(this.x, this.y + 1);

      if (!this.creativeMode && this.onGround && !wasOnGround && this.fallStartY !== null) {
      const fallDist = (this.y - this.fallStartY) / TILE_SIZE;
      if (fallDist > 6) {
        const damage = Math.floor((fallDist - 6) * 7);
        this.takeDamage(damage);
      }
      this.fallStartY = null;
    }

      if (this.onGround || (this.creativeMode && this.isFlying)) {
      this.fallStartY = null;
    }

    this.sprite.setPosition(Math.round(this.x), Math.round(this.y));

    if (this.vx !== 0) {
      if (this.currentTexture !== 'player_side') {
        this.sprite.setTexture('player_side');
        this.currentTexture = 'player_side';
      }
      this.sprite.setFlipX(this.vx < 0);
    } else {
      if (this.currentTexture !== 'player') {
        this.sprite.setTexture('player');
        this.currentTexture = 'player';
        this.sprite.setFlipX(false);
      }
    }

    if (this.swinging) {
      this.swingTimer += delta;
      if (this.swingTimer >= this.swingDuration) {
        this.swinging = false;
        this.swingTimer = 0;
      }
    }

    if (this.swingTrailAlpha > 0 && !this.swinging) {
      this.swingTrailAlpha -= delta / 150;
      if (this.swingTrailAlpha <= 0) {
        this.swingTrailAlpha = 0;
        this.swingTrail.clear();
      }
    }

    this.updateHeldItem();
  }

  takeDamage(amount) {
    if (this.creativeMode) return;
    if (this.invincibleTimer > 0 || this.dead) return;
    this.health = Math.max(0, this.health - amount);
    this.invincibleTimer = 1;
    this.inventory.dirty = true;
    if (this.health <= 0) this.die();
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.inventory.dirty = true;
  }

  die() {
    this.dead = true;
    this.sprite.setAlpha(0.3);
    this.heldItem.setVisible(false);

    this.scene.time.delayedCall(1500, () => {
      this.respawn();
    });
  }

  respawn() {
    this.health = this.maxHealth;
    this.dead = false;
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.fallStartY = null;
    this.invincibleTimer = 2;
    this.sprite.setAlpha(1);
    this.inventory.dirty = true;
  }

  startSwing() {
    if (this.swinging) return;
    this.swinging = true;
    this.swingTimer = 0;

    const pointer = this.scene.input.activePointer;
    const cam = this.scene.cameras.main;
    const swingWorld = cam.getWorldPoint(pointer.x, pointer.y);
    this.swingDirection = swingWorld.x >= this.x ? 1 : -1;

    if (this.swingDirection > 0) {
      this.swingStartAngle = -Math.PI * 0.78;
      this.swingEndAngle = Math.PI * 0.22;
    } else {
      this.swingStartAngle = Math.PI + Math.PI * 0.78;
      this.swingEndAngle = Math.PI - Math.PI * 0.22;
    }

    this.swingTrailAlpha = 0.45;
  }

  updateHeldItem() {
    const selected = this.inventory.getSelectedItem();

    if (!selected || this.inventory.isOpen) {
      this.heldItem.setVisible(false);
      this.heldItemType = null;
      this.swingTrail.clear();
      return;
    }

    if (this.heldItemType !== selected.type) {
      this.heldItemType = selected.type;
      this.heldItem.setTexture(getItemTexture(selected.type));
      const isTool = getToolData(selected.type) !== null;
      const size = isTool ? TILE_SIZE : 20;
      this.heldItem.setDisplaySize(size, size);
    }

    const handY = this.y - this.height * 0.45;

    if (this.swinging) {
      const t = Math.min(this.swingTimer / this.swingDuration, 1);
      const eased = 1 - (1 - t) * (1 - t);
      const angle = this.swingStartAngle + (this.swingEndAngle - this.swingStartAngle) * eased;
      const swingOffset = this.HELD_OFFSET + 6;

      const hx = this.x + Math.cos(angle) * swingOffset;
      const hy = handY + Math.sin(angle) * swingOffset;

      this.heldItem.setPosition(Math.round(hx), Math.round(hy));
      this.heldItem.setRotation(angle);
      this.heldItem.setFlipY(this.swingDirection < 0);
      this.heldItem.setVisible(true);

      this.drawSwingTrail(handY, eased);
    } else {
      const pointer = this.scene.input.activePointer;
      const cam = this.scene.cameras.main;
      const wp = cam.getWorldPoint(pointer.x, pointer.y);
      const worldX = wp.x;
      const worldY = wp.y;

      const angle = Math.atan2(worldY - handY, worldX - this.x);

      const hx = this.x + Math.cos(angle) * this.HELD_OFFSET;
      const hy = handY + Math.sin(angle) * this.HELD_OFFSET;

      this.heldItem.setPosition(Math.round(hx), Math.round(hy));
      this.heldItem.setRotation(angle);
      this.heldItem.setFlipY(worldX < this.x);
      this.heldItem.setVisible(true);

      if (this.swingTrailAlpha > 0) {
        this.drawSwingTrail(handY, 1);
      }
    }
  }

  drawSwingTrail(handY, progress) {
    this.swingTrail.clear();
    if (this.swingTrailAlpha <= 0) return;

    const trailRadius = this.HELD_OFFSET + 10;
    const cx = this.x;
    const cy = handY;

    const currentAngle = this.swingStartAngle + (this.swingEndAngle - this.swingStartAngle) * progress;
    const arcSpan = (this.swingEndAngle - this.swingStartAngle);
    const trailStart = currentAngle - arcSpan * Math.min(progress, 0.6);

    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const t0 = i / steps;
      const t1 = (i + 1) / steps;
      const a0 = trailStart + (currentAngle - trailStart) * t0;
      const a1 = trailStart + (currentAngle - trailStart) * t1;
      const alpha = this.swingTrailAlpha * (t1 * 0.8);

      const innerR = trailRadius - 4;
      const outerR = trailRadius + 4;

      this.swingTrail.fillStyle(0xffffff, alpha);
      this.swingTrail.beginPath();
      this.swingTrail.moveTo(cx + Math.cos(a0) * innerR, cy + Math.sin(a0) * innerR);
      this.swingTrail.lineTo(cx + Math.cos(a0) * outerR, cy + Math.sin(a0) * outerR);
      this.swingTrail.lineTo(cx + Math.cos(a1) * outerR, cy + Math.sin(a1) * outerR);
      this.swingTrail.lineTo(cx + Math.cos(a1) * innerR, cy + Math.sin(a1) * innerR);
      this.swingTrail.closePath();
      this.swingTrail.fillPath();
    }
  }

  moveAxis(dt) {
    const dx = this.vx * dt;
    if (dx !== 0) {
      const newX = this.x + dx;
      if ((this.creativeMode && this.isFlying) || !this.collidesAt(newX, this.y)) {
        this.x = newX;
      } else {
        if (dx > 0) {
          const col = Math.floor((newX + this.width / 2) / TILE_SIZE);
          this.x = col * TILE_SIZE - this.width / 2 - 0.01;
        } else {
          const col = Math.floor((newX - this.width / 2) / TILE_SIZE);
          this.x = (col + 1) * TILE_SIZE + this.width / 2 + 0.01;
        }
        this.vx = 0;
      }
    }

    const dy = this.vy * dt;
    if (dy !== 0) {
      const newY = this.y + dy;
      if ((this.creativeMode && this.isFlying) || !this.collidesAt(this.x, newY)) {
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
                if (data.halfHeight) {
                  hasAnySlab = true;
                } else {
                  onlySlabs = false;
                }
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
          this.y =
            (Math.floor(headY / TILE_SIZE) + 1) * TILE_SIZE +
            this.height +
            0.01;
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

  getTileX() {
    return Math.floor(this.x / TILE_SIZE);
  }

  getTileY() {
    return Math.floor((this.y - this.height / 2) / TILE_SIZE);
  }
}

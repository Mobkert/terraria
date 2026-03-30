import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';
import { getItemTexture, getToolData } from '../data/items.js';

export default class Player {
  constructor(scene, x, y, tileManager, inventory) {
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
    });

    this.jumpPressed = false;

    this.heldItem = scene.add.image(x, y, 'player');
    this.heldItem.setDisplaySize(20, 20);
    this.heldItem.setOrigin(0.5, 0.5);
    this.heldItem.setDepth(11);
    this.heldItem.setVisible(false);
    this.heldItemType = null;
    this.HELD_OFFSET = 20;
  }

  update(delta) {
    if (this.dead) return;

    const dt = delta / 1000;

    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
      this.sprite.setAlpha(Math.sin(this.invincibleTimer * 10) > 0 ? 1 : 0.3);
      if (this.invincibleTimer <= 0) this.sprite.setAlpha(1);
    }

    this.vx = 0;
    if (!this.inventory.isOpen) {
      if (this.keys.left.isDown) this.vx = -this.MOVE_SPEED;
      if (this.keys.right.isDown) this.vx = this.MOVE_SPEED;

      if (this.keys.jump.isDown && this.onGround && !this.jumpPressed) {
        this.vy = -this.JUMP_SPEED;
      }
    }
    this.jumpPressed = this.keys.jump.isDown;

    this.vy += this.GRAVITY * dt;
    if (this.vy > this.MAX_FALL) this.vy = this.MAX_FALL;

    const wasOnGround = this.onGround;

    if (!wasOnGround && this.fallStartY === null) {
      this.fallStartY = this.y;
    }

    this.moveAxis(dt);

    this.onGround = this.collidesAt(this.x, this.y + 1);

    if (this.onGround && !wasOnGround && this.fallStartY !== null) {
      const fallDist = (this.y - this.fallStartY) / TILE_SIZE;
      if (fallDist > 3) {
        const damage = Math.floor((fallDist - 3) * 10);
        this.takeDamage(damage);
      }
      this.fallStartY = null;
    }

    if (this.onGround) {
      this.fallStartY = null;
    }

    this.sprite.setPosition(Math.round(this.x), Math.round(this.y));

    if (this.vx < 0) this.sprite.setFlipX(true);
    else if (this.vx > 0) this.sprite.setFlipX(false);

    this.updateHeldItem();
  }

  takeDamage(amount) {
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

  updateHeldItem() {
    const selected = this.inventory.getSelectedItem();

    if (!selected || this.inventory.isOpen) {
      this.heldItem.setVisible(false);
      this.heldItemType = null;
      return;
    }

    if (this.heldItemType !== selected.type) {
      this.heldItemType = selected.type;
      this.heldItem.setTexture(getItemTexture(selected.type));
      const isTool = getToolData(selected.type) !== null;
      const size = isTool ? TILE_SIZE : 20;
      this.heldItem.setDisplaySize(size, size);
    }

    const pointer = this.scene.input.activePointer;
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;

    const handY = this.y - this.height * 0.45;
    const angle = Math.atan2(worldY - handY, worldX - this.x);

    const hx = this.x + Math.cos(angle) * this.HELD_OFFSET;
    const hy = handY + Math.sin(angle) * this.HELD_OFFSET;

    this.heldItem.setPosition(Math.round(hx), Math.round(hy));
    this.heldItem.setRotation(angle);
    const facingLeft = worldX < this.x;
    this.heldItem.setFlipY(facingLeft);
    this.heldItem.setVisible(true);
  }

  moveAxis(dt) {
    const dx = this.vx * dt;
    if (dx !== 0) {
      const newX = this.x + dx;
      if (!this.collidesAt(newX, this.y)) {
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
      if (!this.collidesAt(this.x, newY)) {
        this.y = newY;
      } else {
        if (dy > 0) {
          this.y = Math.floor(newY / TILE_SIZE) * TILE_SIZE;
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
          if (!data || data.solid !== false) return true;
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

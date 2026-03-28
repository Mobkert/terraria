import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';

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
  }

  update(delta) {
    const dt = delta / 1000;

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

    this.moveAxis(dt);

    this.onGround = this.collidesAt(this.x, this.y + 1);

    this.sprite.setPosition(Math.round(this.x), Math.round(this.y));

    if (this.vx < 0) this.sprite.setFlipX(true);
    else if (this.vx > 0) this.sprite.setFlipX(false);
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

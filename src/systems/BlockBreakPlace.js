import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';
import DroppedItem from '../entities/DroppedItem.js';

export default class BlockBreakPlace {
  constructor(scene, tileManager, player, inventory) {
    this.scene = scene;
    this.tileManager = tileManager;
    this.player = player;
    this.inventory = inventory;

    this.REACH = 6;

    this.breakTarget = null;
    this.breakProgress = 0;
    this.breakOverlay = null;

    this.cursorHighlight = scene.add.graphics();
    this.cursorHighlight.setDepth(15);

    this.droppedItems = [];

    this.placeCooldown = 0;
    this.PLACE_DELAY = 200;

    scene.input.mouse.disableContextMenu();
  }

  update(delta) {
    const pointer = this.scene.input.activePointer;
    const worldX = pointer.worldX;
    const worldY = pointer.worldY;
    const tileX = Math.floor(worldX / TILE_SIZE);
    const tileY = Math.floor(worldY / TILE_SIZE);

    const inRange = this.isInRange(tileX, tileY);

    this.drawCursorHighlight(tileX, tileY, inRange);

    if (pointer.leftButtonDown() && inRange) {
      this.handleBreaking(tileX, tileY, delta);
    } else {
      this.resetBreaking();
    }

    if (this.placeCooldown > 0) this.placeCooldown -= delta;

    if (pointer.rightButtonDown() && inRange && this.placeCooldown <= 0) {
      this.handlePlacing(tileX, tileY);
    }

    this.updateDroppedItems(delta);
  }

  isInRange(tileX, tileY) {
    const px = this.player.x;
    const py = this.player.y - this.player.height / 2;
    const tx = tileX * TILE_SIZE + TILE_SIZE / 2;
    const ty = tileY * TILE_SIZE + TILE_SIZE / 2;
    const dx = tx - px;
    const dy = ty - py;
    return Math.sqrt(dx * dx + dy * dy) <= this.REACH * TILE_SIZE;
  }

  drawCursorHighlight(tileX, tileY, inRange) {
    const g = this.cursorHighlight;
    g.clear();
    if (!inRange) return;

    const x = tileX * TILE_SIZE;
    const y = tileY * TILE_SIZE;
    const blockType = this.tileManager.getBlock(tileX, tileY);

    if (blockType !== BlockTypes.AIR) {
      g.lineStyle(2, 0xffffff, 0.6);
    } else {
      g.lineStyle(1, 0xffffff, 0.25);
    }
    g.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
  }

  handleBreaking(tileX, tileY, delta) {
    const blockType = this.tileManager.getBlock(tileX, tileY);
    if (blockType === BlockTypes.AIR) {
      this.resetBreaking();
      return;
    }

    if (
      !this.breakTarget ||
      this.breakTarget.x !== tileX ||
      this.breakTarget.y !== tileY
    ) {
      this.resetBreaking();
      this.breakTarget = { x: tileX, y: tileY };
      this.breakProgress = 0;
    }

    const blockData = BlockData[blockType];
    const breakTime = blockData.hardness * 0.5;
    const dt = delta / 1000;
    this.breakProgress += dt / breakTime;

    this.drawBreakOverlay(tileX, tileY);

    if (this.breakProgress >= 1) {
      this.breakBlock(tileX, tileY, blockType);
    }
  }

  drawBreakOverlay(tileX, tileY) {
    if (!this.breakOverlay) {
      this.breakOverlay = this.scene.add.graphics();
      this.breakOverlay.setDepth(14);
    }

    this.breakOverlay.clear();
    const x = tileX * TILE_SIZE;
    const y = tileY * TILE_SIZE;
    const alpha = Math.min(this.breakProgress, 1) * 0.55;

    this.breakOverlay.fillStyle(0x000000, alpha);
    this.breakOverlay.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    const p = this.breakProgress;
    if (p > 0.25) {
      this.breakOverlay.lineStyle(1, 0x000000, Math.min(p, 1) * 0.7);
      this.breakOverlay.beginPath();
      this.breakOverlay.moveTo(x + TILE_SIZE * 0.5, y);
      this.breakOverlay.lineTo(x + TILE_SIZE * 0.35, y + TILE_SIZE * 0.5);
      this.breakOverlay.lineTo(x + TILE_SIZE * 0.55, y + TILE_SIZE);
      this.breakOverlay.strokePath();
    }
    if (p > 0.5) {
      this.breakOverlay.beginPath();
      this.breakOverlay.moveTo(x, y + TILE_SIZE * 0.3);
      this.breakOverlay.lineTo(x + TILE_SIZE * 0.5, y + TILE_SIZE * 0.45);
      this.breakOverlay.lineTo(x + TILE_SIZE, y + TILE_SIZE * 0.65);
      this.breakOverlay.strokePath();
    }
  }

  resetBreaking() {
    this.breakTarget = null;
    this.breakProgress = 0;
    if (this.breakOverlay) {
      this.breakOverlay.clear();
    }
  }

  breakBlock(tileX, tileY, blockType) {
    this.tileManager.setBlock(tileX, tileY, BlockTypes.AIR);
    this.resetBreaking();

    const blockData = BlockData[blockType];
    const dropType =
      blockData.drops !== undefined ? blockData.drops : blockType;

    if (dropType !== BlockTypes.AIR && dropType !== 0) {
      const dropX = tileX * TILE_SIZE + TILE_SIZE / 2;
      const dropY = tileY * TILE_SIZE + TILE_SIZE / 2;
      const item = new DroppedItem(
        this.scene,
        dropX,
        dropY,
        dropType,
        this.tileManager,
      );
      this.droppedItems.push(item);
    }
  }

  handlePlacing(tileX, tileY) {
    const selected = this.inventory.getSelectedItem();
    if (!selected || !this.inventory.isBlock(selected.type)) return;

    if (this.tileManager.getBlock(tileX, tileY) !== BlockTypes.AIR) return;

    if (!this.hasAdjacentBlock(tileX, tileY)) return;

    if (this.overlapsPlayer(tileX, tileY)) return;

    this.tileManager.setBlock(tileX, tileY, selected.type);
    this.inventory.consumeSelected(1);
    this.placeCooldown = this.PLACE_DELAY;
  }

  hasAdjacentBlock(x, y) {
    return (
      this.tileManager.getBlock(x - 1, y) !== BlockTypes.AIR ||
      this.tileManager.getBlock(x + 1, y) !== BlockTypes.AIR ||
      this.tileManager.getBlock(x, y - 1) !== BlockTypes.AIR ||
      this.tileManager.getBlock(x, y + 1) !== BlockTypes.AIR
    );
  }

  overlapsPlayer(tileX, tileY) {
    const tl = tileX * TILE_SIZE;
    const tr = tl + TILE_SIZE;
    const tt = tileY * TILE_SIZE;
    const tb = tt + TILE_SIZE;

    const pl = this.player.x - this.player.width / 2;
    const pr = this.player.x + this.player.width / 2;
    const pt = this.player.y - this.player.height;
    const pb = this.player.y;

    return !(tr <= pl || tl >= pr || tb <= pt || tt >= pb);
  }

  updateDroppedItems(delta) {
    for (let i = this.droppedItems.length - 1; i >= 0; i--) {
      const item = this.droppedItems[i];
      const pickedUp = item.update(delta, this.player);

      if (pickedUp) {
        this.inventory.addItem(item.blockType, 1);
        this.droppedItems.splice(i, 1);
      } else if (item.collected) {
        this.droppedItems.splice(i, 1);
      }
    }
  }
}

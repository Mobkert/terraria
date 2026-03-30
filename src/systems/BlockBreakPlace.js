import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';
import { getToolData, getConsumableData } from '../data/items.js';
import DroppedItem from '../entities/DroppedItem.js';

export default class BlockBreakPlace {
  constructor(scene, tileManager, player, inventory, chestManager, furnaceManager) {
    this.scene = scene;
    this.tileManager = tileManager;
    this.player = player;
    this.inventory = inventory;
    this.chestManager = chestManager;
    this.furnaceManager = furnaceManager;

    this.REACH = 6;

    this.breakTarget = null;
    this.breakProgress = 0;
    this.breakOverlay = null;

    this.cursorHighlight = scene.add.graphics();
    this.cursorHighlight.setDepth(15);

    this.droppedItems = [];

    this.placeCooldown = 0;
    this.PLACE_DELAY = 200;

    this.consumeProgress = 0;
    this.CONSUME_TIME = 2000;
    this.consumeOverlay = null;

    scene.input.mouse.disableContextMenu();
  }

  update(delta) {
    this.updateDroppedItems(delta);

    if (this.inventory.isOpen) {
      this.resetBreaking();
      this.cursorHighlight.clear();
      return;
    }

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

    if (pointer.rightButtonDown() && this.placeCooldown <= 0) {
      const selected = this.inventory.getSelectedItem();
      const consumable = selected ? getConsumableData(selected.type) : null;

      if (consumable && this.player.health < this.player.maxHealth) {
        this.handleConsuming(delta, consumable);
      } else {
        this.resetConsuming();
        if (inRange) {
          const targetBlock = this.tileManager.getBlock(tileX, tileY);
          const targetData = BlockData[targetBlock];
          if (targetData && targetData.interactable) {
            this.handleInteract(targetBlock, tileX, tileY);
            this.placeCooldown = this.PLACE_DELAY;
          } else {
            this.handlePlacing(tileX, tileY);
          }
        }
      }
    } else {
      this.resetConsuming();
    }
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
    const held = this.inventory.getSelectedItem();
    const tool = held ? getToolData(held.type) : null;

    if (blockData.minTier) {
      const tier = (tool && tool.toolType === blockData.tool) ? (tool.toolTier || 0) : 0;
      if (tier < blockData.minTier) {
        this.resetBreaking();
        return;
      }
    }

    const baseTime = blockData.hardness * 0.5;

    let speedMult = 1;
    if (tool && tool.toolType === blockData.tool) {
      speedMult = tool.toolSpeed;
    }

    const breakTime = baseTime / speedMult;
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

    const dropX = tileX * TILE_SIZE + TILE_SIZE / 2;
    const dropY = tileY * TILE_SIZE + TILE_SIZE / 2;

    if (blockType === BlockTypes.CHEST && this.chestManager) {
      const chestSlots = this.chestManager.getChest(tileX, tileY);
      for (const slot of chestSlots) {
        if (slot) {
          for (let i = 0; i < slot.count; i++) {
            const item = new DroppedItem(
              this.scene,
              dropX + (Math.random() - 0.5) * 10,
              dropY,
              slot.type,
              this.tileManager,
            );
            this.droppedItems.push(item);
          }
        }
      }
      this.chestManager.removeChest(tileX, tileY);
    }

    if (blockType === BlockTypes.FURNACE && this.furnaceManager) {
      const f = this.furnaceManager.getFurnace(tileX, tileY);
      for (const slotName of ['inputSlot', 'fuelSlot', 'outputSlot']) {
        const slot = f[slotName];
        if (slot) {
          for (let i = 0; i < slot.count; i++) {
            this.droppedItems.push(new DroppedItem(
              this.scene,
              dropX + (Math.random() - 0.5) * 10,
              dropY,
              slot.type,
              this.tileManager,
            ));
          }
        }
      }
      this.furnaceManager.removeFurnace(tileX, tileY);
    }

    const blockData = BlockData[blockType];
    const dropType =
      blockData.drops !== undefined ? blockData.drops : blockType;

    if (dropType !== BlockTypes.AIR && dropType !== 0) {
      const item = new DroppedItem(
        this.scene,
        dropX,
        dropY,
        dropType,
        this.tileManager,
      );
      this.droppedItems.push(item);
    }

    if (blockData.extraDrop && Math.random() < (blockData.extraDropChance || 0)) {
      const extra = new DroppedItem(
        this.scene,
        dropX + (Math.random() - 0.5) * 8,
        dropY,
        blockData.extraDrop,
        this.tileManager,
      );
      this.droppedItems.push(extra);
    }
  }

  handlePlacing(tileX, tileY) {
    const selected = this.inventory.getSelectedItem();
    if (!selected || !this.inventory.isBlock(selected.type)) return;

    if (this.tileManager.getBlock(tileX, tileY) !== BlockTypes.AIR) return;

    if (!this.hasAdjacentBlock(tileX, tileY)) return;

    const placingData = BlockData[selected.type];
    const isSolid = !placingData || placingData.solid !== false;
    if (isSolid && this.overlapsPlayer(tileX, tileY)) return;

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

  handleConsuming(delta, consumable) {
    this.consumeProgress += delta;
    this.drawConsumeBar();

    if (this.consumeProgress >= this.CONSUME_TIME) {
      this.player.heal(consumable.healAmount);
      this.inventory.consumeSelected(1);
      this.resetConsuming();
    }
  }

  resetConsuming() {
    if (this.consumeProgress > 0) {
      this.consumeProgress = 0;
      if (this.consumeOverlay) this.consumeOverlay.clear();
    }
  }

  drawConsumeBar() {
    if (!this.consumeOverlay) {
      this.consumeOverlay = this.scene.add.graphics();
      this.consumeOverlay.setScrollFactor(0);
      this.consumeOverlay.setDepth(199);
    }
    this.consumeOverlay.clear();

    const cam = this.scene.cameras.main;
    const barW = 80;
    const barH = 8;
    const barX = cam.width / 2 - barW / 2;
    const barY = cam.height / 2 + 40;
    const ratio = this.consumeProgress / this.CONSUME_TIME;

    this.consumeOverlay.fillStyle(0x000000, 0.6);
    this.consumeOverlay.fillRect(barX, barY, barW, barH);
    this.consumeOverlay.fillStyle(0x44cc44, 1);
    this.consumeOverlay.fillRect(barX + 1, barY + 1, (barW - 2) * ratio, barH - 2);
    this.consumeOverlay.lineStyle(1, 0x888888, 1);
    this.consumeOverlay.strokeRect(barX, barY, barW, barH);
  }

  handleInteract(blockType, tileX, tileY) {
    if (blockType === BlockTypes.WORKBENCH) {
      this.inventory.craftingRequest = 'workbench';
    } else if (blockType === BlockTypes.CHEST) {
      this.inventory.chestRequest = { x: tileX, y: tileY };
    } else if (blockType === BlockTypes.FURNACE) {
      this.inventory.furnaceRequest = { x: tileX, y: tileY };
    }
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

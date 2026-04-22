import { getItemName, getItemTexture } from '../data/items.js';
import Crafting from '../systems/Crafting.js';

const ROW_H = 40;
const ICON_SIZE = 28;
const MAX_VISIBLE = 7;

export default class CraftingUI {
  constructor(scene, inventory) {
    this.scene = scene;
    this.inventory = inventory;
    this.hasWorkbench = false;

    this.container = scene.add.container(0, 0);
    this.container.setDepth(310);
    this.container.setVisible(false);

    this.recipeRows = [];
    this.scrollOffset = 0;
    this.totalRecipes = 0;
    this.build();

    this.scrollHandler = (pointer, gameObjects, dx, dy) => {
      if (!this.container.visible) return;
      const px = pointer.x;
      const py = pointer.y;
      if (px >= this.panelX && px <= this.panelX + this.panelW &&
          py >= this.panelY && py <= this.panelY + this.panelH) {
        if (dy > 0) this.scroll(1);
        else if (dy < 0) this.scroll(-1);
      }
    };
    this.scene.input.on('wheel', this.scrollHandler);
  }

  build() {
    const sw = this.scene.cameras.main.width;
    const sh = this.scene.cameras.main.height;

    this.panelW = 210;
    this.panelH = 30 + MAX_VISIBLE * ROW_H + 30;
    this.panelX = sw / 2 + 246;
    this.panelY = (sh - this.panelH) / 2;

    this.bg = this.scene.add.graphics();
    this.bg.fillStyle(0x1a1a2e, 0.92);
    this.bg.fillRoundedRect(this.panelX, this.panelY, this.panelW, this.panelH, 8);
    this.bg.lineStyle(2, 0x444466, 1);
    this.bg.strokeRoundedRect(this.panelX, this.panelY, this.panelW, this.panelH, 8);
    this.container.add(this.bg);

    const title = this.scene.add.text(
      this.panelX + this.panelW / 2,
      this.panelY + 8,
      'Crafting',
      { fontSize: '13px', color: '#aaaacc' },
    );
    title.setOrigin(0.5, 0);
    this.container.add(title);

    this.listY = this.panelY + 30;

    for (let i = 0; i < MAX_VISIBLE; i++) {
      const y = this.listY + i * ROW_H;
      const row = this.createRow(y);
      this.recipeRows.push(row);
    }

    const arrowY = this.listY + MAX_VISIBLE * ROW_H + 6;
    const centerX = this.panelX + this.panelW / 2;

    this.upBtn = this.scene.add.text(centerX - 30, arrowY, '\u25B2', {
      fontSize: '14px', color: '#666688',
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
    this.upBtn.on('pointerdown', () => this.scroll(-1));
    this.upBtn.on('pointerover', () => this.upBtn.setColor('#aaaacc'));
    this.upBtn.on('pointerout', () => this.upBtn.setColor('#666688'));
    this.container.add(this.upBtn);

    this.scrollInfo = this.scene.add.text(centerX, arrowY, '', {
      fontSize: '10px', color: '#666688',
    }).setOrigin(0.5, 0);
    this.container.add(this.scrollInfo);

    this.downBtn = this.scene.add.text(centerX + 30, arrowY, '\u25BC', {
      fontSize: '14px', color: '#666688',
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
    this.downBtn.on('pointerdown', () => this.scroll(1));
    this.downBtn.on('pointerover', () => this.downBtn.setColor('#aaaacc'));
    this.downBtn.on('pointerout', () => this.downBtn.setColor('#666688'));
    this.container.add(this.downBtn);
  }

  createRow(y) {
    const x = this.panelX + 8;
    const w = this.panelW - 16;

    const bg = this.scene.add.rectangle(x + w / 2, y + ROW_H / 2, w, ROW_H - 4, 0x2a2a3e, 1);
    bg.setStrokeStyle(1, 0x444466);
    bg.setInteractive({ useHandCursor: true });
    this.container.add(bg);

    const icon = this.scene.add.image(x + 18, y + ROW_H / 2, 'player');
    icon.setDisplaySize(ICON_SIZE, ICON_SIZE);
    this.container.add(icon);

    const label = this.scene.add.text(x + 36, y + 4, '', {
      fontSize: '11px',
      color: '#ffffff',
    });
    this.container.add(label);

    const cost = this.scene.add.text(x + 36, y + 20, '', {
      fontSize: '9px',
      color: '#999999',
    });
    this.container.add(cost);

    bg.on('pointerover', () => bg.setStrokeStyle(1, 0xaaaacc));
    bg.on('pointerout', () => bg.setStrokeStyle(1, 0x444466));

    return { bg, icon, label, cost, recipe: null };
  }

  scroll(dir) {
    const maxOffset = Math.max(0, this.totalRecipes - MAX_VISIBLE);
    this.scrollOffset = Math.max(0, Math.min(maxOffset, this.scrollOffset + dir));
    this.refresh();
  }

  show(hasWorkbench) {
    this.hasWorkbench = hasWorkbench;
    this.scrollOffset = 0;
    this.container.setVisible(true);
    this.refresh();
  }

  hide() {
    this.container.setVisible(false);
  }

  refresh() {
    const available = Crafting.getAvailable(this.inventory, this.hasWorkbench);
    this.totalRecipes = available.length;

    for (let i = 0; i < MAX_VISIBLE; i++) {
      const row = this.recipeRows[i];
      const recipeIdx = this.scrollOffset + i;

      if (recipeIdx < available.length) {
        const recipe = available[recipeIdx];
        row.recipe = recipe;

        row.icon.setTexture(getItemTexture(recipe.result.type));
        row.icon.setDisplaySize(ICON_SIZE, ICON_SIZE);
        row.icon.setVisible(true);

        const name = getItemName(recipe.result.type);
        const count = recipe.result.count > 1 ? ` x${recipe.result.count}` : '';
        row.label.setText(`${name}${count}`);

        const ingredients = recipe.ingredients
          .map((ing) => `${ing.count}x ${getItemName(ing.type)}`)
          .join(', ');
        row.cost.setText(ingredients);

        row.bg.setVisible(true);
        row.bg.removeAllListeners('pointerdown');
        row.bg.on('pointerdown', () => {
          if (Crafting.craft(recipe, this.inventory)) {
            this.inventory.dirty = true;
            this.refresh();
          }
        });
      } else {
        row.recipe = null;
        row.icon.setVisible(false);
        row.label.setText('');
        row.cost.setText('');
        row.bg.setVisible(false);
      }
    }

    const showScroll = this.totalRecipes > MAX_VISIBLE;
    this.upBtn.setVisible(showScroll);
    this.downBtn.setVisible(showScroll);
    this.scrollInfo.setVisible(showScroll);
    if (showScroll) {
      const page = this.scrollOffset + 1;
      const maxPage = this.totalRecipes - MAX_VISIBLE + 1;
      this.scrollInfo.setText(`${page}/${maxPage}`);
    }
  }

  update() {
    if (!this.container.visible) return;
    if (this.inventory.dirty) {
      this.refresh();
    }
  }
}

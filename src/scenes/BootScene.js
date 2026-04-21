import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';
import { ItemTypes } from '../data/items.js';
import { DefaultCustomization } from '../data/customization.js';
import { generatePlayerCanvases } from '../utils/playerRenderer.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.generateBlockTextures();
    this.generatePlayerTexture();
    this.generateItemTextures();
    this.generateEnemyTextures();
    this.generateSkyGradient();
    this.scene.start('LoadingScene');
  }

  generateBlockTextures() {
    const s = TILE_SIZE;

    for (const [id, data] of Object.entries(BlockData)) {
      const canvas = document.createElement('canvas');
      canvas.width = s;
      canvas.height = s;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = colorToCSS(data.color);
      ctx.fillRect(0, 0, s, s);

      if (data.topColor) {
        ctx.fillStyle = colorToCSS(data.topColor);
        ctx.fillRect(0, 0, s, Math.floor(s / 4));
      }

      this.addBlockDetail(ctx, parseInt(id), data, s);

      if (data.solid !== false && parseInt(id) !== BlockTypes.BIRCH_WOOD) this.addBorderShading(ctx, s);

      this.textures.addCanvas(`block_${id}`, canvas);
    }
  }

  addBlockDetail(ctx, id, data, s) {
    switch (id) {
      case BlockTypes.STONE: {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        const spots = [[4,6],[12,3],[22,10],[8,20],[26,24],[16,18],[6,28],[20,5]];
        for (const [x, y] of spots) {
          ctx.fillRect(x, y, 3, 2);
        }
        break;
      }
      case BlockTypes.DEEPSLATE: {
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        for (let i = 0; i < 5; i++) {
          const y = 3 + i * 6;
          ctx.fillRect(0, y, s, 1);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        for (let i = 0; i < 3; i++) {
          const y = 6 + i * 9;
          ctx.fillRect(0, y, s, 1);
        }
        break;
      }
      case BlockTypes.SANDSTONE: {
        ctx.fillStyle = 'rgba(139,107,53,0.3)';
        for (let i = 0; i < 4; i++) {
          const y = 5 + i * 7;
          ctx.fillRect(0, y, s, 1);
        }
        break;
      }
      case BlockTypes.SAND: {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        const dots = [[3,5],[10,2],[20,8],[5,18],[25,22],[14,26],[28,12],[7,12]];
        for (const [x, y] of dots) {
          ctx.fillRect(x, y, 1, 1);
        }
        break;
      }
      case BlockTypes.WOOD: {
        ctx.fillStyle = 'rgba(80,30,10,0.4)';
        for (let i = 0; i < 4; i++) {
          const x = 6 + i * 7;
          ctx.fillRect(x, 0, 1, s);
        }
        ctx.fillStyle = 'rgba(120,70,40,0.2)';
        ctx.fillRect(14, 0, 4, s);
        break;
      }
      case BlockTypes.LEAVES: {
        ctx.fillStyle = 'rgba(20,100,20,0.4)';
        const clusters = [[4,4],[14,6],[24,4],[8,16],[18,14],[28,18],[6,26],[20,24]];
        for (const [x, y] of clusters) {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case BlockTypes.DIRT: {
        ctx.fillStyle = 'rgba(100,60,10,0.2)';
        const specks = [[5,8],[18,4],[10,22],[26,16],[14,12],[3,26],[22,28],[28,6]];
        for (const [x, y] of specks) {
          ctx.fillRect(x, y, 2, 2);
        }
        break;
      }
      case BlockTypes.PLANKS: {
        ctx.fillStyle = 'rgba(80,50,20,0.3)';
        ctx.fillRect(0, 7, s, 1);
        ctx.fillRect(0, 15, s, 1);
        ctx.fillRect(0, 23, s, 1);
        ctx.fillStyle = 'rgba(180,130,80,0.15)';
        ctx.fillRect(0, 8, s, 1);
        ctx.fillRect(0, 16, s, 1);
        ctx.fillRect(0, 24, s, 1);
        break;
      }
      case BlockTypes.WORKBENCH: {
        ctx.fillStyle = 'rgba(60,30,10,0.4)';
        ctx.fillRect(0, 0, s, 3);
        ctx.fillRect(2, 3, 3, s - 3);
        ctx.fillRect(s - 5, 3, 3, s - 3);
        ctx.fillStyle = 'rgba(160,110,60,0.3)';
        ctx.fillRect(0, 0, s, 2);
        break;
      }
      case BlockTypes.CHEST: {
        ctx.fillStyle = 'rgba(120,80,20,0.3)';
        ctx.strokeStyle = 'rgba(80,50,10,0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 4, s - 4, s - 8);
        ctx.fillStyle = 'rgba(255,200,50,0.6)';
        ctx.fillRect(13, 12, 6, 6);
        break;
      }
      case BlockTypes.CACTUS: {
        ctx.fillStyle = 'rgba(20,60,20,0.3)';
        ctx.fillRect(4, 0, 2, s);
        ctx.fillRect(s - 6, 0, 2, s);
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        const spines = [[6,4],[20,8],[8,16],[22,22],[10,28],[24,14]];
        for (const [sx, sy] of spines) {
          ctx.fillRect(sx, sy, 2, 2);
        }
        break;
      }
      case BlockTypes.VINE: {
        ctx.fillStyle = 'rgba(10,80,20,0.5)';
        ctx.fillRect(6, 0, 3, s);
        ctx.fillRect(16, 2, 2, s - 2);
        ctx.fillRect(24, 1, 3, s - 1);
        ctx.fillStyle = 'rgba(30,120,40,0.3)';
        ctx.fillRect(10, 4, 2, 8);
        ctx.fillRect(20, 12, 2, 10);
        break;
      }
      case BlockTypes.COAL_ORE: {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        const stoneSpots = [[4,6],[12,3],[22,10],[8,20],[26,24],[16,18]];
        for (const [x, y] of stoneSpots) ctx.fillRect(x, y, 3, 2);
        ctx.fillStyle = '#222222';
        const oreSpots = [[8,8],[18,14],[10,20],[22,6],[14,24],[24,18]];
        for (const [x, y] of oreSpots) {
          ctx.fillRect(x, y, 4, 3);
          ctx.fillRect(x + 1, y - 1, 2, 1);
        }
        break;
      }
      case BlockTypes.IRON_ORE: {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        const stSpots = [[4,6],[12,3],[22,10],[8,20],[26,24],[16,18]];
        for (const [x, y] of stSpots) ctx.fillRect(x, y, 3, 2);
        ctx.fillStyle = '#cc9966';
        const ironSpots = [[7,10],[20,6],[12,20],[24,16],[16,8],[8,26]];
        for (const [x, y] of ironSpots) {
          ctx.fillRect(x, y, 4, 3);
          ctx.fillRect(x + 1, y - 1, 2, 1);
        }
        break;
      }
      case BlockTypes.FURNACE: {
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(0, 0, s, s);
        ctx.fillStyle = '#555555';
        ctx.fillRect(2, 2, s - 4, s - 4);
        ctx.fillStyle = '#6a6a6a';
        ctx.fillRect(3, 3, s - 6, s - 6);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(s * 0.25, s * 0.4, s * 0.5, s * 0.45);
        ctx.fillStyle = '#cc4400';
        ctx.fillRect(s * 0.3, s * 0.65, s * 0.15, s * 0.12);
        ctx.fillRect(s * 0.55, s * 0.6, s * 0.1, s * 0.15);
        break;
      }
      case BlockTypes.TORCH: {
        ctx.clearRect(0, 0, s, s);
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(s * 0.44, s * 0.35, s * 0.12, s * 0.55);
        ctx.fillStyle = '#FFAA22';
        ctx.beginPath();
        ctx.ellipse(s * 0.5, s * 0.3, s * 0.14, s * 0.18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFDD44';
        ctx.beginPath();
        ctx.ellipse(s * 0.5, s * 0.28, s * 0.08, s * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFAA';
        ctx.beginPath();
        ctx.ellipse(s * 0.5, s * 0.26, s * 0.03, s * 0.05, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case BlockTypes.BIRCH_WOOD: {
        ctx.clearRect(0, 0, s, s);
        ctx.fillStyle = '#e8dcc8';
        ctx.fillRect(s * 0.25, 0, s * 0.5, s);
        ctx.fillStyle = '#d0c4b0';
        ctx.fillRect(s * 0.25, 0, 1, s);
        ctx.fillRect(s * 0.75 - 1, 0, 1, s);
        ctx.fillStyle = '#555555';
        ctx.fillRect(s * 0.28, s * 0.1, s * 0.2, 2);
        ctx.fillRect(s * 0.5, s * 0.25, s * 0.18, 2);
        ctx.fillRect(s * 0.3, s * 0.45, s * 0.15, 2);
        ctx.fillRect(s * 0.48, s * 0.6, s * 0.2, 2);
        ctx.fillRect(s * 0.28, s * 0.78, s * 0.22, 2);
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(s * 0.4, 0, s * 0.08, s);
        break;
      }
      case BlockTypes.BIRCH_LEAVES: {
        ctx.fillStyle = 'rgba(160,80,20,0.4)';
        const clusters = [[4,4],[14,6],[24,4],[8,16],[18,14],[28,18],[6,26],[20,24]];
        for (const [x, y] of clusters) {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(255,200,100,0.2)';
        const highlights = [[10,10],[22,8],[16,22],[8,20]];
        for (const [x, y] of highlights) {
          ctx.fillRect(x, y, 2, 2);
        }
        break;
      }
      case BlockTypes.BIRCH_PLANKS: {
        ctx.fillStyle = 'rgba(160,140,100,0.3)';
        ctx.fillRect(0, 7, s, 1);
        ctx.fillRect(0, 15, s, 1);
        ctx.fillRect(0, 23, s, 1);
        ctx.fillStyle = 'rgba(240,230,200,0.15)';
        ctx.fillRect(0, 8, s, 1);
        ctx.fillRect(0, 16, s, 1);
        ctx.fillRect(0, 24, s, 1);
        break;
      }
      case BlockTypes.BIRCH_GRASS: {
        ctx.fillStyle = 'rgba(100,60,10,0.2)';
        const specks = [[5,8],[18,4],[10,22],[26,16],[14,12],[3,26],[22,28],[28,6]];
        for (const [x, y] of specks) {
          ctx.fillRect(x, y, 2, 2);
        }
        ctx.fillStyle = 'rgba(220,140,40,0.5)';
        const orangeSpots = [[8,2],[20,1],[4,5],[16,4],[28,3],[12,6],[24,5]];
        for (const [x, y] of orangeSpots) {
          ctx.fillRect(x, y, 3, 2);
        }
        break;
      }
    }
  }

  addBorderShading(ctx, s) {
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, s - 1, s, 1);
    ctx.fillRect(s - 1, 0, 1, s);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, 0, s, 1);
    ctx.fillRect(0, 0, 1, s);
  }

  generatePlayerTexture(customization) {
    const config = customization || DefaultCustomization;
    const { front, side } = generatePlayerCanvases(config);

    if (this.textures.exists('player')) this.textures.remove('player');
    if (this.textures.exists('player_side')) this.textures.remove('player_side');

    this.textures.addCanvas('player', front);
    this.textures.addCanvas('player_side', side);
  }

  generateItemTextures() {
    const s = TILE_SIZE;

    this.makeItemTexture(ItemTypes.STICK, (ctx) => {
      ctx.strokeStyle = '#8B5E3C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s * 0.35, s * 0.15);
      ctx.lineTo(s * 0.65, s * 0.85);
      ctx.stroke();
      ctx.strokeStyle = '#6B4226';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s * 0.37, s * 0.15);
      ctx.lineTo(s * 0.67, s * 0.85);
      ctx.stroke();
    });

    this.makeItemTexture(ItemTypes.WOODEN_PICKAXE, (ctx) => {
      this.drawPickC(ctx, s, '#B08860', '#7a5535', '#d4b488', '#9a7040');
    });

    this.makeItemTexture(ItemTypes.WOODEN_AXE, (ctx) => {
      this.drawAxeC(ctx, s, '#B08860', '#7a5535', '#d4b488');
    });

    this.makeItemTexture(ItemTypes.STONE_PICKAXE, (ctx) => {
      this.drawPickC(ctx, s, '#8a8a8a', '#5a5a5a', '#b0b0b0', '#707070');
    });

    this.makeItemTexture(ItemTypes.STONE_AXE, (ctx) => {
      this.drawAxeC(ctx, s, '#8a8a8a', '#5a5a5a', '#b8b8b8');
    });

    this.makeItemTexture(ItemTypes.GRASS_ESSENCE, (ctx) => {
      ctx.fillStyle = 'rgba(50,200,50,0.15)';
      ctx.beginPath(); ctx.ellipse(s * 0.5, s * 0.52, s * 0.4, s * 0.44, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a6a1a';
      ctx.beginPath();
      ctx.moveTo(s * 0.5, s * 0.18);
      ctx.quadraticCurveTo(s * 0.82, s * 0.38, s * 0.78, s * 0.62);
      ctx.quadraticCurveTo(s * 0.72, s * 0.88, s * 0.5, s * 0.9);
      ctx.quadraticCurveTo(s * 0.28, s * 0.88, s * 0.22, s * 0.62);
      ctx.quadraticCurveTo(s * 0.18, s * 0.38, s * 0.5, s * 0.18);
      ctx.fill();
      ctx.fillStyle = '#33aa33';
      ctx.beginPath();
      ctx.moveTo(s * 0.5, s * 0.22);
      ctx.quadraticCurveTo(s * 0.76, s * 0.4, s * 0.72, s * 0.6);
      ctx.quadraticCurveTo(s * 0.68, s * 0.84, s * 0.5, s * 0.86);
      ctx.quadraticCurveTo(s * 0.32, s * 0.84, s * 0.28, s * 0.6);
      ctx.quadraticCurveTo(s * 0.24, s * 0.4, s * 0.5, s * 0.22);
      ctx.fill();
      ctx.fillStyle = '#88ff88';
      ctx.beginPath(); ctx.arc(s * 0.42, s * 0.5, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(s * 0.58, s * 0.62, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(s * 0.5, s * 0.72, 1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(s * 0.38, s * 0.66, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.ellipse(s * 0.4, s * 0.4, 3, 7, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#886633';
      ctx.fillRect(s * 0.44, s * 0.1, s * 0.12, s * 0.1);
      ctx.fillStyle = '#aa8844';
      ctx.fillRect(s * 0.45, s * 0.11, s * 0.1, s * 0.08);
      ctx.fillStyle = '#44aa44';
      ctx.beginPath();
      ctx.moveTo(s * 0.5, s * 0.08);
      ctx.quadraticCurveTo(s * 0.62, s * 0.02, s * 0.66, s * 0.06);
      ctx.quadraticCurveTo(s * 0.6, s * 0.12, s * 0.5, s * 0.12);
      ctx.closePath();
      ctx.fill();
    });

    this.makeItemTexture(ItemTypes.COAL, (ctx) => {
      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.ellipse(s * 0.5, s * 0.52, s * 0.32, s * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(s * 0.3, s * 0.35, s * 0.15, s * 0.12);
      ctx.fillRect(s * 0.55, s * 0.5, s * 0.1, s * 0.1);
    });

    this.makeItemTexture(ItemTypes.RAW_IRON, (ctx) => {
      ctx.fillStyle = '#cc9966';
      ctx.beginPath();
      ctx.moveTo(s * 0.3, s * 0.7);
      ctx.lineTo(s * 0.2, s * 0.4);
      ctx.lineTo(s * 0.45, s * 0.25);
      ctx.lineTo(s * 0.75, s * 0.35);
      ctx.lineTo(s * 0.8, s * 0.6);
      ctx.lineTo(s * 0.55, s * 0.75);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#b8844a';
      ctx.fillRect(s * 0.35, s * 0.4, s * 0.15, s * 0.12);
      ctx.fillRect(s * 0.55, s * 0.5, s * 0.1, s * 0.08);
    });

    this.makeItemTexture(ItemTypes.IRON_INGOT, (ctx) => {
      ctx.fillStyle = '#d4d4d4';
      ctx.beginPath();
      ctx.moveTo(s * 0.15, s * 0.6);
      ctx.lineTo(s * 0.3, s * 0.35);
      ctx.lineTo(s * 0.7, s * 0.35);
      ctx.lineTo(s * 0.85, s * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#aaaaaa';
      ctx.beginPath();
      ctx.moveTo(s * 0.15, s * 0.6);
      ctx.lineTo(s * 0.85, s * 0.6);
      ctx.lineTo(s * 0.75, s * 0.72);
      ctx.lineTo(s * 0.25, s * 0.72);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#eeeeee';
      ctx.fillRect(s * 0.4, s * 0.4, s * 0.12, s * 0.06);
    });

    this.makeItemTexture(ItemTypes.IRON_PICKAXE, (ctx) => {
      this.drawPickC(ctx, s, '#cccccc', '#909090', '#eaeaea', '#aaaaaa');
    });

    this.makeItemTexture(ItemTypes.IRON_AXE, (ctx) => {
      this.drawAxeC(ctx, s, '#cccccc', '#909090', '#eeeeee');
    });

    this.makeItemTexture(ItemTypes.WOODEN_SWORD, (ctx) => {
      this.drawSwordC(ctx, s, '#c4a060', '#9a7a40', '#ddcc88', '#88aa44');
    });

    this.makeItemTexture(ItemTypes.STONE_SWORD, (ctx) => {
      this.drawSwordC(ctx, s, '#999999', '#707070', '#cccccc', '#6688aa');
    });

    this.makeItemTexture(ItemTypes.IRON_SWORD, (ctx) => {
      this.drawSwordC(ctx, s, '#dddddd', '#a8a8a8', '#f8f8f8', '#4488dd');
    });
  }

  drawPickC(ctx, s, headColor, darkColor, lightColor, accentColor) {
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(s * 0.48, s * 0.3, s * 0.04, s * 0.62);
    ctx.fillStyle = '#8B5E3C';
    ctx.fillRect(s * 0.485, s * 0.32, s * 0.03, s * 0.58);
    ctx.fillStyle = '#aa8844';
    for (let i = 0; i < 4; i++) ctx.fillRect(s * 0.46, s * 0.7 + i * 5, s * 0.08, 2);
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(s * 0.06, s * 0.14);
    ctx.quadraticCurveTo(s * 0.06, s * 0.04, s * 0.2, s * 0.06);
    ctx.lineTo(s * 0.48, s * 0.16);
    ctx.lineTo(s * 0.52, s * 0.16);
    ctx.lineTo(s * 0.8, s * 0.06);
    ctx.quadraticCurveTo(s * 0.94, s * 0.04, s * 0.94, s * 0.14);
    ctx.lineTo(s * 0.86, s * 0.22);
    ctx.lineTo(s * 0.14, s * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.moveTo(s * 0.1, s * 0.14);
    ctx.quadraticCurveTo(s * 0.1, s * 0.07, s * 0.22, s * 0.08);
    ctx.lineTo(s * 0.48, s * 0.17);
    ctx.lineTo(s * 0.52, s * 0.17);
    ctx.lineTo(s * 0.78, s * 0.08);
    ctx.quadraticCurveTo(s * 0.9, s * 0.07, s * 0.9, s * 0.14);
    ctx.lineTo(s * 0.84, s * 0.2);
    ctx.lineTo(s * 0.16, s * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.moveTo(s * 0.16, s * 0.12);
    ctx.quadraticCurveTo(s * 0.5, s * 0.08, s * 0.84, s * 0.12);
    ctx.lineTo(s * 0.84, s * 0.14);
    ctx.quadraticCurveTo(s * 0.5, s * 0.1, s * 0.16, s * 0.14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = accentColor;
    ctx.fillRect(s * 0.06, s * 0.12, s * 0.06, s * 0.06);
    ctx.fillRect(s * 0.88, s * 0.12, s * 0.06, s * 0.06);
  }

  drawAxeC(ctx, s, headColor, darkColor, lightColor) {
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(s * 0.38, s * 0.3, s * 0.04, s * 0.62);
    ctx.fillStyle = '#8B5E3C';
    ctx.fillRect(s * 0.385, s * 0.32, s * 0.03, s * 0.58);
    ctx.fillStyle = '#aa8844';
    for (let i = 0; i < 4; i++) ctx.fillRect(s * 0.36, s * 0.7 + i * 5, s * 0.08, 2);
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(s * 0.38, s * 0.06);
    ctx.lineTo(s * 0.38, s * 0.38);
    ctx.quadraticCurveTo(s * 0.7, s * 0.42, s * 0.92, s * 0.28);
    ctx.quadraticCurveTo(s * 0.94, s * 0.2, s * 0.92, s * 0.12);
    ctx.quadraticCurveTo(s * 0.7, s * 0.02, s * 0.38, s * 0.06);
    ctx.fill();
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.moveTo(s * 0.4, s * 0.08);
    ctx.lineTo(s * 0.4, s * 0.36);
    ctx.quadraticCurveTo(s * 0.68, s * 0.4, s * 0.88, s * 0.28);
    ctx.quadraticCurveTo(s * 0.9, s * 0.2, s * 0.88, s * 0.14);
    ctx.quadraticCurveTo(s * 0.68, s * 0.04, s * 0.4, s * 0.08);
    ctx.fill();
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s * 0.88, s * 0.14);
    ctx.quadraticCurveTo(s * 0.92, s * 0.22, s * 0.88, s * 0.3);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(s * 0.44, s * 0.12);
    ctx.quadraticCurveTo(s * 0.6, s * 0.08, s * 0.78, s * 0.18);
    ctx.stroke();
  }

  drawSwordC(ctx, s, bladeColor, darkColor, lightColor, gemColor) {
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(s * 0.46, s * 0.72, s * 0.08, s * 0.2);
    ctx.fillStyle = '#7a5230';
    ctx.fillRect(s * 0.47, s * 0.74, s * 0.06, s * 0.16);
    ctx.fillStyle = '#aa8844';
    ctx.fillRect(s * 0.44, s * 0.76, s * 0.12, s * 0.02);
    ctx.fillRect(s * 0.44, s * 0.82, s * 0.12, s * 0.02);
    ctx.fillRect(s * 0.44, s * 0.88, s * 0.12, s * 0.02);
    ctx.fillStyle = '#777';
    ctx.beginPath(); ctx.arc(s * 0.5, s * 0.94, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.moveTo(s * 0.22, s * 0.7);
    ctx.quadraticCurveTo(s * 0.5, s * 0.64, s * 0.78, s * 0.7);
    ctx.quadraticCurveTo(s * 0.5, s * 0.74, s * 0.22, s * 0.7);
    ctx.fill();
    ctx.fillStyle = gemColor;
    ctx.beginPath(); ctx.arc(s * 0.5, s * 0.7, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(s * 0.4, s * 0.68); ctx.lineTo(s * 0.6, s * 0.68);
    ctx.lineTo(s * 0.56, s * 0.16); ctx.lineTo(s * 0.5, s * 0.02);
    ctx.lineTo(s * 0.44, s * 0.16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = bladeColor;
    ctx.beginPath();
    ctx.moveTo(s * 0.42, s * 0.66); ctx.lineTo(s * 0.58, s * 0.66);
    ctx.lineTo(s * 0.54, s * 0.18); ctx.lineTo(s * 0.5, s * 0.04);
    ctx.lineTo(s * 0.46, s * 0.18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = darkColor;
    ctx.fillRect(s * 0.48, s * 0.2, s * 0.04, s * 0.38);
    ctx.fillStyle = bladeColor;
    ctx.fillRect(s * 0.485, s * 0.22, s * 0.03, s * 0.34);
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.moveTo(s * 0.44, s * 0.58); ctx.lineTo(s * 0.46, s * 0.2);
    ctx.lineTo(s * 0.47, s * 0.2); ctx.lineTo(s * 0.45, s * 0.58);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(s * 0.5, s * 0.06, 1.5, 0, Math.PI * 2); ctx.fill();
  }

  makeItemTexture(itemType, drawFn) {
    const s = TILE_SIZE;
    const canvas = document.createElement('canvas');
    canvas.width = s;
    canvas.height = s;
    const ctx = canvas.getContext('2d');
    drawFn(ctx);
    this.textures.addCanvas(`item_${itemType}`, canvas);
  }

  generateEnemyTextures() {
    const w = TILE_SIZE;
    const h = TILE_SIZE * 2;

    // --- Zombie: hunched, jagged cave creature with drool ---
    const zombieCanvas = document.createElement('canvas');
    zombieCanvas.width = w;
    zombieCanvas.height = h;
    const zctx = zombieCanvas.getContext('2d');

    zctx.fillStyle = '#3a7a3a';
    zctx.beginPath();
    zctx.moveTo(w * 0.5, h * 0.06);
    zctx.lineTo(w * 0.72, h * 0.12);
    zctx.lineTo(w * 0.82, h * 0.3);
    zctx.lineTo(w * 0.85, h * 0.5);
    zctx.lineTo(w * 0.78, h * 0.72);
    zctx.lineTo(w * 0.72, h * 0.92);
    zctx.lineTo(w * 0.6, h * 0.96);
    zctx.lineTo(w * 0.4, h * 0.96);
    zctx.lineTo(w * 0.28, h * 0.92);
    zctx.lineTo(w * 0.18, h * 0.7);
    zctx.lineTo(w * 0.15, h * 0.48);
    zctx.lineTo(w * 0.2, h * 0.28);
    zctx.lineTo(w * 0.32, h * 0.1);
    zctx.closePath();
    zctx.fill();

    zctx.fillStyle = '#2a5a2a';
    zctx.beginPath(); zctx.arc(w * 0.6, h * 0.5, 5, 0, Math.PI * 2); zctx.fill();
    zctx.beginPath(); zctx.arc(w * 0.35, h * 0.65, 4, 0, Math.PI * 2); zctx.fill();
    zctx.beginPath(); zctx.arc(w * 0.55, h * 0.75, 3, 0, Math.PI * 2); zctx.fill();

    zctx.fillStyle = '#cc2222';
    zctx.beginPath(); zctx.ellipse(w * 0.38, h * 0.2, 3, 4, -0.2, 0, Math.PI * 2); zctx.fill();
    zctx.beginPath(); zctx.ellipse(w * 0.6, h * 0.18, 4, 3, 0.15, 0, Math.PI * 2); zctx.fill();
    zctx.fillStyle = '#000';
    zctx.beginPath(); zctx.arc(w * 0.38, h * 0.2, 1.5, 0, Math.PI * 2); zctx.fill();
    zctx.beginPath(); zctx.arc(w * 0.61, h * 0.18, 1.5, 0, Math.PI * 2); zctx.fill();

    zctx.fillStyle = '#1a3a1a';
    zctx.fillRect(w * 0.35, h * 0.28, w * 0.25, 3);
    zctx.fillStyle = '#55bb55';
    zctx.fillRect(w * 0.42, h * 0.31, 2, 5);
    zctx.fillRect(w * 0.5, h * 0.31, 2, 7);

    this.textures.addCanvas('enemy_zombie', zombieCanvas);

    // --- Skeleton: tall spindly bone creature with glowing eyes and crossbow ---
    const skelCanvas = document.createElement('canvas');
    skelCanvas.width = w;
    skelCanvas.height = h;
    const sctx = skelCanvas.getContext('2d');

    sctx.fillStyle = '#e8e0cc';
    sctx.beginPath();
    sctx.ellipse(w * 0.5, h * 0.13, 9, 10, 0, 0, Math.PI * 2);
    sctx.fill();

    sctx.fillStyle = '#d4cdb8';
    sctx.fillRect(w * 0.32, h * 0.2, w * 0.36, 4);

    sctx.fillStyle = '#0a0a0a';
    sctx.beginPath(); sctx.ellipse(w * 0.38, h * 0.11, 3, 4, 0, 0, Math.PI * 2); sctx.fill();
    sctx.beginPath(); sctx.ellipse(w * 0.62, h * 0.11, 3, 4, 0, 0, Math.PI * 2); sctx.fill();

    sctx.fillStyle = '#cc3333';
    sctx.beginPath(); sctx.arc(w * 0.38, h * 0.11, 1.5, 0, Math.PI * 2); sctx.fill();
    sctx.beginPath(); sctx.arc(w * 0.62, h * 0.11, 1.5, 0, Math.PI * 2); sctx.fill();

    sctx.fillStyle = '#2a2a1a';
    sctx.beginPath(); sctx.arc(w * 0.5, h * 0.16, 1.5, 0, Math.PI * 2); sctx.fill();

    sctx.fillStyle = '#ccccbb';
    for (let i = 0; i < 5; i++) sctx.fillRect(w * 0.34 + i * 3, h * 0.2, 2, 3);

    sctx.fillStyle = '#ccc8b0';
    for (let i = 0; i < 6; i++) {
      sctx.fillRect(w * 0.44, h * 0.26 + i * 6, w * 0.12, 4);
    }

    sctx.strokeStyle = '#d4cdb8';
    sctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const ry = h * 0.32 + i * 10;
      sctx.beginPath(); sctx.arc(w * 0.5, ry, 8, Math.PI * 0.15, Math.PI * 0.85); sctx.stroke();
    }

    sctx.fillStyle = '#6b4226';
    sctx.fillRect(w * 0.75, h * 0.28, 3, 18);
    sctx.strokeStyle = '#888';
    sctx.lineWidth = 1;
    sctx.beginPath();
    sctx.moveTo(w * 0.76, h * 0.27);
    sctx.lineTo(w * 0.9, h * 0.32);
    sctx.moveTo(w * 0.76, h * 0.43);
    sctx.lineTo(w * 0.9, h * 0.38);
    sctx.stroke();

    sctx.fillStyle = '#d4cdb8';
    sctx.fillRect(w * 0.34, h * 0.62, 3, h * 0.28);
    sctx.fillRect(w * 0.62, h * 0.62, 3, h * 0.28);
    sctx.fillRect(w * 0.44, h * 0.6, w * 0.12, 3);

    this.textures.addCanvas('enemy_skeleton', skelCanvas);

    // --- Bomb Zombie: round bomb-shaped body with stubby legs, fuse, and panicked eyes ---
    const bombCanvas = document.createElement('canvas');
    bombCanvas.width = w;
    bombCanvas.height = h;
    const bctx = bombCanvas.getContext('2d');

    bctx.fillStyle = '#bb3318';
    bctx.beginPath();
    bctx.ellipse(w * 0.5, h * 0.45, w * 0.42, h * 0.3, 0, 0, Math.PI * 2);
    bctx.fill();

    bctx.fillStyle = '#dd6622';
    bctx.beginPath();
    bctx.ellipse(w * 0.5, h * 0.5, w * 0.25, h * 0.18, 0, 0, Math.PI * 2);
    bctx.fill();

    bctx.fillStyle = '#ff9944';
    bctx.beginPath();
    bctx.ellipse(w * 0.5, h * 0.48, w * 0.12, h * 0.08, 0, 0, Math.PI * 2);
    bctx.fill();

    bctx.fillStyle = '#ffee00';
    bctx.beginPath(); bctx.ellipse(w * 0.36, h * 0.34, 4, 5, -0.2, 0, Math.PI * 2); bctx.fill();
    bctx.beginPath(); bctx.ellipse(w * 0.64, h * 0.34, 4, 5, 0.2, 0, Math.PI * 2); bctx.fill();
    bctx.fillStyle = '#000';
    bctx.beginPath(); bctx.arc(w * 0.36, h * 0.34, 2, 0, Math.PI * 2); bctx.fill();
    bctx.beginPath(); bctx.arc(w * 0.64, h * 0.34, 2, 0, Math.PI * 2); bctx.fill();

    bctx.strokeStyle = '#1a0a0a';
    bctx.lineWidth = 1.5;
    bctx.beginPath();
    bctx.arc(w * 0.5, h * 0.46, 4, 0.2, Math.PI - 0.2);
    bctx.stroke();

    bctx.strokeStyle = '#444';
    bctx.lineWidth = 2;
    bctx.beginPath();
    bctx.moveTo(w * 0.5, h * 0.15);
    bctx.quadraticCurveTo(w * 0.65, h * 0.08, w * 0.6, h * 0.02);
    bctx.stroke();

    bctx.fillStyle = '#ffff44';
    bctx.beginPath(); bctx.arc(w * 0.6, h * 0.02, 3, 0, Math.PI * 2); bctx.fill();
    bctx.fillStyle = '#ffaa00';
    bctx.beginPath(); bctx.arc(w * 0.6, h * 0.02, 1.5, 0, Math.PI * 2); bctx.fill();

    bctx.fillStyle = '#993018';
    bctx.fillRect(w * 0.3, h * 0.74, w * 0.14, h * 0.2);
    bctx.fillRect(w * 0.56, h * 0.74, w * 0.14, h * 0.2);
    bctx.fillStyle = '#771a0a';
    bctx.fillRect(w * 0.26, h * 0.9, w * 0.2, h * 0.06);
    bctx.fillRect(w * 0.54, h * 0.9, w * 0.2, h * 0.06);

    this.textures.addCanvas('enemy_bomb', bombCanvas);

    const arrowCanvas = document.createElement('canvas');
    arrowCanvas.width = 16;
    arrowCanvas.height = 6;
    const ac = arrowCanvas.getContext('2d');
    ac.fillStyle = '#8B5E3C';
    ac.fillRect(0, 2, 12, 2);
    ac.fillStyle = '#aaaaaa';
    ac.beginPath();
    ac.moveTo(12, 0);
    ac.lineTo(16, 3);
    ac.lineTo(12, 6);
    ac.closePath();
    ac.fill();
    ac.fillStyle = '#cccccc';
    ac.fillRect(0, 1, 2, 4);
    ac.fillRect(2, 0, 1, 6);
    this.textures.addCanvas('arrow', arrowCanvas);
  }

  generateSkyGradient() {
    const w = 1;
    const h = 512;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#0a1628');
    grad.addColorStop(0.08, '#1a3366');
    grad.addColorStop(0.16, '#4488cc');
    grad.addColorStop(0.21, '#87CEEB');
    grad.addColorStop(0.28, '#6d8a7a');
    grad.addColorStop(0.40, '#5a4030');
    grad.addColorStop(0.70, '#2a1a0a');
    grad.addColorStop(1.0, '#0a0a0a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    this.textures.addCanvas('sky_gradient', canvas);
  }
}

function colorToCSS(hex) {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  return `rgb(${r},${g},${b})`;
}

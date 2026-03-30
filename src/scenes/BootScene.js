import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';
import { ItemTypes } from '../data/items.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.generateBlockTextures();
    this.generatePlayerTexture();
    this.generateItemTextures();
    this.generateSkyGradient();
    this.scene.start('GameScene');
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

      this.addBorderShading(ctx, s);

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

  generatePlayerTexture() {
    const w = TILE_SIZE;
    const h = TILE_SIZE * 2;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#4488ff';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(w / 2 - 5, h / 2 - 10, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w / 2 + 5, h / 2 - 10, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(w / 2 - 4, h / 2 - 10, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w / 2 + 6, h / 2 - 10, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas('player', canvas);
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
      ctx.strokeStyle = '#8B5E3C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s * 0.5, s * 0.9);
      ctx.lineTo(s * 0.5, s * 0.35);
      ctx.stroke();
      ctx.fillStyle = '#A0724A';
      ctx.fillRect(s * 0.2, s * 0.1, s * 0.6, s * 0.18);
      ctx.fillStyle = '#8B5E3C';
      ctx.fillRect(s * 0.18, s * 0.08, s * 0.08, s * 0.24);
      ctx.fillRect(s * 0.74, s * 0.08, s * 0.08, s * 0.24);
    });

    this.makeItemTexture(ItemTypes.WOODEN_AXE, (ctx) => {
      ctx.strokeStyle = '#8B5E3C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s * 0.45, s * 0.9);
      ctx.lineTo(s * 0.45, s * 0.3);
      ctx.stroke();
      ctx.fillStyle = '#A0724A';
      ctx.beginPath();
      ctx.moveTo(s * 0.45, s * 0.1);
      ctx.lineTo(s * 0.82, s * 0.22);
      ctx.lineTo(s * 0.82, s * 0.42);
      ctx.lineTo(s * 0.45, s * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#8B5E3C';
      ctx.fillRect(s * 0.42, s * 0.08, s * 0.06, s * 0.34);
    });

    this.makeItemTexture(ItemTypes.STONE_PICKAXE, (ctx) => {
      ctx.strokeStyle = '#8B5E3C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s * 0.5, s * 0.9);
      ctx.lineTo(s * 0.5, s * 0.35);
      ctx.stroke();
      ctx.fillStyle = '#808080';
      ctx.fillRect(s * 0.2, s * 0.1, s * 0.6, s * 0.18);
      ctx.fillStyle = '#666666';
      ctx.fillRect(s * 0.18, s * 0.08, s * 0.08, s * 0.24);
      ctx.fillRect(s * 0.74, s * 0.08, s * 0.08, s * 0.24);
    });

    this.makeItemTexture(ItemTypes.STONE_AXE, (ctx) => {
      ctx.strokeStyle = '#8B5E3C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s * 0.45, s * 0.9);
      ctx.lineTo(s * 0.45, s * 0.3);
      ctx.stroke();
      ctx.fillStyle = '#808080';
      ctx.beginPath();
      ctx.moveTo(s * 0.45, s * 0.1);
      ctx.lineTo(s * 0.82, s * 0.22);
      ctx.lineTo(s * 0.82, s * 0.42);
      ctx.lineTo(s * 0.45, s * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#666666';
      ctx.fillRect(s * 0.42, s * 0.08, s * 0.06, s * 0.34);
    });

    this.makeItemTexture(ItemTypes.GRASS_ESSENCE, (ctx) => {
      ctx.fillStyle = '#3aaa3a';
      ctx.beginPath();
      ctx.ellipse(s * 0.5, s * 0.5, s * 0.3, s * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5cdd5c';
      ctx.beginPath();
      ctx.ellipse(s * 0.45, s * 0.4, s * 0.12, s * 0.15, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.ellipse(s * 0.4, s * 0.35, s * 0.06, s * 0.08, -0.4, 0, Math.PI * 2);
      ctx.fill();
    });
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

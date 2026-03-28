import { BlockTypes, BlockData, TILE_SIZE } from '../data/blocks.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.generateBlockTextures();
    this.generatePlayerTexture();
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
}

function colorToCSS(hex) {
  const r = (hex >> 16) & 0xff;
  const g = (hex >> 8) & 0xff;
  const b = hex & 0xff;
  return `rgb(${r},${g},${b})`;
}

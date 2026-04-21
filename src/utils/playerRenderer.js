import { TILE_SIZE } from '../data/blocks.js';
import { BlobColors, Accessories, Patterns } from '../data/customization.js';

function getColor(colorId) {
  return BlobColors.find(c => c.id === colorId) || BlobColors[0];
}

function drawPattern(ctx, patternId, w, h) {
  switch (patternId) {
    case 'viney': {
      ctx.strokeStyle = 'rgba(0,80,0,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.55);
      ctx.quadraticCurveTo(w * 0.35, h * 0.45, w * 0.3, h * 0.65);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.7, h * 0.5);
      ctx.quadraticCurveTo(w * 0.55, h * 0.6, w * 0.65, h * 0.72);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,120,0,0.3)';
      ctx.beginPath(); ctx.ellipse(w * 0.22, h * 0.53, 2, 3, -0.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * 0.32, h * 0.63, 2, 3, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * 0.68, h * 0.48, 2, 3, 0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * 0.63, h * 0.7, 2, 3, -0.3, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'heart': {
      ctx.fillStyle = 'rgba(255,60,80,0.45)';
      const hx = w * 0.5, hy = h * 0.58;
      const hs = 5;
      ctx.beginPath();
      ctx.moveTo(hx, hy + hs * 1.2);
      ctx.bezierCurveTo(hx - hs * 1.8, hy - hs * 0.5, hx - hs * 0.5, hy - hs * 1.8, hx, hy - hs * 0.4);
      ctx.bezierCurveTo(hx + hs * 0.5, hy - hs * 1.8, hx + hs * 1.8, hy - hs * 0.5, hx, hy + hs * 1.2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,120,140,0.3)';
      ctx.beginPath();
      ctx.moveTo(hx, hy + hs * 0.4);
      ctx.bezierCurveTo(hx - hs * 0.8, hy - hs * 0.3, hx - hs * 0.2, hy - hs * 1.0, hx, hy - hs * 0.1);
      ctx.fill();
      break;
    }
    case 'banana': {
      ctx.fillStyle = 'rgba(255,220,50,0.5)';
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.52);
      ctx.quadraticCurveTo(w * 0.5, h * 0.72, w * 0.65, h * 0.55);
      ctx.quadraticCurveTo(w * 0.5, h * 0.62, w * 0.35, h * 0.52);
      ctx.fill();
      ctx.fillStyle = 'rgba(180,150,20,0.3)';
      ctx.fillRect(w * 0.34, h * 0.50, 2, 3);
      ctx.fillRect(w * 0.64, h * 0.53, 2, 3);
      break;
    }
    case 'lightning': {
      ctx.fillStyle = 'rgba(255,255,80,0.55)';
      ctx.beginPath();
      ctx.moveTo(w * 0.52, h * 0.45);
      ctx.lineTo(w * 0.42, h * 0.58);
      ctx.lineTo(w * 0.50, h * 0.58);
      ctx.lineTo(w * 0.44, h * 0.72);
      ctx.lineTo(w * 0.60, h * 0.55);
      ctx.lineTo(w * 0.52, h * 0.55);
      ctx.lineTo(w * 0.58, h * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(200,180,0,0.4)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      break;
    }
  }
}

function drawAccessory(ctx, accessoryId, w, h) {
  switch (accessoryId) {
    case 'cowboy_hat': {
      ctx.fillStyle = '#8B5E3C';
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.12, w * 0.55, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#A0724A';
      ctx.fillRect(w * 0.25, h * 0.02, w * 0.5, h * 0.11);
      ctx.fillStyle = '#7a4a28';
      ctx.fillRect(w * 0.28, h * 0.09, w * 0.44, 2);
      ctx.fillStyle = '#C49A6C';
      ctx.fillRect(w * 0.3, h * 0.02, w * 0.4, 2);
      break;
    }
    case 'bandana': {
      ctx.fillStyle = '#cc2222';
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.27, w * 0.42, 5, 0, Math.PI + 0.3, -0.3);
      ctx.fill();
      ctx.fillStyle = '#aa1111';
      ctx.fillRect(w * 0.12, h * 0.26, 6, 8);
      ctx.fillRect(w * 0.08, h * 0.30, 4, 6);
      ctx.fillStyle = '#ffdd44';
      ctx.fillRect(w * 0.35, h * 0.24, 2, 2);
      ctx.fillRect(w * 0.45, h * 0.23, 2, 2);
      ctx.fillRect(w * 0.55, h * 0.24, 2, 2);
      break;
    }
    case 'banana_peel': {
      ctx.fillStyle = '#FFDD33';
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.04);
      ctx.quadraticCurveTo(w * 0.3, h * 0.0, w * 0.2, h * 0.12);
      ctx.lineTo(w * 0.35, h * 0.15);
      ctx.lineTo(w * 0.5, h * 0.10);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.04);
      ctx.quadraticCurveTo(w * 0.7, h * 0.0, w * 0.8, h * 0.12);
      ctx.lineTo(w * 0.65, h * 0.15);
      ctx.lineTo(w * 0.5, h * 0.10);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.04);
      ctx.quadraticCurveTo(w * 0.5, h * -0.06, w * 0.5, h * -0.02);
      ctx.lineTo(w * 0.55, h * 0.08);
      ctx.lineTo(w * 0.45, h * 0.08);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#CCAA22';
      ctx.beginPath();
      ctx.ellipse(w * 0.5, h * 0.12, w * 0.18, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6B4226';
      ctx.fillRect(w * 0.48, h * 0.01, 2, 4);
      break;
    }
    case 'iron_ore_hat': {
      ctx.fillStyle = '#707070';
      ctx.fillRect(w * 0.2, h * 0.05, w * 0.6, h * 0.12);
      ctx.fillStyle = '#888888';
      ctx.fillRect(w * 0.22, h * 0.06, w * 0.56, h * 0.08);
      ctx.fillStyle = '#c4956a';
      ctx.fillRect(w * 0.28, h * 0.07, 4, 4);
      ctx.fillRect(w * 0.50, h * 0.08, 5, 3);
      ctx.fillRect(w * 0.38, h * 0.10, 3, 3);
      ctx.fillStyle = '#555555';
      ctx.fillRect(w * 0.2, h * 0.14, w * 0.6, 2);
      break;
    }
  }
}

function drawBlobBody(ctx, col, w, h, offsetX, tilt) {
  ctx.fillStyle = col.dark;
  ctx.beginPath();
  ctx.ellipse(w / 2 + offsetX, h / 2, w / 2 - 1, h / 2 - 1, tilt, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = col.mid;
  ctx.beginPath();
  ctx.ellipse(w / 2 + offsetX, h / 2, w / 2 - 3, h / 2 - 3, tilt, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = col.light;
  ctx.beginPath();
  ctx.ellipse(w * 0.5 + offsetX * 0.5, h * 0.58, w * 0.3, h * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(w * 0.35 + offsetX * 0.5, h * 0.22, 5, 7, -0.4, 0, Math.PI * 2);
  ctx.fill();
}

export function generatePlayerCanvases(customization) {
  const col = getColor(customization.color);
  const w = TILE_SIZE;
  const h = TILE_SIZE * 2;

  const front = document.createElement('canvas');
  front.width = w;
  front.height = h;
  const fc = front.getContext('2d');

  drawBlobBody(fc, col, w, h, 0, 0);

  fc.fillStyle = 'rgba(255,255,255,0.18)';
  fc.beginPath();
  fc.ellipse(w * 0.55, h * 0.18, 2, 3, 0, 0, Math.PI * 2);
  fc.fill();

  drawPattern(fc, customization.pattern, w, h);

  fc.fillStyle = '#ffffff';
  fc.beginPath(); fc.ellipse(w * 0.36, h * 0.36, 5, 5.5, 0, 0, Math.PI * 2); fc.fill();
  fc.beginPath(); fc.ellipse(w * 0.64, h * 0.36, 5, 5.5, 0, 0, Math.PI * 2); fc.fill();
  fc.fillStyle = col.pupil;
  fc.beginPath(); fc.ellipse(w * 0.38, h * 0.37, 2.5, 3, 0, 0, Math.PI * 2); fc.fill();
  fc.beginPath(); fc.ellipse(w * 0.66, h * 0.37, 2.5, 3, 0, 0, Math.PI * 2); fc.fill();
  fc.fillStyle = '#fff';
  fc.beginPath(); fc.arc(w * 0.36, h * 0.35, 1, 0, Math.PI * 2); fc.fill();
  fc.beginPath(); fc.arc(w * 0.64, h * 0.35, 1, 0, Math.PI * 2); fc.fill();
  fc.strokeStyle = col.outline;
  fc.lineWidth = 1.5;
  fc.beginPath();
  fc.arc(w * 0.5, h * 0.42, 5, 0.3, Math.PI - 0.3);
  fc.stroke();

  drawAccessory(fc, customization.accessory, w, h);

  const side = document.createElement('canvas');
  side.width = w;
  side.height = h;
  const sc = side.getContext('2d');

  drawBlobBody(sc, col, w, h, 1, 0.08);

  drawPattern(sc, customization.pattern, w, h);

  sc.fillStyle = '#ffffff';
  sc.beginPath(); sc.ellipse(w * 0.5, h * 0.36, 5, 5.5, 0, 0, Math.PI * 2); sc.fill();
  sc.beginPath(); sc.ellipse(w * 0.76, h * 0.36, 4, 5, 0, 0, Math.PI * 2); sc.fill();
  sc.fillStyle = col.pupil;
  sc.beginPath(); sc.ellipse(w * 0.53, h * 0.37, 2.5, 3, 0, 0, Math.PI * 2); sc.fill();
  sc.beginPath(); sc.ellipse(w * 0.79, h * 0.37, 2, 2.5, 0, 0, Math.PI * 2); sc.fill();
  sc.fillStyle = '#fff';
  sc.beginPath(); sc.arc(w * 0.51, h * 0.35, 1, 0, Math.PI * 2); sc.fill();
  sc.beginPath(); sc.arc(w * 0.77, h * 0.35, 1, 0, Math.PI * 2); sc.fill();
  sc.strokeStyle = col.outline;
  sc.lineWidth = 1.5;
  sc.beginPath();
  sc.arc(w * 0.58, h * 0.42, 4, 0.3, Math.PI - 0.3);
  sc.stroke();

  drawAccessory(sc, customization.accessory, w, h);

  return { front, side };
}

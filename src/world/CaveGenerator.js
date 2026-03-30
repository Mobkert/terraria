import { BlockTypes } from '../data/blocks.js';

export function generateCaves(tiles, width, height, surfaceHeights, rng) {
  const STONE_DEPTH = 16;
  const numWorms = 60 + Math.floor(rng() * 40);

  for (let i = 0; i < numWorms; i++) {
    const startX = Math.floor(rng() * width);
    const minY = surfaceHeights[startX] + STONE_DEPTH;
    if (minY >= height - 5) continue;
    const startY = minY + Math.floor(rng() * (height - minY - 5));

    carveTunnel(tiles, width, height, surfaceHeights, rng, startX, startY, STONE_DEPTH);
  }
}

function carveTunnel(tiles, w, h, surfaceHeights, rng, startX, startY, stoneDepth) {
  let x = startX;
  let y = startY;
  let angle = rng() * Math.PI * 2;
  const length = 80 + Math.floor(rng() * 200);
  let radius = 1.5 + rng() * 1.5;
  let roomCooldown = 30 + Math.floor(rng() * 40);

  for (let step = 0; step < length; step++) {
    carveCircle(tiles, w, h, surfaceHeights, stoneDepth, Math.round(x), Math.round(y), radius);

    roomCooldown--;
    if (roomCooldown <= 0 && rng() < 0.3) {
      const roomRadius = 4 + Math.floor(rng() * 8);
      carveCircle(tiles, w, h, surfaceHeights, stoneDepth, Math.round(x), Math.round(y), roomRadius);
      roomCooldown = 40 + Math.floor(rng() * 50);
    }

    angle += (rng() - 0.5) * 1.2;
    radius += (rng() - 0.5) * 0.3;
    radius = Math.max(1, Math.min(3, radius));

    x += Math.cos(angle) * 2;
    y += Math.sin(angle) * 1.5;

    if (x < 2 || x >= w - 2 || y < 2 || y >= h - 2) break;
  }
}

function carveCircle(tiles, w, h, surfaceHeights, stoneDepth, cx, cy, radius) {
  const r = Math.ceil(radius);

  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > radius * radius) continue;

      const tx = cx + dx;
      const ty = cy + dy;
      if (tx < 1 || tx >= w - 1 || ty < 1 || ty >= h - 1) continue;

      const surface = surfaceHeights[tx];
      if (ty <= surface + stoneDepth) continue;

      const idx = ty * w + tx;
      const block = tiles[idx];
      if (block === BlockTypes.STONE || block === BlockTypes.DEEPSLATE) {
        tiles[idx] = BlockTypes.AIR;
      }
    }
  }
}

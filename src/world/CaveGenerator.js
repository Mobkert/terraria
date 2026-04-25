import { BlockTypes } from '../data/blocks.js';

export function generateCaves(tiles, width, height, surfaceHeights, rng) {
  const STONE_DEPTH = 16;
  const numWorms = 88 + Math.floor(rng() * 62);
  const maxSurfaceOpenings = 10 + Math.floor(rng() * 8);
  const openingsState = { count: 0, max: maxSurfaceOpenings };

  const startWeights = buildMountainWeights(surfaceHeights);
  const totalWeight = startWeights[startWeights.length - 1];

  for (let i = 0; i < numWorms; i++) {
    const startX = pickWeightedStartX(startWeights, totalWeight, rng);
    const minY = surfaceHeights[startX] + STONE_DEPTH;
    if (minY >= height - 5) continue;
    const startY = minY + Math.floor(rng() * (height - minY - 5));

    carveTunnel(tiles, width, height, surfaceHeights, rng, startX, startY, STONE_DEPTH, openingsState);
  }
}

function buildMountainWeights(surfaceHeights) {
  const w = surfaceHeights.length;
  const weights = new Float64Array(w);
  let running = 0;

  for (let x = 0; x < w; x++) {
    const left1 = surfaceHeights[Math.max(0, x - 1)];
    const right1 = surfaceHeights[Math.min(w - 1, x + 1)];
    const left2 = surfaceHeights[Math.max(0, x - 2)];
    const right2 = surfaceHeights[Math.min(w - 1, x + 2)];
    const ruggedness =
      Math.abs(right1 - left1) +
      Math.abs(right2 - left2) * 0.6 +
      Math.abs(surfaceHeights[x] - ((left1 + right1) * 0.5)) * 1.2;

    // Base weight keeps flat terrain viable; ruggedness boosts mountains.
    const weight = 1 + Math.min(10, ruggedness) * 0.35;
    running += weight;
    weights[x] = running;
  }
  return weights;
}

function pickWeightedStartX(cumulativeWeights, totalWeight, rng) {
  const target = rng() * totalWeight;
  let lo = 0;
  let hi = cumulativeWeights.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cumulativeWeights[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function carveTunnel(tiles, w, h, surfaceHeights, rng, startX, startY, stoneDepth, openingsState) {
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

    if (
      openingsState.count < openingsState.max &&
      step > 24 &&
      rng() < 0.006
    ) {
      const tx = Math.round(x);
      const ty = Math.round(y);
      if (tryCarveSurfaceOpening(tiles, w, h, surfaceHeights, stoneDepth, tx, ty, rng)) {
        openingsState.count++;
      }
    }

    if (x < 2 || x >= w - 2 || y < 2 || y >= h - 2) break;
  }
}

function tryCarveSurfaceOpening(tiles, w, h, surfaceHeights, stoneDepth, tx, ty, rng) {
  if (tx < 2 || tx >= w - 2 || ty < 2 || ty >= h - 2) return false;

  const startSurface = surfaceHeights[tx];
  const openingDepth = ty - startSurface;
  const minOpeningDepth = stoneDepth + 4;
  const maxOpeningDepth = stoneDepth + 34;
  if (openingDepth < minOpeningDepth || openingDepth > maxOpeningDepth) return false;

  // Ensure we connect from an existing cave block.
  if (tiles[ty * w + tx] !== BlockTypes.AIR) return false;

  const roll = rng();
  if (roll < 0.2) {
    return carveVerticalOpening(tiles, w, h, surfaceHeights, tx, ty, rng);
  }
  if (roll < 0.7) {
    return carveDiagonalOpening(tiles, w, h, surfaceHeights, tx, ty, rng);
  }
  return carveSideTunnelOpening(tiles, w, h, surfaceHeights, tx, ty, rng);
}

function carveVerticalOpening(tiles, w, h, surfaceHeights, tx, ty, rng) {
  let shaftX = tx;
  let shaftY = ty;

  while (shaftY > 1) {
    const localSurface = surfaceHeights[shaftX];
    const depthFromSurface = shaftY - localSurface;
    if (depthFromSurface <= 0) break;

    const t = Math.max(0, Math.min(1, depthFromSurface / 28));
    const radius = 1 + t * 1.4;
    carveOpeningCircle(tiles, w, h, shaftX, shaftY, radius);

    if (rng() < 0.22) {
      shaftX += rng() < 0.5 ? -1 : 1;
      shaftX = Math.max(2, Math.min(w - 3, shaftX));
    }
    shaftY -= 1 + (rng() < 0.28 ? 1 : 0);
  }

  ensureOpenSkyMouth(tiles, w, h, surfaceHeights, shaftX);
  return true;
}

function carveDiagonalOpening(tiles, w, h, surfaceHeights, tx, ty, rng) {
  const dir = pickSlopeDirection(surfaceHeights, tx, rng);
  const offset = 10 + Math.floor(rng() * 18);
  const mouthX = Math.max(2, Math.min(w - 3, tx + dir * offset));
  const mouthSurface = surfaceHeights[mouthX];
  const mouthY = mouthSurface + 1;
  if (mouthY >= ty - 4) return false;

  carveLineTunnel(tiles, w, h, tx, ty, mouthX, mouthY, 2.0, 1.2);
  ensureOpenSkyMouth(tiles, w, h, surfaceHeights, mouthX);
  return true;
}

function carveSideTunnelOpening(tiles, w, h, surfaceHeights, tx, ty, rng) {
  const dir = pickSlopeDirection(surfaceHeights, tx, rng);
  const elbowX = Math.max(2, Math.min(w - 3, tx + dir * (8 + Math.floor(rng() * 10))));
  const elbowY = Math.max(2, ty + Math.floor((rng() - 0.5) * 6));
  const mouthX = Math.max(2, Math.min(w - 3, tx + dir * (16 + Math.floor(rng() * 16))));
  const mouthSurface = surfaceHeights[mouthX];
  const mouthY = mouthSurface + 1;
  if (mouthY >= elbowY - 2) return false;

  carveLineTunnel(tiles, w, h, tx, ty, elbowX, elbowY, 1.9, 1.6);
  carveLineTunnel(tiles, w, h, elbowX, elbowY, mouthX, mouthY, 1.6, 1.1);
  ensureOpenSkyMouth(tiles, w, h, surfaceHeights, mouthX);
  return true;
}

function pickSlopeDirection(surfaceHeights, tx, rng) {
  const leftX = Math.max(0, tx - 14);
  const rightX = Math.min(surfaceHeights.length - 1, tx + 14);
  const leftDrop = surfaceHeights[tx] - surfaceHeights[leftX];
  const rightDrop = surfaceHeights[tx] - surfaceHeights[rightX];
  if (leftDrop === rightDrop) return rng() < 0.5 ? -1 : 1;
  return leftDrop > rightDrop ? -1 : 1;
}

function carveLineTunnel(tiles, w, h, x0, y0, x1, y1, r0, r1) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  if (steps <= 0) return;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t);
    const radius = r0 + (r1 - r0) * t;
    carveOpeningCircle(tiles, w, h, x, y, radius);
  }
}

function ensureOpenSkyMouth(tiles, w, h, surfaceHeights, mouthX) {
  const mouthSurface = surfaceHeights[mouthX];
  for (let y = Math.max(1, mouthSurface - 2); y <= Math.min(h - 2, mouthSurface + 2); y++) {
    carveOpeningCell(tiles, w, h, mouthX, y);
  }
  carveOpeningCircle(tiles, w, h, mouthX, Math.max(1, mouthSurface), 2.2);
  carveOpeningCircle(tiles, w, h, mouthX, Math.max(1, mouthSurface + 2), 1.8);
}

function carveOpeningCircle(tiles, w, h, cx, cy, radius) {
  const r = Math.ceil(radius);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > radius * radius) continue;
      const x = cx + dx;
      const y = cy + dy;
      carveOpeningCell(tiles, w, h, x, y);
    }
  }
}

function carveOpeningCell(tiles, w, h, x, y) {
  if (x < 1 || x >= w - 1 || y < 1 || y >= h - 1) return;
  const idx = y * w + x;
  const block = tiles[idx];
  if (
    block === BlockTypes.AIR ||
    block === BlockTypes.GRASS ||
    block === BlockTypes.JUNGLE_GRASS ||
    block === BlockTypes.BIRCH_GRASS ||
    block === BlockTypes.DIRT ||
    block === BlockTypes.SAND ||
    block === BlockTypes.SANDSTONE ||
    block === BlockTypes.STONE ||
    block === BlockTypes.DEEPSLATE
  ) {
    tiles[idx] = BlockTypes.AIR;
  }
}

function carveSurfaceCircle(tiles, w, h, cx, cy, radius) {
  const r = Math.ceil(radius);
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > radius * radius) continue;
      const x = cx + dx;
      const y = cy + dy;
      if (x < 1 || x >= w - 1 || y < 1 || y >= h - 1) continue;
      tiles[y * w + x] = BlockTypes.AIR;
    }
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

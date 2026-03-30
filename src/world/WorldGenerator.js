import { createNoise2D } from 'simplex-noise';
import { BlockTypes } from '../data/blocks.js';
import { generateCaves } from './CaveGenerator.js';

export const WORLD_WIDTH = 2400;
export const WORLD_HEIGHT = 800;
const SURFACE_BASE_Y = 100;

export function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const Biomes = {
  FOREST: 'forest',
  DESERT: 'desert',
  JUNGLE: 'jungle',
};

function selectBiome(noiseValue) {
  if (noiseValue < -0.3) return Biomes.DESERT;
  if (noiseValue > 0.3) return Biomes.JUNGLE;
  return Biomes.FOREST;
}

function getTransitionBlend(noiseValue, rng) {
  const BLEND_WIDTH = 0.12;
  if (Math.abs(noiseValue - (-0.3)) < BLEND_WIDTH) {
    const t = (noiseValue - (-0.3) + BLEND_WIDTH) / (BLEND_WIDTH * 2);
    return rng() < t ? Biomes.FOREST : Biomes.DESERT;
  }
  if (Math.abs(noiseValue - 0.3) < BLEND_WIDTH) {
    const t = (noiseValue - 0.3 + BLEND_WIDTH) / (BLEND_WIDTH * 2);
    return rng() < t ? Biomes.JUNGLE : Biomes.FOREST;
  }
  return null;
}

function getSurfaceBlock(biome) {
  switch (biome) {
    case Biomes.DESERT:
      return BlockTypes.SAND;
    case Biomes.JUNGLE:
      return BlockTypes.JUNGLE_GRASS;
    default:
      return BlockTypes.GRASS;
  }
}

function getSubSurfaceBlock(biome) {
  switch (biome) {
    case Biomes.DESERT:
      return BlockTypes.SANDSTONE;
    default:
      return BlockTypes.DIRT;
  }
}

export function generateWorld(seed = Date.now()) {
  const rng = mulberry32(seed);

  const terrainNoise = createNoise2D(rng);
  const biomeNoise = createNoise2D(rng);
  const detailNoise = createNoise2D(rng);

  const tiles = new Uint8Array(WORLD_WIDTH * WORLD_HEIGHT);
  const surfaceHeights = new Int32Array(WORLD_WIDTH);
  const biomes = new Array(WORLD_WIDTH);

  for (let x = 0; x < WORLD_WIDTH; x++) {
    const bn = biomeNoise(x * 0.002, 0.5);
    biomes[x] = selectBiome(bn);

    const h1 = terrainNoise(x * 0.006, 0) * 25;
    const h2 = detailNoise(x * 0.025, 0) * 8;
    const h3 = detailNoise(x * 0.08, 50) * 3;
    surfaceHeights[x] = Math.floor(SURFACE_BASE_Y + h1 + h2 + h3);

    const sy = surfaceHeights[x];
    const blendBiome = getTransitionBlend(bn, rng);
    const surfaceBiome = blendBiome || biomes[x];

    for (let y = 0; y < WORLD_HEIGHT; y++) {
      const depth = y - sy;

      if (depth < 0) {
        tiles[y * WORLD_WIDTH + x] = BlockTypes.AIR;
      } else if (depth === 0) {
        tiles[y * WORLD_WIDTH + x] = getSurfaceBlock(surfaceBiome);
      } else if (depth <= 15) {
        tiles[y * WORLD_WIDTH + x] = getSubSurfaceBlock(surfaceBiome);
      } else if (depth <= 75) {
        tiles[y * WORLD_WIDTH + x] = BlockTypes.STONE;
      } else {
        tiles[y * WORLD_WIDTH + x] = BlockTypes.DEEPSLATE;
      }
    }
  }

  generateCaves(tiles, WORLD_WIDTH, WORLD_HEIGHT, surfaceHeights, rng);
  placeTrees(tiles, WORLD_WIDTH, WORLD_HEIGHT, surfaceHeights, biomes, rng);
  placeCacti(tiles, WORLD_WIDTH, WORLD_HEIGHT, surfaceHeights, biomes, rng);
  placeVines(tiles, WORLD_WIDTH, WORLD_HEIGHT, surfaceHeights, biomes, rng);
  placeChests(tiles, WORLD_WIDTH, WORLD_HEIGHT, surfaceHeights, rng);

  return { tiles, width: WORLD_WIDTH, height: WORLD_HEIGHT, surfaceHeights, biomes };
}

function placeTrees(tiles, w, h, surfaceHeights, biomes, rng) {
  let lastTreeX = -10;

  for (let x = 3; x < w - 3; x++) {
    const biome = biomes[x];
    if (biome === Biomes.DESERT) continue;

    const minSpacing = biome === Biomes.JUNGLE ? 4 : 6;
    if (x - lastTreeX < minSpacing) continue;

    const treeChance = biome === Biomes.JUNGLE ? 0.35 : 0.2;
    if (rng() > treeChance) continue;

    const sy = surfaceHeights[x];
    if (sy <= 5 || sy >= h - 10) continue;

    const leftH = surfaceHeights[Math.max(0, x - 1)];
    const rightH = surfaceHeights[Math.min(w - 1, x + 1)];
    if (Math.abs(leftH - sy) > 1 || Math.abs(rightH - sy) > 1) continue;

    const trunkHeight = 4 + Math.floor(rng() * 3);

    for (let ty = sy - trunkHeight; ty < sy; ty++) {
      if (ty >= 0 && ty < h) {
        tiles[ty * w + x] = BlockTypes.WOOD;
      }
    }

    const canopyRadius = biome === Biomes.JUNGLE ? 3 : 2;
    const canopyTopY = sy - trunkHeight - canopyRadius;
    const canopyBotY = sy - trunkHeight + 1;

    for (let ly = canopyTopY; ly <= canopyBotY; ly++) {
      for (let lx = x - canopyRadius; lx <= x + canopyRadius; lx++) {
        if (lx < 0 || lx >= w || ly < 0 || ly >= h) continue;

        const dx = Math.abs(lx - x);
        const dy = Math.abs(ly - (canopyTopY + canopyRadius));
        if (dx + dy > canopyRadius + 1) continue;

        if (lx === x && ly >= sy - trunkHeight) continue;

        const idx = ly * w + lx;
        if (tiles[idx] === BlockTypes.AIR) {
          tiles[idx] = BlockTypes.LEAVES;
        }
      }
    }

    lastTreeX = x;
  }
}

function placeCacti(tiles, w, h, surfaceHeights, biomes, rng) {
  let lastCactusX = -8;

  for (let x = 2; x < w - 2; x++) {
    if (biomes[x] !== Biomes.DESERT) continue;
    if (x - lastCactusX < 6) continue;
    if (rng() > 0.15) continue;

    const sy = surfaceHeights[x];
    if (sy <= 5 || sy >= h - 10) continue;

    const leftH = surfaceHeights[Math.max(0, x - 1)];
    const rightH = surfaceHeights[Math.min(w - 1, x + 1)];
    if (Math.abs(leftH - sy) > 0 || Math.abs(rightH - sy) > 0) continue;

    const height = 2 + Math.floor(rng() * 3);
    for (let cy = sy - height; cy < sy; cy++) {
      if (cy >= 0 && cy < h) {
        tiles[cy * w + x] = BlockTypes.CACTUS;
      }
    }

    lastCactusX = x;
  }
}

function placeVines(tiles, w, h, surfaceHeights, biomes, rng) {
  for (let x = 0; x < w; x++) {
    if (biomes[x] !== Biomes.JUNGLE) continue;

    for (let y = 1; y < h - 1; y++) {
      const idx = y * w + x;
      const aboveIdx = (y - 1) * w + x;

      if (tiles[idx] !== BlockTypes.AIR) continue;

      const above = tiles[aboveIdx];
      if (above !== BlockTypes.LEAVES && above !== BlockTypes.VINE) continue;

      if (rng() < 0.65) {
        tiles[idx] = BlockTypes.VINE;
      }
    }
  }
}

function placeChests(tiles, w, h, surfaceHeights, rng) {
  for (let x = 5; x < w - 5; x += 3) {
    for (let y = 0; y < h - 1; y++) {
      if (y <= surfaceHeights[x] + 16) continue;

      const idx = y * w + x;
      const aboveIdx = (y - 1) * w + x;
      const belowIdx = (y + 1) * w + x;

      if (
        tiles[idx] === BlockTypes.AIR &&
        tiles[aboveIdx] === BlockTypes.AIR &&
        tiles[belowIdx] !== BlockTypes.AIR
      ) {
        if (rng() < 0.04) {
          tiles[idx] = BlockTypes.CHEST;
        }
      }
    }
  }
}

export function findSpawnPoint(worldData) {
  const { width, height, surfaceHeights } = worldData;
  const startX = Math.floor(width / 2);

  for (let offset = 0; offset < width / 2; offset++) {
    for (const dir of [1, -1]) {
      const x = startX + offset * dir;
      if (x < 0 || x >= width) continue;

      const sy = surfaceHeights[x];
      if (sy > 5 && sy < height - 10) {
        return { x, y: sy - 1 };
      }
    }
  }

  return { x: Math.floor(width / 2), y: SURFACE_BASE_Y - 1 };
}

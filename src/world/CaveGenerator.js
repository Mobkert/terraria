import { createNoise2D } from 'simplex-noise';
import { BlockTypes } from '../data/blocks.js';

export function generateCaves(tiles, width, height, surfaceHeights, rng) {
  const largeCaveNoise = createNoise2D(rng);
  const tunnelNoise = createNoise2D(rng);
  const veinNoise = createNoise2D(rng);

  for (let x = 0; x < width; x++) {
    const sy = surfaceHeights[x];
    const caveStartY = sy + 5;

    for (let y = caveStartY; y < height; y++) {
      const idx = y * width + x;
      if (tiles[idx] === BlockTypes.AIR) continue;

      const depth = y - sy;
      const depthFactor = Math.min(1, depth / 120);

      const n1 = largeCaveNoise(x * 0.03, y * 0.03);
      const n2 = tunnelNoise(x * 0.07, y * 0.07);
      const n3 = veinNoise(x * 0.15, y * 0.15);

      const largeCaveThreshold = 0.38 - depthFactor * 0.08;
      if (n1 > largeCaveThreshold) {
        tiles[idx] = BlockTypes.AIR;
        continue;
      }

      const tunnelThreshold = 0.42 - depthFactor * 0.06;
      if (n2 > tunnelThreshold) {
        tiles[idx] = BlockTypes.AIR;
        continue;
      }

      if (depth > 40 && Math.abs(n3) < 0.04 + depthFactor * 0.02) {
        tiles[idx] = BlockTypes.AIR;
      }
    }
  }
}

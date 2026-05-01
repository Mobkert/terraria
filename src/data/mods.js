import { BlockData, BlockTypes } from './blocks.js';
import { ItemData } from './items.js';

const STORAGE_KEY = 'terraria_clone_mods_v1';

/** @typedef {{ randomDrops: boolean, acidRain: boolean }} ModsState */

export function defaultModsState() {
  return {
    randomDrops: false,
    acidRain: false,
  };
}

export function loadMods() {
  const base = defaultModsState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    return {
      ...base,
      randomDrops: !!parsed.randomDrops,
      acidRain: !!parsed.acidRain,
    };
  } catch {
    return base;
  }
}

/** @param {ModsState} state */
export function saveMods(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

let cachedDropPool = null;

/** All placeable / droppable ids (blocks + items), excluding air — can include unobtainable blocks. */
export function getRandomDropPool() {
  if (cachedDropPool) return cachedDropPool;
  const set = new Set();
  for (const id of Object.keys(BlockData).map(Number)) {
    if (id !== BlockTypes.AIR) set.add(id);
  }
  for (const id of Object.keys(ItemData).map(Number)) {
    set.add(id);
  }
  cachedDropPool = Array.from(set);
  return cachedDropPool;
}

/** @param {number[]} pool */
export function pickRandomFromPool(pool) {
  if (!pool.length) return BlockTypes.DIRT;
  return pool[Math.floor(Math.random() * pool.length)];
}

import { TILE_SIZE, BlockData, BlockTypes } from '../data/blocks.js';
import { defaultModsState, loadMods } from '../data/mods.js';
import { getItemName, ItemTypes } from '../data/items.js';
import {
  generateWorld,
  findSpawnPoint,
  mulberry32,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from '../world/WorldGenerator.js';
import TileManager from '../world/TileManager.js';
import Player from '../entities/Player.js';
import Inventory from '../systems/Inventory.js';
import BlockBreakPlace from '../systems/BlockBreakPlace.js';
import ChestManager from '../systems/ChestManager.js';
import FurnaceManager from '../systems/FurnaceManager.js';
import EnemySpawner from '../systems/EnemySpawner.js';
import AnimalSpawner from '../systems/AnimalSpawner.js';
import AdvancementTracker from '../systems/AdvancementTracker.js';
import Arrow from '../entities/Arrow.js';
import DroppedItem from '../entities/DroppedItem.js';
import ThrownBomb from '../entities/ThrownBomb.js';

const BIOME_NAMES = {
  forest: 'Forest',
  desert: 'Desert',
  jungle: 'Jungle',
  birch: 'Birch Forest',
};

const BIOME_TINTS = {
  forest: { color: 0x000000, alpha: 0 },
  desert: { color: 0xcc8833, alpha: 0.08 },
  jungle: { color: 0x225533, alpha: 0.1 },
  birch: { color: 0xcc8844, alpha: 0.04 },
};

const GAME_MODE_NAMES = {
  survival: 'Survival',
  creative: 'Creative',
};

const DIFFICULTY_NAMES = {
  peaceful: 'Peaceful',
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
};

const WORLD_TYPE_NAMES = {
  default: 'Default',
  superflat: 'Superflat',
  bigger_biomes: 'Bigger Biomes',
  hilly: 'Hilly',
};

const DAY_DURATION_MS = 10 * 60 * 1000;
const NIGHT_DURATION_MS = 9 * 60 * 1000;
const FULL_CYCLE_MS = DAY_DURATION_MS + NIGHT_DURATION_MS;
const DAYLIGHT_ENEMY_DAMAGE_PER_SEC = 3;
const SUNSET_START_RATIO = 0.9;
const DAWN_START_RATIO = 0.9;
const TIME_SWITCH_TRANSITION_MS = 3500;

const WEATHER_MULT_MS = 5 * 60 * 1000;
/** Every 5 minutes while dry, rain / acid odds double (cap below). */
const WEATHER_CHANCE_MULT = 2;
/** How often we roll for automatic rain (lower = less frequent storms). */
const WEATHER_ROLL_MS = 30 * 1000;
/** Max chance per roll so long dry streaks do not become near-guaranteed rain every tick. */
const WEATHER_CHANCE_CAP = 0.35;
const WEATHER_RAIN_P0 = 0.01;
const WEATHER_ACID_P0 = 0.005;
const WEATHER_DURATION_MIN_MS = 2 * 60 * 1000;
const WEATHER_DURATION_MAX_MS = 10 * 60 * 1000;

function blockIsSolidForRain(block) {
  if (block === BlockTypes.AIR) return false;
  const data = BlockData[block];
  return !data || data.solid !== false;
}

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.seed = (data && data.seed) || 42;
    this.gameMode = data?.gameMode || 'survival';
    this.difficulty = data?.difficulty || 'normal';
    this.worldType = data?.worldType || 'default';
    const base = defaultModsState();
    const fromLaunch = data?.mods && typeof data.mods === 'object' ? data.mods : null;
    this.mods = { ...base, ...(fromLaunch || loadMods()) };
    delete this.mods.rain;
  }

  create() {
    this.worldData = generateWorld(this.seed, { worldType: this.worldType });
    this.tileManager = new TileManager(this, this.worldData);

    const worldPxW = WORLD_WIDTH * TILE_SIZE;
    const worldPxH = WORLD_HEIGHT * TILE_SIZE;

    this.cameras.main.setBounds(0, 0, worldPxW, worldPxH);
    this.cameras.main.setBackgroundColor('#0a1628');

    this.createBackground(worldPxW, worldPxH);
    this.initDayNightCycle();

    const spawn = findSpawnPoint(this.worldData);
    const spawnX = spawn.x * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = this.worldData.surfaceHeights[spawn.x] * TILE_SIZE;

    this.inventory = new Inventory();
    if (this.gameMode === 'creative') {
      const allBlocks = Object.keys(BlockData).map(Number);
      this.inventory.enableCreativeMode(allBlocks);
      this.inventory.addItem(ItemTypes.RAIN_CALLER, 1);
      if (this.mods.acidRain) {
        this.inventory.addItem(ItemTypes.ACID_RAIN_CALLER, 1);
      }
    }
    this.player = new Player(this, spawnX, spawnY, this.tileManager, this.inventory, {
      creativeMode: this.gameMode === 'creative',
    });
    this.chestManager = new ChestManager(this.worldData, mulberry32(this.seed + 999));
    this.furnaceManager = new FurnaceManager();

    this.enemies = [];
    this.animals = [];
    this.arrows = [];
    this.thrownBombs = [];
    this.enemySpawner = new EnemySpawner(this, this.tileManager, this.worldData, {
      difficulty: this.difficulty,
    });
    this.animalSpawner = new AnimalSpawner(this, this.tileManager, this.worldData);

    this.blockSystem = new BlockBreakPlace(
      this,
      this.tileManager,
      this.player,
      this.inventory,
      this.chestManager,
      this.furnaceManager,
    );
    this.blockSystem.enemies = this.enemies;
    this.blockSystem.animals = this.animals;
    this.blockSystem.spawnBombFn = (x, y, vx, vy, dmg, radius) => {
      this.spawnBomb(x, y, vx, vy, dmg, radius);
    };

    this.advancementTracker = new AdvancementTracker(this.inventory);

    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);

    this.tileManager.update();

    this.scene.launch('UIScene', {
      inventory: this.inventory,
      chestManager: this.chestManager,
      furnaceManager: this.furnaceManager,
      player: this.player,
      advancementTracker: this.advancementTracker,
    });

    this.biomeTint = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000, 0,
    );
    this.biomeTint.setScrollFactor(0);
    this.biomeTint.setDepth(50);

    this.infoText = this.add
      .text(10, 10, '', {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(100);

    this.initWeather();
  }

  initWeather() {
    this.activeWeather = null;
    this.weatherEndsAt = 0;
    this.weatherManualHold = false;
    this.rainChanceP = WEATHER_RAIN_P0;
    this.acidChanceP = WEATHER_ACID_P0;
    this.msSinceDryForMultiply = 0;
    this.weatherRollTimer = 0;
    this.acidDamageTimer = 0;
    this.rainAnimT = 0;

    this.rainGfx = this.add.graphics();
    this.rainGfx.setScrollFactor(0);
    this.rainGfx.setDepth(103);

    this.rainDarkOverlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x223344,
      0,
    );
    this.rainDarkOverlay.setScrollFactor(0);
    this.rainDarkOverlay.setDepth(101);
  }

  /** Player tile column has no solid ceiling up to y=0. */
  isPlayerUnderOpenSky() {
    const tx = this.player.getTileX();
    const topTy = Math.floor((this.player.y - this.player.height) / TILE_SIZE);
    for (let ty = topTy; ty >= 0; ty--) {
      const b = this.tileManager.getBlock(tx, ty);
      if (blockIsSolidForRain(b)) return false;
    }
    return true;
  }

  resetWeatherChances() {
    this.rainChanceP = WEATHER_RAIN_P0;
    this.acidChanceP = WEATHER_ACID_P0;
  }

  /**
   * @param {'rain'|'acid'} kind
   * @param {{ manual?: boolean }} [options]
   */
  startWeather(kind, options = {}) {
    this.activeWeather = kind;
    this.weatherManualHold = !!options.manual;
    if (this.weatherManualHold) {
      this.weatherEndsAt = Number.MAX_SAFE_INTEGER;
    } else {
      const dur = Phaser.Math.Between(WEATHER_DURATION_MIN_MS, WEATHER_DURATION_MAX_MS);
      this.weatherEndsAt = this.time.now + dur;
    }
    this.resetWeatherChances();
    this.msSinceDryForMultiply = 0;
  }

  endWeather() {
    this.activeWeather = null;
    this.weatherEndsAt = 0;
    this.weatherManualHold = false;
    this.msSinceDryForMultiply = 0;
  }

  /** Creative items: right-click to start/stop that weather type (manual until toggled). */
  toggleCreativeWeather(kind) {
    if (kind === 'acid' && !this.mods.acidRain) return;
    if (this.activeWeather === kind) {
      this.endWeather();
      return;
    }
    this.endWeather();
    this.startWeather(kind, { manual: true });
  }

  updateWeather(delta) {
    const now = this.time.now;
    const cam = this.cameras.main;
    const raining = this.activeWeather === 'rain' || this.activeWeather === 'acid';

    if (raining && !this.weatherManualHold && now >= this.weatherEndsAt) {
      this.endWeather();
    }

    if (!this.activeWeather) {
      this.msSinceDryForMultiply += delta;
      if (this.msSinceDryForMultiply >= WEATHER_MULT_MS) {
        this.msSinceDryForMultiply = 0;
        this.rainChanceP = Math.min(this.rainChanceP * WEATHER_CHANCE_MULT, WEATHER_CHANCE_CAP);
        if (this.mods.acidRain) {
          this.acidChanceP = Math.min(this.acidChanceP * WEATHER_CHANCE_MULT, WEATHER_CHANCE_CAP);
        }
      }

      this.weatherRollTimer += delta;
      if (this.weatherRollTimer >= WEATHER_ROLL_MS) {
        this.weatherRollTimer = 0;
        const rollA = this.mods.acidRain && Math.random() < this.acidChanceP;
        const rollR = Math.random() < this.rainChanceP;
        if (rollA && rollR) {
          this.startWeather(Math.random() < 0.5 ? 'acid' : 'rain');
        } else if (rollA) {
          this.startWeather('acid');
        } else if (rollR) {
          this.startWeather('rain');
        }
      }
    }

    const active = this.activeWeather;
    if (!active) {
      this.rainGfx.clear();
      this.rainDarkOverlay.setAlpha(0);
      return;
    }

    this.rainDarkOverlay.setAlpha(active === 'acid' ? 0.12 : 0.08);
    this.rainDarkOverlay.setFillStyle(active === 'acid' ? 0x113311 : 0x223344);

    if (active === 'acid' && this.isPlayerUnderOpenSky()) {
      this.acidDamageTimer += delta;
      if (this.acidDamageTimer >= 1200) {
        this.acidDamageTimer = 0;
        this.player.takeDamage(2);
      }
    } else {
      this.acidDamageTimer = 0;
    }

    this.rainAnimT += delta * 0.0012;
    const color = active === 'acid' ? 0x55ee88 : 0xaaccff;
    const w = cam.width;
    const h = cam.height;
    const g = this.rainGfx;
    g.clear();
    const streaks = Math.floor((w * h) / 9000);
    const slant = active === 'acid' ? 0.35 : 0.22;
    for (let i = 0; i < streaks; i++) {
      const seed = i * 9973 + Math.floor(this.rainAnimT * 60);
      const x = (seed * 73 % w) + (this.rainAnimT * 420 + i * 17) % w;
      const y = (seed * 31 % h) + (this.rainAnimT * 880 + i * 41) % (h + 80) - 40;
      const len = active === 'acid' ? 22 : 18;
      g.lineStyle(2, color, active === 'acid' ? 0.55 : 0.45);
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x - len * slant, y + len);
      g.strokePath();
    }
  }

  createBackground(worldPxW, worldPxH) {
    this.skyH = this.cameras.main.height * 4;
    this.skyBg = this.add.image(
      this.cameras.main.width / 2,
      0,
      'sky_gradient',
    );
    this.skyBg.setDisplaySize(this.cameras.main.width, this.skyH);
    this.skyBg.setOrigin(0.5, 0);
    this.skyBg.setScrollFactor(0, 0);
    this.skyBg.setDepth(-10);

    this.skyTintOverlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x66b5ff,
      0,
    );
    this.skyTintOverlay.setScrollFactor(0);
    this.skyTintOverlay.setDepth(-9);

    this.sunSprite = this.add.ellipse(0, 0, 78, 52, 0xffd86a, 0.95);
    this.sunSprite.setScrollFactor(0);
    this.sunSprite.setDepth(-8);

    this.moonSprite = this.add.ellipse(0, 0, 68, 46, 0xd8e5ff, 0.95);
    this.moonSprite.setScrollFactor(0);
    this.moonSprite.setDepth(-8);

    this.createMountainLayer(worldPxW, 0.15, 0x2a3a4a, 0.5, -8, 120);
    this.createMountainLayer(worldPxW, 0.3, 0x3a4a3a, 0.6, -7, 80);
  }

  initDayNightCycle() {
    // Start at bright morning as requested.
    this.timeOfDayMs = 0;
    this.isNight = false;
    this.nightIntensity = 0;
    this.timeTransition = null;
    this.skyLightApplyDelayMs = 0;
    this.currentSkyLightLevel = 15;
    this.tileManager.setSkyLightLevel(this.currentSkyLightLevel);
    this.updateDayNightVisuals(0);
  }

  toggleDayNight() {
    const targetTime = this.isNight ? 0 : DAY_DURATION_MS;
    this.timeTransition = {
      from: this.timeOfDayMs,
      to: targetTime,
      elapsed: 0,
      duration: TIME_SWITCH_TRANSITION_MS,
    };
  }

  createMountainLayer(worldPxW, scrollFactorX, color, alpha, depth, heightScale) {
    const g = this.add.graphics();
    g.setDepth(depth);
    g.setScrollFactor(scrollFactorX, 0.4);

    const segW = 4;
    const surfaceBase = 100 * TILE_SIZE;
    const baseY = surfaceBase - 40;

    g.fillStyle(color, alpha);
    g.beginPath();
    g.moveTo(0, baseY + heightScale);

    for (let px = 0; px < worldPxW; px += segW) {
      const n1 = Math.sin(px * 0.002 + scrollFactorX * 10) * 0.5;
      const n2 = Math.sin(px * 0.005 + scrollFactorX * 20) * 0.3;
      const n3 = Math.sin(px * 0.0008) * 0.8;
      const h = (n1 + n2 + n3) * heightScale;
      g.lineTo(px, baseY - h);
    }

    g.lineTo(worldPxW, baseY + heightScale);
    g.closePath();
    g.fillPath();
  }

  update(time, delta) {
    if (delta > 50) delta = 50;
    this.updateDayNightVisuals(delta);
    this.player.update(delta);
    this.blockSystem.update(delta);
    this.furnaceManager.update(delta);
    this.enemySpawner.update(delta, this.player, this.enemies);
    this.animalSpawner.update(delta, this.player, this.animals);
    this.updateEnemies(delta);
    this.updateAnimals(delta);
    this.updateArrows(delta);
    this.updateBombs(delta);
    this.tileManager.update();

    this.updateSkyPosition();
    this.updateBiomeTint();

    this.updateWeather(delta);

    const tx = this.player.getTileX();
    const ty = this.player.getTileY();
    const biome = this.worldData.biomes[tx] || '?';
    const biomeName = BIOME_NAMES[biome] || biome;
    this.advancementTracker.update(biome);
    const selected = this.inventory.getSelectedItem();
    const itemName = selected ? getItemName(selected.type) : 'Empty';
    const wx = !this.activeWeather
      ? ''
      : this.activeWeather === 'acid'
        ? ' | Acid rain'
        : ' | Raining';
    this.infoText.setText(
      `Pos: ${tx},${ty} | ${GAME_MODE_NAMES[this.gameMode]} | ${DIFFICULTY_NAMES[this.difficulty]} | ${WORLD_TYPE_NAMES[this.worldType]} | ${this.isNight ? 'Night' : 'Day'} | Biome: ${biomeName} | Hand: ${itemName}${wx}`,
    );
  }

  updateDayNightVisuals(delta) {
    let transitionEndedThisFrame = false;
    if (this.timeTransition) {
      this.timeTransition.elapsed += delta;
      const raw = Phaser.Math.Clamp(this.timeTransition.elapsed / this.timeTransition.duration, 0, 1);
      const eased = Phaser.Math.Easing.Cubic.InOut(raw);
      this.timeOfDayMs = Phaser.Math.Linear(this.timeTransition.from, this.timeTransition.to, eased);
      if (raw >= 1) {
        this.timeTransition = null;
        transitionEndedThisFrame = true;
        this.skyLightApplyDelayMs = 0;
      }
    } else {
      this.timeOfDayMs = (this.timeOfDayMs + delta) % FULL_CYCLE_MS;
    }

    const inDay = this.timeOfDayMs < DAY_DURATION_MS;
    this.isNight = !inDay;

    let t;
    let skyLight;
    let tintColor;
    let tintAlpha;

    if (inDay) {
      t = this.timeOfDayMs / DAY_DURATION_MS;
      if (t < SUNSET_START_RATIO) {
        skyLight = 15;
        tintColor = 0x66b5ff; // bright morning/day blue
        tintAlpha = 0;
      } else {
        const s = (t - SUNSET_START_RATIO) / (1 - SUNSET_START_RATIO);
        skyLight = Phaser.Math.Linear(15, 7, s);
        tintColor = 0xff9b47; // sunset orange
        tintAlpha = Phaser.Math.Linear(0.0, 0.28, s);
      }
      this.nightIntensity = 0;
    } else {
      t = (this.timeOfDayMs - DAY_DURATION_MS) / NIGHT_DURATION_MS;
      if (t < DAWN_START_RATIO) {
        const n = t / DAWN_START_RATIO;
        skyLight = Phaser.Math.Linear(7, 3, n);
        tintColor = 0x0b1430; // dark blue to near black
        tintAlpha = Phaser.Math.Linear(0.35, 0.58, n);
        this.nightIntensity = Phaser.Math.Clamp(n, 0, 1);
      } else {
        const d = (t - DAWN_START_RATIO) / (1 - DAWN_START_RATIO); // dawn
        skyLight = Phaser.Math.Linear(3, 10, d);
        tintColor = 0xffa25c;
        tintAlpha = Phaser.Math.Linear(0.5, 0.15, d);
        this.nightIntensity = Phaser.Math.Clamp(1 - d, 0, 1);
      }
    }

    const nextSky = Math.max(0, Math.min(15, Math.round(skyLight)));
    // Full light-map recalculation is expensive; throttle updates to avoid hitches.
    this.skyLightApplyDelayMs = Math.max(0, this.skyLightApplyDelayMs - delta);
    const canApplySkyLight =
      transitionEndedThisFrame ||
      (!this.timeTransition && this.skyLightApplyDelayMs <= 0);
    if (canApplySkyLight && nextSky !== this.currentSkyLightLevel) {
      this.currentSkyLightLevel = nextSky;
      this.tileManager.setSkyLightLevel(nextSky);
      this.skyLightApplyDelayMs = 900;
    }

    this.skyTintOverlay.setFillStyle(tintColor, tintAlpha);
    this.updateSunMoonPositions(inDay);
  }

  updateSunMoonPositions(inDay) {
    const cw = this.cameras.main.width;
    const x = cw - 88;
    const y = 74;

    if (inDay) {
      this.sunSprite.setVisible(true);
      this.sunSprite.setPosition(x, y);
      this.sunSprite.setAlpha(0.92);
      this.moonSprite.setVisible(false);
    } else {
      this.moonSprite.setVisible(true);
      this.moonSprite.setPosition(x, y);
      this.moonSprite.setAlpha(0.95);
      this.sunSprite.setVisible(false);
    }
  }

  spawnArrow(x, y, angle, damage) {
    const arrow = new Arrow(this, x, y, angle, damage, this.tileManager);
    this.arrows.push(arrow);
  }

  updateAnimals(delta) {
    for (let i = this.animals.length - 1; i >= 0; i--) {
      const animal = this.animals[i];
      animal.update(delta);

      if (animal.dead) {
        for (const drop of animal.pendingDrops) {
          const item = new DroppedItem(this, drop.x, drop.y, drop.type, this.tileManager);
          this.blockSystem.droppedItems.push(item);
        }
        this.animals.splice(i, 1);
        continue;
      }

      const dx = this.player.x - animal.x;
      const dy = this.player.y - animal.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1000) {
        animal.die();
        this.animals.splice(i, 1);
      }
    }
  }

  updateEnemies(delta) {
    const spawnArrowFn = (x, y, angle, dmg) => this.spawnArrow(x, y, angle, dmg);
    const daylightDamage = this.isNight ? 0 : (delta / 1000) * DAYLIGHT_ENEMY_DAMAGE_PER_SEC;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(delta, this.player, this.enemies, spawnArrowFn);
      if (daylightDamage > 0) {
        enemy.applyDaylightDamage(daylightDamage);
      }

      if (enemy.dead) {
        for (const drop of enemy.pendingDrops) {
          const item = new DroppedItem(this, drop.x, drop.y, drop.type, this.tileManager);
          this.blockSystem.droppedItems.push(item);
        }
        this.enemies.splice(i, 1);
        continue;
      }

      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 800) {
        enemy.die();
        this.enemies.splice(i, 1);
      }
    }
  }

  updateArrows(delta) {
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];
      arrow.update(delta, this.player);
      if (arrow.dead) this.arrows.splice(i, 1);
    }
  }

  spawnBomb(x, y, vx, vy, damage, radius) {
    const bomb = new ThrownBomb(this, x, y, vx, vy, damage, radius, this.tileManager, this.enemies, this.animals);
    this.thrownBombs.push(bomb);
  }

  updateBombs(delta) {
    for (let i = this.thrownBombs.length - 1; i >= 0; i--) {
      const bomb = this.thrownBombs[i];
      bomb.update(delta, this.player);
      if (bomb.dead) this.thrownBombs.splice(i, 1);
    }
  }

  updateSkyPosition() {
    const cam = this.cameras.main;
    const worldH = WORLD_HEIGHT * TILE_SIZE;
    const maxCamScroll = worldH - cam.height;
    const scrollRatio = Phaser.Math.Clamp(cam.scrollY / maxCamScroll, 0, 1);
    const maxShift = this.skyH - cam.height;
    this.skyBg.setY(-scrollRatio * maxShift);
  }

  updateBiomeTint() {
    const tx = this.player.getTileX();
    const biome = this.worldData.biomes[tx] || 'forest';
    const tint = BIOME_TINTS[biome] || BIOME_TINTS.forest;
    this.biomeTint.setFillStyle(tint.color, tint.alpha);
  }
}

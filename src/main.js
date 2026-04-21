import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import LoadingScene from './scenes/LoadingScene.js';
import MenuScene from './scenes/MenuScene.js';
import CustomizeScene from './scenes/CustomizeScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  pixelArt: true,
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  scene: [BootScene, LoadingScene, MenuScene, CustomizeScene, GameScene, UIScene],
};

new Phaser.Game(config);

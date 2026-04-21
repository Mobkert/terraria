export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'Loading...',
      {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#ffffff',
      }
    ).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.scene.start('MenuScene');
    });
  }
}

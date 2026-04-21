export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    this.loadingText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'Loading.',
      {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: '#ffffff',
      }
    ).setOrigin(0.5);

    this.dotCount = 1;
    this.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        this.dotCount = (this.dotCount % 3) + 1;
        this.loadingText.setText('Loading' + '.'.repeat(this.dotCount));
      },
    });

    this.time.delayedCall(2000, () => {
      this.scene.start('MenuScene');
    });
  }
}

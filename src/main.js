import Phaser from 'phaser';

const gliderSprite = require('../glider.png');
const level1 = require('../level4.png');

let game;
const gameOptions = {
  gliderSpeed: 70,
  gliderTurnSpeed: 200,
  maxLift: 6,
  time: 20000
}

class playGame extends Phaser.Scene {
  constructor() {
    super('PlayGame');
  }

  preload() {
    this.load.image('glider', gliderSprite);
    this.load.image('level1', level1);
  }

  create() {
    this.score = {
      maxLift: 0,
      height: 0
    };
    const src = this.textures.get('level1').getSourceImage();

    // this.level1 = this.physics.add.sprite(game.config.width / 2, game.config.height / 2, 'level1');
    this.glider = this.physics.add.sprite(game.config.width / 2, game.config.height / 5 * 4, 'glider');

    this.canvas = this.textures.createCanvas('map', src.width, src.height).draw(0, 0, src);

    this.text = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' });
    this.input.keyboard.on('keydown', this.moveglider, this);
    this.input.keyboard.on('keyup', this.stopglider, this);
    this.input.on('pointermove', this.moveglider, this);
    this.input.on('pointerup', this.stopglider, this);

    this.timer = this.time.addEvent({
      delay: gameOptions.time
    });
  }

  moveglider(p) {
    const direction = (p.x < game.config.width / 2 || p.code === 'ArrowLeft') ? -1 : 1;
    const angle = Math.abs((game.config.width/2 - p.x)/game.config.width * 2);
    this.glider.setAngularVelocity(gameOptions.gliderTurnSpeed * direction * angle);
    console.log(p);
  }

  stopglider() {
    this.glider.setAngularVelocity(0);
  }

  update() {
    if (this.timer.getProgress() === 1) {
      this.physics.destroy();
      return;
    }
    const pixel = new Phaser.Display.Color();
    this.glider.x = Phaser.Math.Wrap(this.glider.x, 0, game.config.width);
    this.physics.velocityFromRotation(this.glider.rotation - Phaser.Math.PI2/4, gameOptions.gliderSpeed, this.glider.body.velocity);
    // this.physics.world.collide(this.glider, this.horizontalBarrierGroup, () => {
    //   this.scene.start('PlayGame');
    // }, null, this);
    this.physics.world.wrap(this.glider, 32);
    this.canvas.getPixel(this.glider.x, this.glider.y, pixel)
    const lift = pixel.alpha > 0 ? (1 - pixel.v) * gameOptions.maxLift : 0;
    this.score.height += (lift/60);
    this.score.maxLift = lift > this.score.maxLift ? lift : this.score.maxLift;
    this.text.setText(
`Lift: ${lift.toFixed(1)} m/s
maxLift: ${this.score.maxLift.toFixed(1)} m/s
Timer: ${(gameOptions.time/1000 - this.timer.getElapsedSeconds()).toFixed()}
Height: ${this.score.height.toFixed()}
`
    );
  }
}

window.onload = () => {
  const gameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#111166',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: 'thegame',
      width: 320,
      height: 480
    },
    scene: playGame,
    physics: {
      default: 'arcade',
    }
  }
  game = new Phaser.Game(gameConfig);
  window.focus();
}

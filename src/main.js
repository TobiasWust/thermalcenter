import Phaser from 'phaser';

const gliderSprite = require('../glider.png');
const level1 = require('../level4.png');
const brake = require('../brake.png');

let game;
const gameOptions = {
  gliderSpeed: 70,
  gliderTurnSpeed: 200,
  maxLift: 6,
  time: 40000
}

class playGame extends Phaser.Scene {
  constructor() {
    super('PlayGame');
  }

  preload() {
    this.load.image('glider', gliderSprite);
    this.load.image('level1', level1);
    this.load.image('brake', brake);
  }

  create() {
    this.score = {
      maxLift: 0,
      height: 0
    };
    const src = this.textures.get('level1').getSourceImage();

    // this.level1 = this.physics.add.sprite(game.config.width / 2, game.config.height / 2, 'level1');
    this.glider = this.physics.add.sprite(game.config.width / 2, game.config.height / 5 * 4, 'glider');
    this.brakeLeft = this.physics.add.sprite(game.config.width / 2 / 5, game.config.height / 3, 'brake');
    this.brakeRight = this.physics.add.sprite(game.config.width - game.config.width / 2 / 5 , game.config.height / 3, 'brake');

    this.canvas = this.textures.createCanvas('map', src.width, src.height).draw(0, 0, src);

    this.text = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' });
    this.input.on('pointermove', this.moveglider, this);
    // this.input.on('pointermove', this.moveglider, this);
    // this.input.on('pointerup', this.stopglider, this);
    this.timer = this.time.addEvent({
      delay: gameOptions.time
    });
  }

  moveglider(p) {
    const direction = (p.x < game.config.width / 2 || p.code === 'ArrowLeft') ? -1 : 1;
    if (direction === -1) this.brakeLeft.y = p.y;
    if (direction === 1) this.brakeRight.y = p.y;
    // const angle = Math.abs((game.config.width/2 - p.x)/game.config.width * 2);
    const angle = (this.brakeLeft.y - this.brakeRight.y)/game.config.height;
    this.glider.setAngularVelocity(gameOptions.gliderTurnSpeed * angle);
    console.log(p);
  }

  // stopglider() {
  //   console.log('stop glider');
  // }

  update() {
    // if (this.timer.getProgress() === 1) {
    //   this.physics.destroy();
    //   return;
    // }
    const pixel = new Phaser.Display.Color();
    const lift = pixel.alpha > 0 ? (1 - pixel.v) * gameOptions.maxLift : 0;

    this.glider.x = Phaser.Math.Wrap(this.glider.x, 0, game.config.width);
    this.glider.y = Phaser.Math.Wrap(this.glider.y, 0, game.config.height);
    this.physics.velocityFromRotation(this.glider.rotation - Phaser.Math.PI2/4, gameOptions.gliderSpeed, this.glider.body.velocity);
    // this.physics.world.collide(this.glider, this.horizontalBarrierGroup, () => {
    //   this.scene.start('PlayGame');
    // }, null, this);
    // this.physics.world.wrap(this.glider, 32);
    this.canvas.getPixel(this.glider.x, this.glider.y, pixel)
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
    input: {
      activePointers: 2,
    },
    scene: playGame,
    physics: {
      default: 'arcade',
    }
  }
  game = new Phaser.Game(gameConfig);
  window.focus();
}

import Phaser from 'phaser';

const gliderSprite = require('../glider.png');
const level1 = require('../level4.png');
const brake = require('../brake.png');

let game;
const gameOptions = {
  startHeight: 50,
  moveSpeed: 2.5,
  gliderSpeed: 35,
  gliderTurnSpeed: 200,
  maxLift: 7,
  time: 60000,
  angleSink: 1,
  polare: [
    {
      speed: 22,
      sink: 1.8
    },
    {
      speed: 25,
      sink: 1.5
    },
    {
      speed: 27,
      sink: 1.4
    },
    {
      speed: 32,
      sink: 1.5
    },
    {
      speed: 35,
      sink: 1.6
    },
    {
      speed: 40,
      sink: 1.8
    },
    {
      speed: 70,
      sink: 2
    }
  ]
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
      height: gameOptions.startHeight
    };
    const src = this.textures.get('level1').getSourceImage();

    // this.level1 = this.physics.add.sprite(game.config.width / 2, game.config.height / 2, 'level1');
    this.glider = this.physics.add.sprite(game.config.width / 2, game.config.height / 5 * 4, 'glider');
    this.glider.flightSpeed = 35;
    this.glider.flightAngle = 0;
    this.glider.getSink = (speed) => {
      return gameOptions.polare.filter(v => v.speed <= speed)
                      .sort((a, b) => b.speed - a.speed)[0].sink
    }
    this.brakeLeft = this.physics.add.sprite(game.config.width / 2 / 5, game.config.height / 3, 'brake');
    this.brakeRight = this.physics.add.sprite(game.config.width - game.config.width / 2 / 5 , game.config.height / 3, 'brake');
    this.canvas = this.textures.createCanvas('map', src.width, src.height).draw(0, 0, src);
    this.text = this.add.text(10, 10, '', { font: '16px Courier', fill: '#00ff00' });
    this.input.addPointer();
    this.input.on('pointermove', this.moveglider, this);
    this.timer = this.time.addEvent({
      delay: gameOptions.time
    });
  }

  moveglider(p) {
    const direction = (p.x < game.config.width / 2) ? -1 : 1;
    if (direction === -1) this.brakeLeft.y = p.y;
    if (direction === 1) this.brakeRight.y = p.y;
    this.glider.flightAngle = (this.brakeRight.y - this.brakeLeft.y)/game.config.height;
    this.glider.setAngularVelocity(gameOptions.gliderTurnSpeed * this.glider.flightAngle);
    this.glider.flightSpeed = (1-((this.brakeLeft.y + this.brakeRight.y) / game.config.height)) * 10 + gameOptions.gliderSpeed;
  }

  update() {
    // if (this.timer.getProgress() === 1 || this.score.height <= 0) {
    //   this.physics.destroy();
    //   return;
    // }
    const pixel = new Phaser.Display.Color();
    
    this.glider.x = Phaser.Math.Wrap(this.glider.x, 0, game.config.width);
    this.glider.y = Phaser.Math.Wrap(this.glider.y, 0, game.config.height);
    this.physics.velocityFromRotation(this.glider.rotation - Phaser.Math.PI2/4, this.glider.flightSpeed * gameOptions.moveSpeed, this.glider.body.velocity);
    // this.physics.world.collide(this.glider, this.horizontalBarrierGroup, () => {
      //   this.scene.start('PlayGame');
      // }, null, this);
      // this.physics.world.wrap(this.glider, 32);
    this.canvas.getPixel(this.glider.x, this.glider.y, pixel)
    const airLift = pixel.alpha > 0 ? (1 - pixel.v) * gameOptions.maxLift : 0;
    const groundSpeed = (this.glider.flightSpeed).toFixed();
    // const lift = airLift - this.glider.getSink(groundSpeed);
    const lift = airLift - this.glider.getSink(groundSpeed) - Math.abs(this.glider.flightAngle) * gameOptions.angleSink;
    this.score.height += (lift/60);
    this.score.maxLift = lift > this.score.maxLift ? lift : this.score.maxLift;
    this.text.setText(
`Lift: ${lift.toFixed(1)} m/s
maxLift: ${this.score.maxLift.toFixed(1)} m/s
Timer: ${(gameOptions.time/1000 - this.timer.getElapsedSeconds()).toFixed()}
Height: ${this.score.height.toFixed(1)} m
Speed: ${groundSpeed} km/h
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

class Sprite {
  constructor(x, y, diameter) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.radius = diameter / 2;
  }
}

class Player extends Sprite {
  constructor() {
    super(width / 2, height / 2, 30);
    this.health = 100;
    this.speed = 5;
  }
  render() {
    image(playerSprite, this.x, this.y, 100, 100);
  }
  move() {
    if (keyIsDown(68) && this.x < width - this.diameter / 2) {
      this.x += this.speed;
    } else if (keyIsDown(65) && this.x > 0 + this.diameter / 2) {
      this.x -= player.speed;
    }
    if (keyIsDown(87) && this.y > 0 + this.diameter / 2) {
      this.y -= this.speed;
    } else if (keyIsDown(83) && this.y < height - this.diameter / 2) {
      this.y += this.speed;
    }
  }
  takeHit() {
    this.health -= 0.5;
    hitSound.play(0, 3);
    healthBar.value = this.health;
  }
}

class Enemy extends Sprite {
  constructor(x, y, speed) {
    super(x, y, 50);
    this.speed = speed;
  }
  render() {
    image(playerSprite, this.x, this.y, 100, 100);
  }
  move() {
    if (scarecrow.active) {
      follow(this, scarecrow);
    } else {
      follow(this, player);
    }
  }
}

class Scarecrow {
  constructor() {
    this.color = "lightblue";
    this.size = [100, 100];
    this.active = false;
    this.x;
    this.y;
    this.cooldown = 10000;
    this.time = 5000;
  }
  render() {
    push();
    scarecrowAngle += 5;
    translate(this.x, this.y);
    scale(0.75);
    rotate(scarecrowAngle);
    image(scarecrowSprite, 0, 0);
    pop();
  }
}

class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 50;
  }
  render() {
    image(powerupSprite, this.x, this.y, this.size, this.size);
  }
}

class Bomb {
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.size = 80;
  }
  render() {
    image(bombSprite, this.x, this.y, this.size, this.size);
  }
}

const healthBar = document.querySelector("progress");
const waveNumber = document.querySelector("#wave");
const width = 800;
const height = 600;
let playerSprite;
let enemySprite;
let scarecrowSprite;
let backgroundTexture;
let player = new Player();
let enemies = [];
let scarecrow = new Scarecrow();
let scarecrowAngle = 0;
let timeout = false;
let wave = 1;
let spawning = true;
let paused = false;
let hitSound;
let gameOverSound;
let gameOverFont;

function preload() {
  playerSprite = loadImage(
    "https://hecrabbs.github.io/chaser-game/Assets/Toal.png"
  );
  enemySprite = loadImage(
    "https://hecrabbs.github.io/chaser-game/Assets/Toal.png"
  );
  backgroundTexture = loadImage(
    "https://hecrabbs.github.io/chaser-game/Assets/grass.png"
  );
  scarecrowSprite = loadImage(
    "https://hecrabbs.github.io/chaser-game/Assets/hole.png"
  );
  powerupSprite = loadImage(
    "https://hecrabbs.github.io/chaser-game/Assets/powerup.png"
  );
  bombSprite = loadImage(
    "https://hecrabbs.github.io/chaser-game/Assets/bomb.png"
  );
  soundFormats("mp3");
  hitSound = loadSound(
    "https://hecrabbs.github.io/chaser-game/Assets/hitSound.mp3"
  );
  gameOverSound = loadSound(
    "https://hecrabbs.github.io/chaser-game/Assets/gameOverSound.mp3"
  );
  gameOverFont = loadFont(
    "https://hecrabbs.github.io/chaser-game/Assets/game_over.ttf"
  );
}

function pause() {
  pauseButton = createButton("PAUSE");
  pauseButton.parent("buttonHolder");
  pauseButton.mousePressed(() => {
    if (!paused) {
      noLoop();
      paused = true;
    } else {
      paused = false;
      loop();
    }
  });
}

function setup() {
  pause();
  cnv = createCanvas(width, height);
  cnv.style("display", "block");
  cnv.parent("canvasHolder");
  imageMode(CENTER);
  rectMode(CENTER);
  textAlign(CENTER);
  angleMode(DEGREES);
  hitSound.setVolume(1);
  hitSound.playMode("untilDone");
}

function usedScarecrow() {
  if (timeout === false) {
    scarecrow.active = true;
    scarecrow.x = player.x;
    scarecrow.y = player.y;
    setTimeout(() => {
      timeout = true;
      scarecrow.active = false;
      setTimeout(() => (timeout = false), scarecrow.cooldown);
    }, scarecrow.time);
  }
}

function keyReleased() {
  if (keyCode === 32 && !scarecrow.active) {
    usedScarecrow();
  }
}

function randomXYOnScreen() {
  let randX = Math.random() * (width + 1);
  let randY = Math.random() * (height + 1);
  return [randX, randY];
}

function randomXYOffScreen() {
  let MinRangeX = Math.random() * 10 - 10;
  let MaxRangeX = Math.random() * 10 + width;
  let MinRangeY = Math.random() * 10 - 10;
  let MaxRangeY = Math.random() * 10 + height;
  let possibleX = [MinRangeX, MaxRangeX];
  let possibleY = [MinRangeY, MaxRangeY];
  let randX = possibleX[Math.floor(Math.random() * 2)];
  let randY = possibleY[Math.floor(Math.random() * 2)];
  return [randX, randY];
}

function spawner() {
  if (spawning) {
    let enemySpeed = Math.random() * 2 + 2;
    while (enemies.length < wave * 3) {
      enemies.push(new Enemy(...randomXYOffScreen(), enemySpeed));
    }
    spawning = false;
    setTimeout(() => {
      spawning = true;
      wave += 1;
    }, 10000);
    waveNumber.textContent = wave;
  }
}

function follow(follower, leader) {
  const dx = follower.x - leader.x;
  const dy = follower.y - leader.y;
  let direction = Math.atan(dy / dx);
  if (follower.x > leader.x) {
    direction -= Math.PI;
  }
  follower.x += follower.speed * Math.cos(direction);
  follower.y += follower.speed * Math.sin(direction);
}

function collided(sprite1, sprite2) {
  const sumOfRadii = sprite1.diameter / 2 + sprite2.diameter / 2;
  const distanceBetween = Math.hypot(
    sprite1.x - sprite2.x,
    sprite1.y - sprite2.y
  );
  return distanceBetween <= sumOfRadii;
}

function pushOff(c1, c2) {
  let [dx, dy] = [c2.x - c1.x, c2.y - c1.y];
  const distance = Math.hypot(dx, dy);
  let overlap = c1.radius + c2.radius - distance;
  if (overlap > 0) {
    const adjustX = overlap / 2 * (dx / distance);
    const adjustY = overlap / 2 * (dy / distance);
    c1.x -= adjustX;
    c1.y -= adjustY;
    c2.x += adjustX;
    c2.y += adjustY;
  }
}

function adjust() {
  let characters;
  if (
    player.x < width - player.diameter / 2 &&
    player.x > 0 + player.diameter / 2 &&
    player.y > 0 + player.diameter / 2 &&
    player.y < height - player.diameter / 2
  ) {
    characters = [player, ...enemies];
  } else {
    characters = [...enemies];
  }
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      pushOff(characters[i], characters[j]);
    }
  }
}

function checkForDamage(player, enemy) {
  if (collided(player, enemy)) {
    player.takeHit();
  }
}

function doEnemyBehavior() {
  spawner();
  enemies.forEach(enemy => {
    enemy.render();
    enemy.move();
    checkForDamage(player, enemy);
  });
}

function checkScarecrow() {
  if (scarecrow.active) {
    scarecrow.render();
  }
}

function checkGameOver() {
   if (healthBar.value === 0) {
    fill("black");
    textFont(gameOverFont);
    textSize(100);
    text("GAME OVER", width / 2, height / 2);
    gameOverSound.play(0, 1.5);
    noLoop();
  }
}

function drawBackground() {
  push();
  imageMode(CORNER);
  background(backgroundTexture);
  pop();
}

function draw() {
  drawBackground();
  checkScarecrow();
  doEnemyBehavior();
  player.render();
  player.move();
  adjust();
  checkGameOver();
}

class Sprite {
  constructor(x, y, diameter, speed) {
    Object.assign(this, { x, y, diameter, speed });
    this.radius = diameter / 2;
  }
}

class Player extends Sprite {
  constructor() {
    super(width / 2, height / 2, 30, 5);
    this.health = 100;
  }
  render() {
    image(playerSprite, this.x, this.y, 100, 100);
  }
  move() {
    if (keyIsDown(68) && this.x < width - this.diameter / 2) {
      this.x += this.speed;
    } else if (keyIsDown(65) && this.x > 0 + this.diameter / 2) {
      this.x -= this.speed;
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
  gainHealth() {
    this.health += 10;
    healthBar.value = this.health;
  }
  isDead() {
    return this.health <= 0;
  }
  revive() {
    this.health = 100;
    healthBar.value = this.health;
  }
}

class Enemy extends Sprite {
  constructor(x, y, speed) {
    super(x, y, 50, speed);
  }
  render() {
    image(enemySprite, this.x, this.y, 100, 100);
  }
  move() {
    if (scarecrow.active) {
      follow(this, scarecrow);
    } else {
      follow(this, player);
    }
  }
  timer() {
    if (millis() > startTimeEnemy + deltaTimeEnemy) {
      spawning = true;
      wave += 1;
    }
  }
  spawner() {
    if (spawning) {
      let enemySpeed = Math.random() * 2 + 2;
      enemies.push(
        new Enemy(...randomXYOffScreen(), enemySpeed),
        new Enemy(...randomXYOffScreen(), enemySpeed),
        new Enemy(...randomXYOffScreen(), enemySpeed)
      );
      spawning = false;
      startTimeEnemy = millis();
    }
    waveNumber.textContent = wave;
  }
}

class Scarecrow {
  constructor() {
    this.color = "lightblue";
    this.size = [100, 100];
    this.active = false;
    this.x;
    this.y;
    this.timeout = false;
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
  used() {
    if (this.timeout === false) {
      scarecrow.active = true;
      scarecrow.x = player.x;
      scarecrow.y = player.y;
      setTimeout(() => {
        this.timeout = true;
        scarecrow.active = false;
        setTimeout(() => (this.timeout = false), scarecrow.cooldown);
      }, scarecrow.time);
    }
  }
  check() {
    if (scarecrow.active) {
      scarecrow.render();
    }
  }
}

class Items {
  constructor(x, y, size, diameter) {
    Object.assign(this, { x, y, size, diameter });
  }
}
class Powerup extends Items {
  constructor(x, y) {
    super(x, y, [50, 50], 50);
  }
  render() {
    image(powerupSprite, this.x, this.y, ...this.size);
  }
  timer() {
    if (millis() > startTimePowerup + deltaTimePowerup) {
      if (collided(player, powerup)) {
        startTimePowerup = millis();
      }
      drawPowerup = true;
    }
  }
  giveHealth() {
    if (drawPowerup) {
      if (collided(player, powerup)) {
        player.gainHealth();
        powerupSound.play(0, 3);
        powerup = new Powerup(...randomXYOnScreen());
        drawPowerup = false;
      }
    }
  }
  activate() {
    if (drawPowerup) {
      powerup.render();
    }
  }
}

class Bomb extends Items {
  constructor(x, y) {
    super(x, y, [65, 65], 65);
  }
  render() {
    image(bombSprite, this.x, this.y, ...this.size);
  }
  timer() {
    if (millis() > startTimeBomb + deltaTimeBomb) {
      if (collided(player, bomb)) {
        startTimeBomb = millis();
      }
      drawBomb = true;
    }
  }
  removeEnemies() {
    if (drawBomb) {
      if (collided(player, bomb)) {
        enemies.length = enemies.length - 3;
        bombSound.play(0, 3);
        bomb = new Bomb(...randomXYOnScreen());
        drawBomb = false;
      }
    }
  }
  activate() {
    if (drawBomb) {
      bomb.render();
    }
  }
}

const healthBar = document.querySelector("progress");
const waveNumber = document.querySelector("#wave");
const width = 800;
const height = 600;
let playerSprite;
let enemySprite;
let scarecrowSprite;
let powerupSprite;
let bombSprite;
let backgroundTexture;
let player = new Player();
let enemies = [new Enemy(...randomXYOffScreen(), Math.random() * 2 + 2)];
let scarecrow = new Scarecrow();
let scarecrowAngle = 0;
let wave = 1;
let spawning = true;
let paused = false;
let hitSound;
let gameOverSound;
let powerupSound;
let bombSound;
let gameOverFont;
let powerup = new Powerup(...randomXYOnScreen());
let bomb = new Bomb(...randomXYOnScreen());
let startTimePowerup;
let startTimeBomb;
let startTimeEnemy;
let deltaTimeEnemy = 10000;
let deltaTimePowerup = 10000;
let deltaTimeBomb = 20000;
let drawPowerup = false;
let drawBomb = false;

function preload() {
  soundFormats("mp3");
  hitSound = loadSound(
    "https://hecrabbs.github.io/chaser-game/Assets/hitSound.mp3"
  );
  gameOverSound = loadSound(
    "https://hecrabbs.github.io/chaser-game/Assets/gameOverSound.mp3"
  );
  powerupSound = loadSound(
    "https://hecrabbs.github.io/chaser-game/Assets/powerupSound.mp3"
  );
  bombSound = loadSound(
    "https://hecrabbs.github.io/chaser-game/Assets/bombSound.mp3"
  );
  playerSprite = loadImage(
    "https://hecrabbs.github.io/chaser-game/Assets/playerSprite.png"
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
  gameOverSound.setVolume(1);
  powerupSound.setVolume(1);
  bombSound.setVolume(1);
  startTimePowerup = millis();
  startTimeBomb = millis();
}

function keyReleased() {
  if (keyCode === 32 && !scarecrow.active) {
    scarecrow.used();
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

function pushOff(s1, s2) {
  let [dx, dy] = [s2.x - s1.x, s2.y - s1.y];
  const distance = Math.hypot(dx, dy);
  let overlap = s1.radius + s2.radius - distance;
  if (overlap > 0) {
    const adjustX = overlap / 2 * (dx / distance);
    const adjustY = overlap / 2 * (dy / distance);
    s1.x -= adjustX;
    s1.y -= adjustY;
    s2.x += adjustX;
    s2.y += adjustY;
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
  enemies.forEach(enemy => {
    enemy.spawner();
    enemy.render();
    enemy.move();
    enemy.timer();
    checkForDamage(player, enemy);
  });
}

function drawBackground() {
  push();
  imageMode(CORNER);
  background(backgroundTexture);
  pop();
}

function checkGameOver() {
  if (player.isDead()) {
    fill("black");
    textFont(gameOverFont);
    textSize(140);
    text("GAME OVER", width / 2, height / 2);
    textSize(60);
    text("CLICK MOUSE TO PLAY AGAIN", width / 2, height / 2 + 50);
    noLoop();
    gameOverSound.play(0, 1.3);
  }
}

function mouseClicked() {
  if (player.isDead()) {
    player.revive();
    enemies = [new Enemy(...randomXYOffScreen(), Math.random() * 2 + 2)];
    drawPowerup = false;
    drawBomb = false;
    spawning = true;
    scarecrow.active = false;
    scarecrow.timeout = false;
    startTimePowerup = millis();
    startTimeBomb = millis();
    startTimeEnemy = millis();
    wave = 1;
    loop();
    player.x = width / 2;
    player.y = height / 2;
  }
}

function draw() {
  drawBackground();
  scarecrow.check();
  doEnemyBehavior();
  powerup.giveHealth();
  bomb.removeEnemies();
  player.render();
  player.move();
  adjust();
  powerup.activate();
  bomb.activate();
  powerup.timer();
  bomb.timer();
  checkGameOver();
}

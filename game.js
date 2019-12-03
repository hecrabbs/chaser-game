class Sprite {
    constructor(x, y, color, diameter) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.diameter = diameter;
      this.radius = diameter / 2;
    }
  }
  
  class Player extends Sprite {
    constructor() {
      super(width / 2, height / 2, "pink", 30);
      this.health = 100;
      this.speed = 5;
    }
    render() {
      image(sprite, this.x, this.y, 100, 100);
      fill(this.color);
      circle(this.x, this.y, this.diameter);
    }
    move() {
      if (keyIsDown(68)) {
        this.x += this.speed;
      } else if (keyIsDown(65)) {
        this.x -= player.speed;
      }
      if (keyIsDown(87)) {
        this.y -= this.speed;
      } else if (keyIsDown(83)) {
        this.y += this.speed;
      }
    }
    takeHit() {
      this.health -= 1;
      healthBar.value = this.health;
    }
  }
  
  class Enemy extends Sprite {
    constructor(x, y, speed) {
      super(x, y, "rgba(200,0,80,0.5)", 50);
      this.speed = speed;
      this.following = player;
    }
    render() {
      fill(this.color);
      circle(this.x, this.y, this.diameter);
    }
    move() {
      if (hologram.active) {
        follow(this, hologram);
      } else {
        follow(this, player);
      }
    }
  }
  
  class Hologram {
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
      fill(this.color);
      rect(this.x, this.y, ...this.size);
    }
  }
  
  class PowerUp {
    constructor(){
      this.color = 'yellow';
      this.size = 10;
      this.active = false;
      this.x;
      this.y;
    }
    render(){
      fill(this.color);
      circle(this.x,this.y,this.size);
    }
  }
  
  const healthBar = document.querySelector("progress");
  const waveNumber = document.querySelector("#wave");
  let width = 1280;
  let height = 720;
  let origin = { x: width / 2, y: height / 2 };
  let sprite;
  let player = new Player();
  let hologram = new Hologram();
  let timeout = false;
  let wave = 1;
  let enemies = [];
  let spawning = true;
  let paused = false;
  
  function setup() {
    pauseButton = createButton("PAUSE");
    pauseButton.parent('buttonHolder');
    pauseButton.mousePressed(() => {
      if (!paused) {
        noLoop();
        paused = true;
      } else {
        paused = false;
        loop();
      }
    });
    cnv = createCanvas(width, height);
    cnv.style('display','block');
    cnv.parent('canvasHolder');
    imageMode(CENTER);
    rectMode(CENTER);
  }
  
  function preload() {
    sprite = loadImage(
      "https://images.unsplash.com/photo-1572537165377-627a37043464?ixlib=rb-1.2.1&q=85&fm=jpg&crop=entropy&cs=srgb&ixid=eyJhcHBfaWQiOjE0NTg5fQ"
    );
  }
  
  function keyReleased() {
    if (keyCode === 32 && !hologram.active) {
      usedHologram();
    }
  }
  
  function randomXYOnScreen() {
    let randX = Math.random() * (width + 1);
    let randY = Math.random() * (height + 1);
    return [randX, randY];
  }
  
  function randomXYOffScreen() {
    //right now this only includes the four corners, make it include a whole rectangle around screen
    let MinRangeX = Math.random() * 10 - 10;
    let MaxRangeX = Math.random() * 10 + width;
    let MinRangeY = Math.random() * 10 - 10;
    let MaxRangeY = Math.random() * 10 + height;
    let possibleX = [MinRangeX, MaxRangeX];
    let PossibleY = [MinRangeY, MaxRangeY];
    let randX = possibleX[Math.floor(Math.random() * (1 + 1))];
    let randY = possibleX[Math.floor(Math.random() * (1 + 1))];
    return [randX, randY];
  }
  
  function spawner() {
    while (enemies.length < wave * 3) {
      enemies.push(
        new Enemy(...randomXYOffScreen(), Math.random() * (4 - 2) + 2)
      );
    }
    spawning = false;
    setTimeout(() => {
      spawning = true;
      wave += 1;
    }, 10000);
    waveNumber.textContent = wave;
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
  
  function playerLeavingBoundary() {
    return {
      horizontal:
        (player.x > scene.limitX.max && keyIsDown(68)) ||
        (player.x < scene.limitX.min && keyIsDown(65)),
      vertical:
        (player.y < scene.limitY.max && keyIsDown(87)) ||
        (player.y > scene.limitY.min && keyIsDown(83))
    };
  }
  
  function usedHologram() {
    if (timeout === false) {
      hologram.active = true;
      hologram.x = player.x;
      hologram.y = player.y;
      setTimeout(() => {
        timeout = true;
        hologram.active = false;
        setTimeout(() => (timeout = false), hologram.cooldown);
      }, hologram.time);
    }
  }
  
  function collided(sprite1, sprite2) {
    const sumOfRadii = sprite1.diameter / 2 + sprite2.diameter / 2;
    const distanceBetween = Math.hypot(
      sprite1.x - sprite2.x,
      sprite1.y - sprite2.y
    );
    return distanceBetween <= sumOfRadii;
  }
  
  function adjust() {
    const characters = [player, ...enemies];
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        pushOff(characters[i], characters[j]);
      }
    }
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
  
  function checkForDamage(player, enemy) {
    if (collided(player, enemy)) {
      player.takeHit();
    }
    if (healthBar.value === 0){
      noLoop();
    }
  }
  
  function draw() {
    background("lightgreen");
    player.render();
    player.move();
    if (spawning) spawner();
    enemies.forEach(enemy => {
      enemy.render();
      checkForDamage(player, enemy);
      enemy.move();
    });
    adjust();
    if (hologram.active) {
      hologram.render();
    }
  }
  
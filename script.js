// Configurações iniciais
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const spriteSheet = new Image();
const pteroImage = new Image();
pteroImage.src = 'imggame/provas.png'; 

const cactusImages = [
  new Image(),
  new Image(),
  new Image(),
  new Image(),
  new Image()
];

cactusImages[0].src = 'imggame/adriano.png';
cactusImages[1].src = 'imggame/daniela.png';
cactusImages[2].src = 'imggame/professor.png';
cactusImages[3].src = 'imggame/valentim.png';
cactusImages[4].src = 'imggame/longato.png';

const spriteWidth = 32;
const spriteHeight = 32;
let currentFrame = 0;
let frameTimer = 0;
const frameDelay = 6;

let isJumping = false;
let isDucking = false;
let score = 0;
let scoreInterval;
let gameLoopId;

let dinoX = 190;
let dinoWidth = 100;
let dinoHeight = 100;
let dinoY = canvas.height - dinoHeight - 350;

const runFrames = [0, 1, 2, 3];
const jumpFrames = [4, 5, 6, 7];
const duckFrames = [8, 9, 10, 11];

const backgroundImage = new Image();
backgroundImage.src = 'imggame/saladeaula.jpeg';

let cacti = [];
let pteros = [];
let cactusSpeed = 5;
const speedIncrement = 0.5;
const cactusWidth = 100;
const cactusHeight = 100;
const minCactusSpacing = 1500;
const maxCactusSpacing = 2500;
const pteroWidth = 80;
const pteroHeight = 40;
const totalCactiToSpawn = 10;
const minPteroSpacing = 30;
let cactiSpawned = 0;
let cactiAvoided = 0;

let bgX = 0;
const bgSpeed = 2;
let lastCactusX = canvas.width;

function spawnCactus() {
  if (cactiSpawned >= totalCactiToSpawn) return;

  const spacing = Math.max(minCactusSpacing, 400 + Math.random() * 200);
  const newCactusX = lastCactusX + spacing;

  const randomImage = cactusImages[cactiSpawned % cactusImages.length];

  cacti.push({
    x: newCactusX,
    y: canvas.height - cactusHeight - 300,
    width: cactusWidth,
    height: cactusHeight,
    image: randomImage
  });

  // Pteros nos 3 últimos cactos
  if (cactiSpawned >= totalCactiToSpawn - 3) {
    pteros.push({
      x: newCactusX - minPteroSpacing,
      y: canvas.height - pteroHeight - 420,
      width: pteroWidth,
      height: pteroHeight
    });
  }

  lastCactusX = newCactusX;
  cactiSpawned++;
}


function drawCacti() {
  for (let i = 0; i < cacti.length; i++) {
    const cactus = cacti[i];
    cactus.x -= cactusSpeed;
    ctx.drawImage(cactus.image, cactus.x, cactus.y, cactus.width, cactus.height);

    if (cactus.x + cactus.width < 0) {
      cacti.splice(i, 1);
      i--;
      cactiAvoided++;
      cactusSpeed += speedIncrement;
      if (cactiAvoided >= totalCactiToSpawn) winAnimation();
    }

    if (checkCollision(cactus)) gameOver();
  }
}

function drawPteros() {
  for (let i = 0; i < pteros.length; i++) {
    const p = pteros[i];
    p.x -= cactusSpeed + 1;
    ctx.drawImage(pteroImage, p.x, p.y, p.width, p.height);

    if (p.x + p.width < 0) {
      pteros.splice(i, 1);
      i--;
    }

    if (checkCollision(p)) gameOver();
  }
}

function drawBackground() {
  if (!backgroundImage.complete) return;
  ctx.drawImage(backgroundImage, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, bgX + canvas.width, 0, canvas.width, canvas.height);
  bgX -= bgSpeed;
  if (bgX <= -canvas.width) bgX = 0;
}

function drawDino() {
  let frames = runFrames;
  if (isJumping) frames = jumpFrames;
  else if (isDucking) frames = duckFrames;

  if (frameTimer >= frameDelay) {
    currentFrame = (currentFrame + 1) % frames.length;
    frameTimer = 0;
  } else frameTimer++;

  const frame = frames[currentFrame];
  ctx.drawImage(
    spriteSheet,
    frame * spriteWidth,
    0,
    spriteWidth,
    spriteHeight,
    dinoX,
    dinoY,
    dinoWidth,
    dinoHeight
  );
}

function jump() {
  if (!isJumping && !isDucking) {
    isJumping = true;
    let up = true;
    let height = 0;
    const maxHeight = 150;
    const speed = 15;
    const jumpInterval = setInterval(() => {
      if (up) {
        dinoY -= speed;
        height += speed;
        if (height >= maxHeight) up = false;
      } else {
        dinoY += speed;
        height -= speed;
        if (height <= 0) {
          clearInterval(jumpInterval);
          isJumping = false;
        }
      }
    }, 16);
  }
}

function checkCollision(obstacle) {
  let paddingX = 35;
  let paddingY = 30;
  if (obstacle.y < canvas.height - cactusHeight - 350) {
    paddingX = 10;
    paddingY = 10;
  }
  return (
    dinoX + paddingX < obstacle.x + obstacle.width &&
    dinoX + dinoWidth - paddingX > obstacle.x &&
    dinoY + paddingY < obstacle.y + obstacle.height &&
    dinoY + dinoHeight - paddingY > obstacle.y
  );
}

function gameOver() {
  cancelAnimationFrame(gameLoopId);
  clearInterval(scoreInterval);
  localStorage.setItem("finalScore", score);
  window.location.href = "gameover.html";
}

function winAnimation() {
  cancelAnimationFrame(gameLoopId);
  clearInterval(scoreInterval);
  let moveInterval = setInterval(() => {
    dinoX += 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawDino();
    if (dinoX > canvas.width) {
      clearInterval(moveInterval);
      localStorage.setItem("finalScore", score);
      window.location.href = "you-win.html";
    }
  }, 10);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  spawnCactus();
  drawCacti();
  drawPteros();
  drawDino();
  gameLoopId = requestAnimationFrame(gameLoop);
}

function startScore() {
  const scoreDisplay = document.getElementById("score");
  score = 0;
  scoreInterval = setInterval(() => {
    score++;
    scoreDisplay.textContent = `Pontuação: ${score}`;
  }, 100);
}

function selectCharacter(spriteName) {
  spriteSheet.src = `imggame/${spriteName}`;
  document.getElementById("select-screen").style.display = "none";
  document.getElementById("game").style.display = "block";
  startScore();
  gameLoop();
}

spriteSheet.onload = () => {};

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !isDucking) jump();
  if (event.code === "ArrowDown") {
    isDucking = true;
    dinoHeight = 70;
    dinoY = Math.min(dinoY + 30, canvas.height - dinoHeight - 350);
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "ArrowDown") {
    isDucking = false;
    dinoHeight = 100;
    dinoY = canvas.height - dinoHeight - 350;
  }
});

window.selectCharacter = selectCharacter;

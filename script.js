const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajuste o tamanho do canvas
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

// Variáveis
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
let dinoY = canvas.height - dinoHeight - 350; // ajustado para o "chão"

const runFrames = [0, 1, 2, 3];
const jumpFrames = [4, 5, 6, 7];
const duckFrames = [8, 9, 10, 11];

const backgroundImage = new Image();
backgroundImage.src = 'imggame/saladeaula.jpeg';

let cacti = [];
const cactusSpeed = 4;
const cactusWidth = 100;
const cactusHeight = 100;
const cactusInterval = 1500;
let cactiAvoided = 0;  // Contagem de cactos evitados
const maxCactiAvoided = 5; // Limite de cactos a evitar antes de parar o spawn
const maxCactiToSpawn = 5;
let cactiSpawned = 0;


let pteros = [];
const pteroSpeed = 6;
const pteroWidth = 80;
const pteroHeight = 40;
const pteroInterval = 3000; 
const maxPteros = 2; // Limite de pterossauros na tela

let bgX = 0;
const bgSpeed = 2;

let cactusSpawnInterval; // Variável para controlar o intervalo de spawn de cactos

// Função de spawn de cactos
function spawnCactus() {
  if (cactiSpawned >= maxCactiToSpawn) return;

  const randomImage = cactusImages[cactiSpawned]; // uma imagem diferente por ordem

  cacti.push({
    x: canvas.width,
    y: canvas.height - cactusHeight - 300,
    width: cactusWidth,
    height: cactusHeight,
    image: randomImage
  });

  cactiSpawned++;
}

// Função de spawn de pterossauros
function spawnPtero() {
  if (pteros.length < maxPteros) { // Verifica se o número de pterossauros é menor que o limite
    pteros.push({
      x: canvas.width,
      y: canvas.height - pteroHeight - 420, // altura média (voando)
      width: pteroWidth,
      height: pteroHeight
    });
  }
}
setInterval(spawnPtero, pteroInterval);

// Iniciar a geração de cactos (intervalo ajustado)
cactusSpawnInterval = setInterval(spawnCactus, cactusInterval);

// Função de desenhar os cactos na tela
function drawCacti() {
  for (let i = 0; i < cacti.length; i++) {
    const cactus = cacti[i];
    cactus.x -= cactusSpeed;

    ctx.drawImage(cactus.image, cactus.x, cactus.y, cactus.width, cactus.height);

    if (cactus.x + cactus.width < 0) {
      cacti.splice(i, 1);
      i--;
      cactiAvoided++;

      if (cactiAvoided >= 5) {
        winAnimation();
      }
    }

    if (checkCollision(cactus)) {
      gameOver();
    }
  }
}


// Função para desenhar os pterossauros na tela
function drawPteros() {
  for (let i = 0; i < pteros.length; i++) {
    const p = pteros[i];
    p.x -= pteroSpeed;
    ctx.drawImage(pteroImage, p.x, p.y, p.width, p.height);

    if (p.x + p.width < 0) {
      pteros.splice(i, 1);
      i--;
    }

    if (checkCollision(p)) {
      gameOver();
    }
  }
}

// Função para desenhar o fundo
function drawBackground() {
  if (!backgroundImage.complete) return;

  ctx.drawImage(backgroundImage, bgX, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, bgX + canvas.width, 0, canvas.width, canvas.height);

  bgX -= bgSpeed;
  if (bgX <= -canvas.width) {
    bgX = 0;
  }
}

// Função para desenhar o personagem
function drawDino() {
  let frames = runFrames;
  if (isJumping) frames = jumpFrames;
  else if (isDucking) frames = duckFrames;

  if (frameTimer >= frameDelay) {
    currentFrame = (currentFrame + 1) % frames.length;
    frameTimer = 0;
  } else {
    frameTimer++;
  }

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

// Função de pulo
function jump() {
  if (!isJumping && !isDucking) { // Só pula se não estiver abaixado
    isJumping = true;
    let up = true;
    let height = 0;
    const maxHeight = 150; // Altura do pulo
    const speed = 15; // Velocidade do pulo

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
    }, 16); // Intervalo mais rápido que 20ms
  }
}

// Função para verificar colisão com os cactos e outros obstáculos
function checkCollision(obstacle) {
  let paddingX = 35;
  let paddingY = 30;

  // Se for pterossauro (obstáculo aéreo), use hitbox mais sensível
  if (obstacle.y < canvas.height - cactusHeight - 350) {
    paddingX = 10; // mais sensível
    paddingY = 10;
  }

  return (
    dinoX + paddingX < obstacle.x + obstacle.width &&
    dinoX + dinoWidth - paddingX > obstacle.x &&
    dinoY + paddingY < obstacle.y + obstacle.height &&
    dinoY + dinoHeight - paddingY > obstacle.y
  );
}


// Função de Game Over
function gameOver() {
  cancelAnimationFrame(gameLoopId);
  clearInterval(scoreInterval);
  localStorage.setItem("finalScore", score);
  window.location.href = "gameover.html";
}

// Função de animação de vitória
function winAnimation() {
  cancelAnimationFrame(gameLoopId);
  clearInterval(scoreInterval);

  let moveInterval = setInterval(() => {
    dinoX += 10; // move para a direita
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawDino();

    if (dinoX > canvas.width) {
      clearInterval(moveInterval);
      localStorage.setItem("finalScore", score);
      window.location.href = "you-win.html"; // redireciona
    }
  }, 30);
}

// Função de Loop do Jogo
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawCacti();
  drawPteros(); 
  drawDino();
  gameLoopId = requestAnimationFrame(gameLoop);
}

// Função de iniciar a pontuação
function startScore() {
  const scoreDisplay = document.getElementById("score");
  score = 0;
  scoreInterval = setInterval(() => {
    score++;
    scoreDisplay.textContent = `Pontuação: ${score}`;
  }, 100);
}

function selectCharacter(spriteName) {
  selectedCharacter = spriteName;
  spriteSheet.src = `imggame/${spriteName}`;
  document.getElementById("select-screen").style.display = "none";
  document.getElementById("game").style.display = "block";
  startScore();
  gameLoop();
}

spriteSheet.onload = () => {};

// Função que responde à tecla pressionada para movimento
document.addEventListener("keydown", (event) => {
  if (event.code === "Space" && !isDucking) jump(); // Impede pulo enquanto abaixado
  if (event.code === "ArrowDown") { 
    isDucking = true;
    dinoHeight = 70; // Reduz a altura quando abaixar
    dinoY = Math.min(dinoY + 30, canvas.height - dinoHeight - 350); // Garante que o personagem não saia da tela
  }
});

// Função que responde à tecla solta para parar de abaixar
document.addEventListener("keyup", (event) => {
  if (event.code === "ArrowDown") {
    isDucking = false;
    dinoHeight = 100; // Restaura a altura original quando parar de abaixar
    dinoY = canvas.height - dinoHeight - 350; // Restaura a posição original
  }
});

window.selectCharacter = selectCharacter;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ajuste o tamanho do canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const spriteSheet = new Image();
spriteSheet.src = 'imggame/vitorsprites_transparent.png'; // sprite sheet
const cactusImage = new Image();
cactusImage.src= 'imggame/cactus.png';

// Variáveis
const spriteWidth = 32;
const spriteHeight = 32;
let currentFrame = 0;
let frameTimer = 0;
const frameDelay = 6;

let isJumping = false;
let isDucking = false;
let isRunning = true;

let score = 0;
let scoreInterval;
let gameLoopId;


// Centralização do player
let dinoX = 190; // X HORIZONTAL
let dinoY = canvas.height / 2 + 130; // Centralizado verticalmente na tela
let dinoWidth = 100; // LARGURA
let dinoHeight = 100; // ALTURA

// Frames da sprite
const runFrames = [0, 1, 2, 3]; // colunas 0 a 3
const jumpFrames = [4, 5, 6, 7]; // colunas 4 a 7
const duckFrames = [8, 9, 10, 11]; // colunas 8 a 11

// Fundo
const backgroundImage = new Image();
backgroundImage.src = 'imggame/saladeaula.jpeg'; // caminho da imagem do fundo

let cacti = []; // array do cacto
const cactusSpeed = 4;
const cactusWidth = 50;
const cactusHeight = 80;
const cactusInterval = 1500; // intervalo de criação (ms)


let bgX = 0;
const bgSpeed = 2;
function spawnCactus() {
    cacti.push({
        x: canvas.width,
        y: canvas.height - cactusHeight - 280,
        width: cactusWidth,
        height: cactusHeight
    });
}

setInterval(spawnCactus, cactusInterval);

function drawCacti() {
    for (let i = 0; i < cacti.length; i++) {
        const cactus = cacti[i];
        cactus.x -= cactusSpeed;
        ctx.drawImage(cactusImage, cactus.x, cactus.y, cactus.width, cactus.height);

        // Remove cactos que saíram da tela
        if (cactus.x + cactus.width < 0) {
            cacti.splice(i, 1);
            i--;
        }

        // Colisão
        if (checkCollision(cactus)) {
            gameOver();
        }
    }
}

function drawBackground() {
    if (!backgroundImage.complete) return; // Verifica se a imagem do fundo foi carregada

    // Desenha duas cópias do fundo
    ctx.drawImage(backgroundImage, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, bgX + canvas.width, 0, canvas.width, canvas.height);

    // Move o fundo para a esquerda
    bgX -= bgSpeed;

    // Quando o fundo sair da tela, reinicia
    if (bgX <= -canvas.width) {
        bgX = 0;
    }
}

// Função para desenhar o personagem (dino)
function drawDino() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    const col = frame;
    const row = 0; // sempre linha 0, pois só há uma linha

    ctx.drawImage(
        spriteSheet,
        col * spriteWidth,
        row * spriteHeight,
        spriteWidth,
        spriteHeight,
        dinoX,
        dinoY,
        dinoWidth,
        dinoHeight
    );
}

// Função para pulo
function jump() {
    if (!isJumping && !isDucking) {
        isJumping = true;
        let up = true;
        let height = 0;

        const jumpInterval = setInterval(() => {
            if (up) {
                dinoY -= 5;
                height += 5;
                if (height >= 60) up = false;
            } else {
                dinoY += 5;
                height -= 5;
                if (height <= 0) {
                    clearInterval(jumpInterval);
                    isJumping = false;
                }
            }
        }, 20);
    }
}

    // Função de agachar
    // Função de agachar
function duck() {
    if (!isDucking && !isJumping) {
        isDucking = true;
        dinoHeight = 80; // altura menor
        dinoY += 30; // Move o personagem para baixo enquanto ele agacha (ajustado)
        setTimeout(() => {
            isDucking = false;
            dinoHeight = 100; // volta ao normal
            dinoY -= 30; // Retorna a posição para o normal
        }, 600); // tempo de agachamento
    }
}

function checkCollision(cactus) {
    return (
        dinoX < cactus.x + cactus.width &&
        dinoX + dinoWidth > cactus.x &&
        dinoY + dinoHeight > cactus.y
    );
}

function checkCollision(cactus) {
    return (
        dinoX < cactus.x + cactus.width &&
        dinoX + dinoWidth > cactus.x &&
        dinoY + dinoHeight > cactus.y
    );
}

function gameOver() {
    cancelAnimationFrame(gameLoopId); // para o loop
    clearInterval(scoreInterval);     // para o placar
    alert("Game Over! Sua pontuação foi: " + score);
    window.location.href = "gameover.html"; // redireciona para a página
}


// Função de loop do jogo
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    drawBackground();
    drawCacti();
    drawDino();
    gameLoopId = requestAnimationFrame(gameLoop);
}


// Teclado
document.addEventListener("keydown", (event) => {
    if (event.code === "Space") jump();
    if (event.code === "ArrowDown") duck();
});

// Função de iniciar a pontuação
function startScore() {
    const scoreDisplay = document.getElementById("score");
    score = 0;
    scoreInterval = setInterval(() => {
        score++;
        scoreDisplay.textContent = `Pontuação: ${score}`;
    }, 100);
}

// Seleção de personagem
function selectCharacter() {
    document.getElementById("select-screen").style.display = "none";
    document.getElementById("game").style.display = "block";
    startScore();
    gameLoop();
}

// Iniciar após imagem carregar
spriteSheet.onload = () => {
    // personagem só aparece após seleção
};

// Torna selectCharacter global
window.selectCharacter = selectCharacter;

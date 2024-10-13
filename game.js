const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const playAgainButton = document.getElementById('playAgainButton');
const titleScreen = document.getElementById('titleScreen');
const startButton = document.getElementById('startButton');

// Player object
const player = {
    x: 50,
    y: canvas.height - 50,
    width: 40,
    height: 40,
    dy: 0,
    jumpStrength: -10,
    gravity: 0.5,
    grounded: false,
    jumpsRemaining: 2, // Double jump
    canDash: true, // Dash flag
    dashCooldown: 2000, // Cooldown for dash (in milliseconds)
    dashTime: 0, // Dash duration
    dashSpeed: 10, // Speed during dash
    dashUsed: false, // Whether dash was used after start
    dash() {
        if (this.canDash) {
            this.dashTime = 10; // Dash for 10 frames
            this.canDash = false; // Disable dash until cooldown ends
            setTimeout(() => {
                this.canDash = true; // Reset dash availability after cooldown
            }, this.dashCooldown); 
        }
    },
    reset() {
        this.x = 50;
        this.y = canvas.height - this.height;
        this.dy = 0;
        this.grounded = false;
        this.jumpsRemaining = 2;
        this.canDash = true;
        this.dashTime = 0;
    },
    jump() {
        if (this.grounded) {
            this.dy = this.jumpStrength;
            this.grounded = false;
            this.jumpsRemaining = 1;
        } else if (this.jumpsRemaining > 0) {
            this.dy = this.jumpStrength;
            this.jumpsRemaining--;
        }
    },
    update() {
        // Handle dash movement
        if (this.dashTime > 0) {
            this.x += this.dashSpeed; // Move player by dash speed
            this.dashTime--; // Reduce dash time
        } else {
            // Only apply gravity when not dashing
            this.dy += this.gravity;
            this.y += this.dy;
        }

        if (this.y + this.height >= canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            this.grounded = true;
            this.jumpsRemaining = 2;
        }

        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

// Obstacle array and game state
let obstacles = [];
let score = 0;
let gameActive = false;

// Generate a new obstacle
function generateObstacle() {
    const obstacle = {
        x: canvas.width,
        y: canvas.height - Math.random() * 20 - 10, // Random height
        width: Math.random() * 20 + 10,
        height: Math.random() * 20 + 20,
    };
    obstacles.push(obstacle);
}

// Draw obstacles
function drawObstacles() {
    ctx.fillStyle = '#3498db';
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= 4;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score++;
        }
    });
}

// Bot logic to simulate jumps, double jumps, and dashes
function botAI() {
    const closestObstacle = obstacles.find(obs => obs.x > player.x && obs.x - player.x < 200);

    if (closestObstacle) {
        const obstacleDistance = closestObstacle.x - player.x;

        // If the obstacle is within jumping range and grounded
        if (obstacleDistance < 120 && player.grounded) {
            player.jump(); // First jump
        }

        // If in the air and the obstacle is still ahead (for double jump)
        if (obstacleDistance < 100 && player.jumpsRemaining > 0 && player.y > closestObstacle.y) {
            player.jump(); // Second jump (double jump)
        }

        // Use dash if obstacle is too close and dash is available
        if (obstacleDistance < 60 && player.canDash && player.grounded) {
            player.dash();
        }
    }
}

// Main game loop
function gameLoop() {
    if (!gameActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.update();
    botAI(); // Call the bot logic

    if (Math.random() < 0.03) {
        generateObstacle();
    }

    drawObstacles();

    obstacles.forEach(obstacle => {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        ) {
            gameActive = false;
            showGameOverScreen();
        }
    });

    ctx.fillStyle = '#ecf0f1';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);

    // Show dash availability
    ctx.fillText('Dash Available: ' + (player.canDash ? 'Yes' : 'No'), canvas.width - 150, 30);

    requestAnimationFrame(gameLoop);
}

// Show game over screen and auto-restart after 2 seconds
function showGameOverScreen() {
    finalScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'block';

    // Auto-click the "Play Again" button after 2 seconds
    setTimeout(() => {
        playAgainButton.click();
    }, 2000);
}

// Reset the game
function resetGame() {
    player.reset();
    obstacles = [];
    score = 0;
    gameActive = true;
    gameOverScreen.style.display = 'none';
    gameLoop();
}

// Start the game
function startGame() {
    titleScreen.style.display = 'none';
    canvas.style.display = 'block';
    resetGame();
    gameActive = true;
    gameLoop();
}

// Jump and dash key controls (for manual control)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        player.jump();
    } else if (event.code === 'Shift') {
        player.dash();
    }
});

// Play again button event listener
playAgainButton.addEventListener('click', resetGame);

// Start button event listener
startButton.addEventListener('click', startGame);

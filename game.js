// game.js

// helper functions
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// HUD Elements
const inputBox = document.getElementById('inputBox');
const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverText = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

// Ensure input box always has focus
function focusInputBox() {
    inputBox.focus();
}

// Load Images
const playerImage = new Image();
playerImage.src = 'player.png'; // Replace with your player image filename

const zombieImage = new Image();
zombieImage.src = 'zombie.png'; // Replace with your zombie image filename

const backgroundImage = new Image();
backgroundImage.src = 'background.png'; // Replace with your background image filename

const targetImage = new Image();
targetImage.src = 'target.png'; // Replace with your target image filename

const bloodImage = new Image();
bloodImage.src = 'blood.png'; // Replace with your blood image filename

// Load Sound Files
const sounds = {
    cannotShoot: new Audio('cannot-shoot.mp3'),
    gameOver: new Audio('game-over.mp3'),
    hit: new Audio('hit.mp3'),
    shoot: new Audio('shoot.mp3'),
    spawn: new Audio('spawn.mp3'),
    step: new Audio('step.mp3'),
    missed: new Audio('missed.mp3'),
};

// Preload Sound Files
for (let key in sounds) {
    sounds[key].load();
}

// Optional: Adjust Volume Levels
sounds.hit.volume = 0.7;
sounds.missed.volume = 1;
sounds.step.volume = 1;
sounds.spawn.volume = 0.2;

// Game Variables
let player;
let zombies = [];
let bloodSplatters = [];
let score = 0;
let gameOver = false;
let zombieSpeed = config.initialZombieSpeed;
let spawnRate = (config.initialSpawnRate - config.minSpawnRate) / 2 + config.minSpawnRate;
let spawnTimer = 0;
let spawnRateDirection = -1;
let gameTimer = 0;
let numberRange = config.initialNumberRange;
let canShoot = true; // Player can shoot initially
let cooldownTimer = 0; // Timer to track cooldown
let userInteracted = false; // Track if the user has interacted

// Image Loading Variables
let imagesToLoad = 5; // Number of images to load
let imagesLoadedCount = 0;

// Player Object
player = {
    x: 50,
    y: 0, // Will be set in updatePosition()
    width: 40, // Adjust size as needed
    height: 40,
    row: 0,
    color: 'blue', // Default color (used if image fails to load)
    isShooting: false,
    shootAnimationTimer: 0,
    shootAnimationDuration: 100, // Duration in milliseconds
    rotationAngle: 0, // Initial rotation angle
    moveUp: function() {
        if (this.row > 0) {
            this.row--;
            this.updatePosition();
            if (userInteracted) sounds.step.play();
        }
    },
    moveDown: function() {
        if (this.row < config.numRows - 1) {
            this.row++;
            this.updatePosition();
            if (userInteracted) sounds.step.play();
        }
    },
    updatePosition: function() {
        const rowHeight = (config.canvasHeight - config.topPadding * 2) / config.numRows;
        this.y = config.topPadding + (this.row * rowHeight) + (rowHeight / 2);
    },
    draw: function(deltaTime) {
        ctx.save();
        if (!canShoot) {
            ctx.globalAlpha = 0.5;
        }

        // Handle shooting animation
        if (this.isShooting) {
            // Blink the sprite white
            ctx.filter = 'brightness(200%)';

            // Update the animation timer
            this.shootAnimationTimer += deltaTime;
            if (this.shootAnimationTimer >= this.shootAnimationDuration) {
                // End the animation
                this.isShooting = false;
                this.shootAnimationTimer = 0;
            }
        }

        // Apply rotation
        ctx.translate(this.x + this.width / 2, this.y - this.height / 2);
        ctx.rotate(this.rotationAngle);
        ctx.translate(-this.width / 2, -this.height / 2);

        if (playerImage.complete) {
            ctx.drawImage(playerImage, 0, 0, this.width, this.height);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(0, 0, this.width, this.height);
        }
        ctx.restore();
    },
};

// Zombie Class
class Zombie {
    constructor(row) {
        this.width = 40; // Adjust size as needed
        this.height = 40;
        this.row = row;
        const rowHeight = (config.canvasHeight - config.topPadding * 2) / config.numRows;
        this.x = config.canvasWidth - this.width;
        this.y = config.topPadding + (row * rowHeight) + (rowHeight / 2);
        this.speed = zombieSpeed + (randomIntFromInterval(0, 30) / 100);
        this.problem = this.generateProblem();
        this.answer = eval(this.problem);

        // Animation properties
        this.state = 'alive';
        this.dyingAnimationTimer = 0;
        this.dyingAnimationDuration = 500; // Duration in milliseconds
        this.angle = 0; // For toppling over
        this.bobbingAngle = Math.random() * Math.PI * 2; // Random start angle
        this.bobbingSpeed = 0.05; // Adjust speed as needed
        this.bobbingOffset = 0;
        this.shouldRemove = false; // Flag for removal
    }

    generateProblem() {
        let num1, num2, operator, result;

        do {
            let operators = ['+', '-'];
            operator = operators[Math.floor(Math.random() * operators.length)];

            if (operator === '+') {
                num1 = Math.floor(Math.random() * (numberRange + 1));
                num2 = Math.floor(Math.random() * (numberRange + 1));
            } else {
                num1 = Math.floor(Math.random() * (numberRange + 1));
                num2 = Math.floor(Math.random() * (num1 + 1)); // Ensure num2 <= num1
            }

            result = eval(`${num1} ${operator} ${num2}`);
        } while (result < config.minResult || result > config.maxResult);

        return `${num1} ${operator} ${num2}`;
    }

    update(deltaTime) {
        if (this.state === 'alive') {
            this.x -= this.speed;
        } else if (this.state === 'dying') {
            // Update the dying animation timer
            this.dyingAnimationTimer += deltaTime;
            if (this.dyingAnimationTimer >= this.dyingAnimationDuration) {
                // Mark zombie for removal
                this.shouldRemove = true;                
            } else {
                // Increase the angle for toppling over
                this.angle += (Math.PI / 2) * (deltaTime / this.dyingAnimationDuration);
            }
        }
    }

    draw() {
        ctx.save();

        // Bobbing effect
        this.bobbingOffset = Math.sin(this.bobbingAngle) * 5; // Adjust amplitude as needed

        // Update bobbing angle
        this.bobbingAngle += this.bobbingSpeed;

        // Apply transformations
        ctx.translate(this.x + this.width / 2, this.y - this.height / 2 + this.bobbingOffset);

        if (this.state === 'dying') {
            // Blink red
            ctx.filter = 'brightness(150%) sepia(100%) saturate(500%) hue-rotate(-50deg)';
            // Rotate for toppling effect
            ctx.rotate(this.angle);
        }

        if (zombieImage.complete) {
            ctx.drawImage(zombieImage, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = 'green';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        ctx.restore();

        // Draw the problem text
        ctx.font = '14px Arial';
        const text = `${this.problem} = ?`;
        const textWidth = ctx.measureText(text).width;
        const padding = 4;
        const textX = this.x + this.width / 2 - textWidth / 2;
        const textY = this.y - this.height / 2 + this.bobbingOffset - 5;
        const rectX = textX - padding;
        const rectY = textY - 14 - padding; // 14 is approx font size
        const rectWidth = textWidth + padding * 2;
        const rectHeight = 14 + padding * 2; // font size + padding top and bottom

        // Draw background rectangle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent white
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

        // Draw the problem text
        ctx.fillStyle = 'black';
        ctx.fillText(text, textX, textY);
    }
}

// Blood Class
class Blood {
    constructor(x, y, width, height) {
        this.width = width * 2; // 100% larger than the zombie
        this.height = height * 2;
        this.opacity = 0.5;

        // Random offset up to ±10% of width/height
        const offsetX = (Math.random() - 0.5) * 0.2 * this.width; // 10% of width
        const offsetY = (Math.random() - 0.5) * 0.2 * this.height; // 10% of height

        this.x = x + offsetX - this.width / 2; // Adjust position
        this.y = y + offsetY - this.height / 2;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        if (bloodImage.complete) {
            ctx.drawImage(bloodImage, this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }
}

// Handle Keyboard Input
document.addEventListener('keydown', (e) => {
    if (!userInteracted) userInteracted = true;

    if (gameOver) {
        // Restart game on Spacebar press
        if (e.code === 'Space') {
            restartGame();
        }
        return;
    }

    if (e.key === 'ArrowUp') {
        player.moveUp();
    } else if (e.key === 'ArrowDown') {
        player.moveDown();
    }
});

// Handle Answer Submission on Enter key
inputBox.addEventListener('keydown', (e) => {
    if (!userInteracted) userInteracted = true;
    if (e.key === 'Enter') {
        submitAnswer();
        e.preventDefault(); // Prevent default form submission
    }
});

// Input validation to ignore non-numeric input
inputBox.addEventListener('input', () => {
    // Remove any non-digit characters
    inputBox.value = inputBox.value.replace(/\D/g, '');
});

inputBox.addEventListener('paste', (e) => {
    e.preventDefault();
    let pasteData = (e.clipboardData || window.clipboardData).getData('text');
    // Remove non-digit characters
    pasteData = pasteData.replace(/\D/g, '');
    document.execCommand('insertText', false, pasteData);
});

// Function to submit the answer
function submitAnswer() {
    if (gameOver) return;

    if (!canShoot) {
        if (userInteracted) sounds.cannotShoot.play();
        return;
    }

    let answer = parseInt(inputBox.value.trim());
    inputBox.value = '';
    focusInputBox();

    if (isNaN(answer)) {
        // Ignore the submission
        return;
    }

    // Player shoots
    if (userInteracted) sounds.shoot.play();
    player.isShooting = true;
    player.shootAnimationTimer = 0;

    let targetZombie = getLeftmostZombieInRow(player.row);
    if (targetZombie) {
        if (answer === targetZombie.answer) {
            // Correct answer
            setTimeout(() => {
                if (userInteracted) sounds.hit.play();
            }, 100);

            // Start dying animation for the zombie
            targetZombie.state = 'dying';
            targetZombie.dyingAnimationTimer = 0;

            // Add a blood splatter at the zombie's position
            bloodSplatters.push(new Blood(
                targetZombie.x + targetZombie.width / 2,
                targetZombie.y - targetZombie.height / 2 + targetZombie.bobbingOffset,
                targetZombie.width,
                targetZombie.height
            ));

            // Increment score and update display
            score++;
            scoreDisplay.textContent = `Score: ${score}`;
        } else {
            // Incorrect answer
            setTimeout(() => {
                if (userInteracted) sounds.missed.play();
            }, 100);

            canShoot = false;
            cooldownTimer = 0;
        }
    } else {
        // No zombie to shoot at
    }
}

// Get Leftmost Zombie in Current Row
function getLeftmostZombieInRow(row) {
    let zombiesInRow = zombies.filter(z => z.row === row && z.state === 'alive');
    if (zombiesInRow.length === 0) return null;
    return zombiesInRow.reduce((leftmost, zombie) => {
        return (zombie.x < leftmost.x) ? zombie : leftmost;
    });
}

// Game Loop
let lastTimestamp = 0; // For calculating deltaTime

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // Draw blood splatters
    for (let i = 0; i < bloodSplatters.length; i++) {
        bloodSplatters[i].draw();
    }

    // Draw row highlight
    drawRowHighlight();

    if (!gameOver) {
        // Update Timers
        gameTimer += deltaTime;
        spawnTimer += deltaTime;
        if (!canShoot) {
            cooldownTimer += deltaTime;
            if (cooldownTimer >= config.missCooldown) {
                canShoot = true;
            }
        }

        // Spawn Zombies
        if (spawnTimer > spawnRate) {
            spawnZombie();
            spawnTimer = 0;
        }

        // Increase Difficulty Over Time
        if (gameTimer > config.difficultyIncreaseInterval) {
            zombieSpeed = Math.min(config.maxZombieSpeed, zombieSpeed + config.zombieSpeedIncrease);

            if(spawnRate < config.minSpawnRate){
                spawnRateDirection = 1;
            }
            else if(spawnRate > config.initialSpawnRate){
                spawnRateDirection = -1;
            }
            
            spawnRate = spawnRate + spawnRateDirection * config.spawnRateDecrease;

            numberRange = Math.min(config.maxNumberRange, numberRange + config.numberRangeIncrease);
            gameTimer = 0;
        }

        // Update Zombies
        for (let i = zombies.length - 1; i >= 0; i--) {
            let zombie = zombies[i];
            zombie.speed = zombieSpeed;
            zombie.update(deltaTime);

            // Check for Game Over
            if (zombie.x < 50 && zombie.state === 'alive') {
                endGame();
                break;
            }
        }

        // Remove zombies marked for removal
        zombies = zombies.filter(zombie => !zombie.shouldRemove);
    }

    // Draw Zombies (even after game over)
    for (let i = 0; i < zombies.length; i++) {
        zombies[i].draw();
    }

    // Draw Player
    player.draw(deltaTime);

    // Draw Target on Leftmost Zombie in Current Row (only if game is not over)
    if (!gameOver) {
        let targetZombie = getLeftmostZombieInRow(player.row);
        if (targetZombie) {
            const bobbingOffset = targetZombie.bobbingOffset;

            if (targetImage.complete) {
                ctx.drawImage(
                    targetImage,
                    targetZombie.x,
                    targetZombie.y - targetZombie.height / 2 + bobbingOffset,
                    targetZombie.width,
                    targetZombie.height
                );
            } else {
                ctx.strokeStyle = 'red';
                ctx.strokeRect(
                    targetZombie.x,
                    targetZombie.y - targetZombie.height / 2 + bobbingOffset,
                    targetZombie.width,
                    targetZombie.height
                );
            }
        }
    }

    // Draw Game Over Overlay
    if (gameOver) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Red color with 50% opacity
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    focusInputBox();
    requestAnimationFrame(gameLoop);
}

// Function to draw the row highlight
function drawRowHighlight() {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; // White with 80% opacity

    const rowHeight = (config.canvasHeight - config.topPadding * 2) / config.numRows;
    const y = config.topPadding + (player.row * rowHeight);

    ctx.fillRect(0, y, canvas.width, rowHeight);
    ctx.restore();
}

// Spawn a New Zombie
function spawnZombie() {
    let availableRows = [];
    for (let row = 0; row < config.numRows; row++) {
        let zombiesInRow = zombies.filter(z => z.row === row && z.state === 'alive');
        let tooClose = zombiesInRow.some(z => (config.canvasWidth - z.x) < config.minZombieSpacing);
        if (!tooClose) {
            availableRows.push(row);
        }
    }

    if (availableRows.length === 0) {
        // No suitable rows, do not spawn a zombie this time
        return;
    }

    let row = availableRows[Math.floor(Math.random() * availableRows.length)];

    zombies.push(new Zombie(row));
    if (userInteracted) {
        sounds.spawn.play();
    }
}

// End Game
function endGame() {
    gameOver = true;
    if (userInteracted) sounds.gameOver.play();
    gameOverText.style.display = 'block';
    restartBtn.style.display = 'inline-block';

    // Rotate player sprite to the left
    player.rotationAngle = -Math.PI / 2; // Rotate 90 degrees to the left
}

// Restart Game
function restartGame() {
    // Reset Variables
    zombies = [];
    bloodSplatters = [];
    score = 0;
    zombieSpeed = config.initialZombieSpeed;
    spawnRate = config.initialSpawnRate;
    spawnTimer = 0;
    gameTimer = 0;
    numberRange = config.initialNumberRange;
    gameOver = false;
    canShoot = true;
    cooldownTimer = 0;
    player.row = 0;
    player.updatePosition();
    player.rotationAngle = 0; // Reset rotation
    scoreDisplay.textContent = `Score: ${score}`;
    gameOverText.style.display = 'none';
    restartBtn.style.display = 'none';
    focusInputBox();
    spawnZombie();
    lastTimestamp = performance.now(); // Reset lastTimestamp
    requestAnimationFrame(gameLoop);
}

restartBtn.addEventListener('click', () => {
    restartGame();
});

// Image Loading and Game Start Logic
function imageLoaded() {
    imagesLoadedCount++;
    if (imagesLoadedCount === imagesToLoad) {
        // All images are loaded, start the game
        player.updatePosition();
        focusInputBox();
        spawnZombie();
        lastTimestamp = performance.now(); // Initialize lastTimestamp
        requestAnimationFrame(gameLoop);
    }
}

playerImage.onload = imageLoaded;
zombieImage.onload = imageLoaded;
backgroundImage.onload = imageLoaded;
targetImage.onload = imageLoaded;
bloodImage.onload = imageLoaded;

// Start Game after images are loaded
if (playerImage.complete) imagesLoadedCount++;
if (zombieImage.complete) imagesLoadedCount++;
if (backgroundImage.complete) imagesLoadedCount++;
if (targetImage.complete) imagesLoadedCount++;
if (bloodImage.complete) imagesLoadedCount++;

if (imagesLoadedCount === imagesToLoad) {
    // All images are already loaded
    player.updatePosition();
    focusInputBox();
    spawnZombie();
    lastTimestamp = performance.now(); // Initialize lastTimestamp
    requestAnimationFrame(gameLoop);
}

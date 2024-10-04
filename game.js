// game.js

// Helper Functions
function randomIntFromInterval(min, max, skipZeros = true) { // min and max included 
    let res = Math.floor(Math.random() * (max - min + 1) + min);
    if(res === 0 && skipZeros){
        return randomIntFromInterval(min, max, false);
    }

    return res;
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

// New Zombie Type Images
const ragdollImage = new Image();
ragdollImage.src = 'ragdoll.png';

const tankImage = new Image();
tankImage.src = 'tank.png';

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
    // New Zombie Type Sounds
    ragdollSpawn: new Audio('meow.mp3'),
    ragdollDeath: new Audio('catscream.mp3'),
    tankSpawn: new Audio('wroom.mp3'),
    tankDeath: new Audio('explosion.mp3'),
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

// Adjust volumes for new sounds if needed
sounds.ragdollSpawn.volume = 0.5;
sounds.ragdollDeath.volume = 0.5;
sounds.tankSpawn.volume = 0.5;
sounds.tankDeath.volume = 0.5;

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
let canShoot = true; // Player can shoot initially
let cooldownTimer = 0; // Timer to track cooldown
let userInteracted = false; // Track if the user has interacted

// Added zombieSpawnCount to keep track of total zombies spawned
let zombieSpawnCount = 0;

// Image Loading Variables
let imagesToLoad = 7; // Updated number of images to load
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
    constructor(row, type = 'regular', isTransformed = false, x = null) {
        this.type = type;
        this.width = 40; // Default size
        this.height = 40;
        this.row = row;
        const rowHeight = (config.canvasHeight - config.topPadding * 2) / config.numRows;
        this.x = x !== null ? x : config.canvasWidth - this.width;
        this.y = config.topPadding + (row * rowHeight) + (rowHeight / 2);
        this.speed = zombieSpeed + (randomIntFromInterval(0, 20) / 100);
        this.state = 'alive';
        this.dyingAnimationTimer = 0;
        this.dyingAnimationDuration = 500; // Duration in milliseconds
        this.angle = 0; // For toppling over
        this.bobbingAngle = Math.random() * Math.PI * 2; // Random start angle
        this.bobbingSpeed = 0.05; // Adjust speed as needed
        this.bobbingOffset = 0;
        this.shouldRemove = false; // Flag for removal

        // Adjust size for special zombie types
        if (this.type === 'ragdoll' || this.type === 'tank') {
            this.width *= 1.5; // Increase size by 50%
            this.height *= 1.5;
        }

        // Adjust speed for special zombie types
        if (this.type === 'ragdoll') {
            this.speed = this.speed * .4;
        }

        if (this.type === 'tank') {
            this.speed = this.speed * 1.1;
        }

        // Generate problem based on zombie type
        this.generateProblem();

        // Special properties for tank zombie transformation
        this.isTransformed = isTransformed; // Indicates if the tank has transformed into a regular zombie
    }

    generateProblem() {
        if (this.type === 'ragdoll') {
            // Generate a formula with three numbers
            let operators = ['+', '-'];
            let operator1 = operators[Math.floor(Math.random() * operators.length)];
            let operator2 = operators[Math.floor(Math.random() * operators.length)];

            let num1, num2, num3, intermediaryResult, result;

            num1 = randomIntFromInterval(config.minResult, config.maxResult);
            if (operator1 === '+') {                                        
                num2 = randomIntFromInterval(0, config.maxResult - num1);
                intermediaryResult = num1 + num2;
            } else {                    
                num2 = randomIntFromInterval(0, num1);
                intermediaryResult = num1 - num2;
            }

            if (operator2 === '+') {                                        
                num3 = randomIntFromInterval(0, config.maxResult - intermediaryResult);
            } else {                    
                num3 = randomIntFromInterval(0, intermediaryResult);
            }

            result = eval(`${num1} ${operator1} ${num2} ${operator2} ${num3}`);

            this.problem = `${num1} ${operator1} ${num2} ${operator2} ${num3}`;
            this.answer = result;
        } else {
            // Regular formula generation
            let num1, num2, operator, result;

            let operators = ['+', '-'];
            operator = operators[Math.floor(Math.random() * operators.length)];
            
            num1 = randomIntFromInterval(config.minResult, config.maxResult);

            if (operator === '+') {                                        
                num2 = randomIntFromInterval(0, config.maxResult - num1);
            } else {                    
                num2 = randomIntFromInterval(0, num1);
            }

            result = eval(`${num1} ${operator} ${num2}`);            

            this.problem = `${num1} ${operator} ${num2}`;
            this.answer = result;
        }
    }

    update(deltaTime) {
        if (this.state === 'alive') {
            this.x -= this.speed;
        } else if (this.state === 'dying') {
            // Update the dying animation timer
            this.dyingAnimationTimer += deltaTime;
            if (this.dyingAnimationTimer >= this.dyingAnimationDuration) {
                if (this.type === 'tank' && !this.isTransformed) {
                    // Transform into a regular zombie
                    this.transformIntoRegularZombie();
                } else {
                    // Mark zombie for removal
                    this.shouldRemove = true;
                }
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

        // Select sprite based on zombie type
        let imageToDraw;
        if (this.type === 'ragdoll') {
            imageToDraw = ragdollImage;
        } else if (this.type === 'tank') {
            imageToDraw = tankImage;
        } else {
            imageToDraw = zombieImage;
        }

        if (imageToDraw.complete) {
            ctx.drawImage(imageToDraw, -this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            ctx.fillStyle = 'green';
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }

        ctx.restore();

        // Draw the problem text
        ctx.font = '14px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        const text = `${this.problem} = ?`;
        const textX = this.x + this.width / 2;
        const textY = this.y - this.height / 2 + this.bobbingOffset - 10 - 25;

        // Draw background rectangle behind text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        const textMetrics = ctx.measureText(text);
        const padding = 4;
        ctx.fillRect(
            textX - textMetrics.width / 2 - padding,
            textY - 14 - padding,
            textMetrics.width + padding * 2,
            14 + padding * 2
        );

        // Draw the problem text
        ctx.fillStyle = 'black';
        ctx.fillText(text, textX, textY);
    }

    // Method to transform a tank zombie into a regular zombie
    transformIntoRegularZombie() {
        this.type = 'regular';
        this.isTransformed = true;
        this.state = 'alive';
        this.angle = 0;
        this.dyingAnimationTimer = 0;
        this.dyingAnimationDuration = 500;
        this.width = 40; // Reset to regular size
        this.height = 40;
        this.speed = zombieSpeed + (randomIntFromInterval(0, 20) / 100)
        this.generateProblem(); // Generate a new problem
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
                // Play death sound based on zombie type
                if (userInteracted) {
                    if (targetZombie.type === 'ragdoll') {
                        sounds.ragdollDeath.play();
                    } else if (targetZombie.type === 'tank' && !targetZombie.isTransformed) {
                        sounds.tankDeath.play();
                    } else {
                        sounds.hit.play();
                    }
                }
            }, 100);

            // Start dying animation for the zombie
            targetZombie.state = 'dying';
            targetZombie.dyingAnimationTimer = 0;

            // Add a blood splatter at the zombie's position (except for tank transforming)
            if (!(targetZombie.type === 'tank' && !targetZombie.isTransformed)) {
                bloodSplatters.push(new Blood(
                    targetZombie.x + targetZombie.width / 2,
                    targetZombie.y - targetZombie.height / 2 + targetZombie.bobbingOffset,
                    targetZombie.width,
                    targetZombie.height
                ));
            }

            // Increment score and update display
            score++;
            scoreDisplay.textContent = `Skóre: ${score}`;
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
        if (spawnTimer > spawnRate || zombies.length === 0) {
            spawnZombie();
            spawnTimer = 0;
        }

        // Increase Difficulty Over Time
        if (gameTimer > config.difficultyIncreaseInterval) {
            zombieSpeed = Math.min(config.maxZombieSpeed, zombieSpeed + config.zombieSpeedIncrease);

            if (spawnRate < config.minSpawnRate) {
                spawnRateDirection = 1;
            } else if (spawnRate > config.initialSpawnRate) {
                spawnRateDirection = -1;
            }

            spawnRate = spawnRate + spawnRateDirection * config.spawnRateDecrease;
            
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
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; // White with 10% opacity

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

    // Determine zombie type based on zombieSpawnCount
    zombieSpawnCount++;
    let zombieType = 'regular';

    if (zombieSpawnCount % 12 === 0) {
        zombieType = 'tank';
    } else if (zombieSpawnCount % 5 === 0) {
        zombieType = 'ragdoll';
    }

    let newZombie = new Zombie(row, zombieType);
    zombies.push(newZombie);

    // Play spawn sound based on zombie type
    if (userInteracted) {
        if (newZombie.type === 'ragdoll') {
            sounds.ragdollSpawn.play();
        } else if (newZombie.type === 'tank') {
            sounds.tankSpawn.play();
        } else {
            sounds.spawn.play();
        }
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
    spawnRate = (config.initialSpawnRate - config.minSpawnRate) / 2 + config.minSpawnRate;
    spawnTimer = 0;
    spawnRateDirection = -1;
    gameTimer = 0;    
    gameOver = false;
    canShoot = true;
    cooldownTimer = 0;
    player.row = 0;
    player.updatePosition();
    player.rotationAngle = 0; // Reset rotation
    scoreDisplay.textContent = `Skóre: ${score}`;
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

// Set onload handlers for all images
playerImage.onload = imageLoaded;
zombieImage.onload = imageLoaded;
ragdollImage.onload = imageLoaded;
tankImage.onload = imageLoaded;
backgroundImage.onload = imageLoaded;
targetImage.onload = imageLoaded;
bloodImage.onload = imageLoaded;

// Check if images are already loaded (from cache)
if (playerImage.complete) playerImage.onload();
if (zombieImage.complete) zombieImage.onload();
if (ragdollImage.complete) ragdollImage.onload();
if (tankImage.complete) tankImage.onload();
if (backgroundImage.complete) backgroundImage.onload();
if (targetImage.complete) targetImage.onload();
if (bloodImage.complete) bloodImage.onload();

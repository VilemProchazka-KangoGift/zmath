// config.js

const config = {
    numRows: 6,
    initialZombieSpeed: 0.05,
    initialSpawnRate: 15000,
    maxZombieSpeed: .2,
    minSpawnRate: 6000,
    canvasWidth: 800,
    canvasHeight: 600,
    topPadding: 80,
    initialNumberRange: 5,
    maxNumberRange: 20,
    minResult: 0,
    maxResult: 20,
    missCooldown: 3000, // Cooldown time in milliseconds after a miss
    minZombieSpacing: 100, // Minimum distance in pixels between zombies in the same row
    difficultyIncreaseInterval: 10000, // in milliseconds
    zombieSpeedIncrease: 0.01,
    spawnRateDecrease: 500, // in milliseconds
    numberRangeIncrease: 1,
};

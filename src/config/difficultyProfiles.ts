import type { DifficultyProfile } from '../engine/types.ts';

export const DEFAULT_DIFFICULTY: DifficultyProfile = {
  initialZombieSpeed: 0.004,
  maxZombieSpeed: 0.012,
  zombieSpeedIncrement: 0.0005,
  initialSpawnRate: 15000,
  minSpawnRate: 6000,
  maxSpawnRate: 15000,
  spawnRateStep: 500,
  difficultyTickInterval: 10000,
  spawnRateOscillates: true,
};

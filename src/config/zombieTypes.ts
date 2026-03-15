import type { ZombieTypeConfig } from '../engine/types.ts';

export const REGULAR: ZombieTypeConfig = {
  id: 'regular',
  spriteKey: 'zombie',
  sizeMultiplier: 1.0,
  speedMultiplier: 1.0,
  challengeDifficulty: 1,
  spawnSound: 'spawn',
  deathSound: 'hit',
  spawnFrequency: 1,
};

export const RAGDOLL: ZombieTypeConfig = {
  id: 'ragdoll',
  spriteKey: 'ragdoll',
  sizeMultiplier: 1.5,
  speedMultiplier: 0.4,
  challengeDifficulty: 2,
  spawnSound: 'ragdollSpawn',
  deathSound: 'ragdollDeath',
  spawnFrequency: 5,
};

export const TANK: ZombieTypeConfig = {
  id: 'tank',
  spriteKey: 'tank',
  sizeMultiplier: 1.5,
  speedMultiplier: 1.1,
  challengeDifficulty: 1,
  spawnSound: 'tankSpawn',
  deathSound: 'tankDeath',
  spawnFrequency: 12,
  transformOnDeath: 'regular',
  suppressBloodOnTransform: true,
};

export const ALL_ZOMBIE_TYPES: ZombieTypeConfig[] = [REGULAR, RAGDOLL, TANK];

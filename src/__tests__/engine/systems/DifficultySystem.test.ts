import { describe, it, expect } from 'vitest';
import { updateDifficultySystem } from '../../../engine/systems/DifficultySystem.ts';
import { createGameState } from '../../../engine/GameState.ts';
import { createDefaultConfig } from '../../../config/defaultConfig.ts';
import type { GameConfig } from '../../../engine/types.ts';

function createLegacyConfig(): GameConfig {
  const config = createDefaultConfig();
  config.level = { ...config.level, phases: undefined };
  return config;
}

describe('DifficultySystem', () => {
  it('ramps speed linearly during first 20s', () => {
    const config = createLegacyConfig();
    const state = createGameState(config);
    const initialSpeed = state.zombieSpeed;

    // 10s into the ramp
    updateDifficultySystem(state, config, 10_000);

    expect(state.zombieSpeed).toBeGreaterThan(initialSpeed);
    expect(state.zombieSpeed).toBeLessThan(config.level.difficulty.maxZombieSpeed);
  });

  it('ramps spawn rate faster during first 20s', () => {
    const config = createLegacyConfig();
    const state = createGameState(config);
    const initialRate = state.spawnRate;

    updateDifficultySystem(state, config, 10_000);

    // Spawn rate should decrease (faster spawning)
    expect(state.spawnRate).toBeLessThan(initialRate);
  });

  it('switches to sine oscillation after 20s', () => {
    const config = createLegacyConfig();
    const state = createGameState(config);

    // Advance past the ramp
    updateDifficultySystem(state, config, 25_000);
    const speedAt25 = state.zombieSpeed;
    const rateAt25 = state.spawnRate;

    // Advance further into the sine wave (quarter period = 15s later)
    state.difficultyTimer = 0;
    updateDifficultySystem(state, config, 35_000); // 35s = 15s into sine
    const speedAt35 = state.zombieSpeed;
    const rateAt35 = state.spawnRate;

    // Speed and spawn rate should differ as sine progresses
    expect(speedAt35).not.toBeCloseTo(speedAt25, 5);
    expect(rateAt35).not.toBeCloseTo(rateAt25, 0);
  });

  it('speed and spawn rate are inversely related in sine phase', () => {
    const config = createLegacyConfig();

    // At sine trough (t=20s + 45s = 65s, 3/4 period): few zombies, fast
    const state1 = createGameState(config);
    updateDifficultySystem(state1, config, 20_000 + 45_000);

    // At sine peak (t=20s + 15s = 35s, 1/4 period): many zombies, slow
    const state2 = createGameState(config);
    updateDifficultySystem(state2, config, 20_000 + 15_000);

    // Peak: slower speed, lower spawn rate (more frequent)
    expect(state2.zombieSpeed).toBeLessThan(state1.zombieSpeed);
    expect(state2.spawnRate).toBeLessThan(state1.spawnRate);
  });

  it('never exceeds maxZombieSpeed', () => {
    const config = createLegacyConfig();
    const state = createGameState(config);

    // Way past the ramp, deep into sine
    updateDifficultySystem(state, config, 200_000);

    expect(state.zombieSpeed).toBeLessThanOrEqual(config.level.difficulty.maxZombieSpeed);
  });

  it('never goes below minSpawnRate', () => {
    const config = createLegacyConfig();
    const state = createGameState(config);

    updateDifficultySystem(state, config, 200_000);

    expect(state.spawnRate).toBeGreaterThanOrEqual(config.level.difficulty.minSpawnRate);
  });
});

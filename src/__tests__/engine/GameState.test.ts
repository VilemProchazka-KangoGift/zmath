import { describe, it, expect } from 'vitest';
import { createGameState, resetGameState } from '../../engine/GameState.ts';
import { createDefaultConfig } from '../../config/defaultConfig.ts';

describe('GameState', () => {
  const config = createDefaultConfig();

  it('factory creates valid initial state', () => {
    const state = createGameState(config);
    expect(state.score).toBe(0);
    expect(state.gameOver).toBe(false);
    expect(state.levelComplete).toBe(false);
    expect(state.paused).toBe(false);
    expect(state.canShoot).toBe(true);
    expect(state.zombies).toHaveLength(0);
    expect(state.bloodSplatters).toHaveLength(0);
    expect(state.player.row).toBe(0);
    expect(state.zombieSpawnCount).toBe(0);
    expect(state.lawnmowers.length).toBe(config.numRows);
  });

  it('reset clears score, zombies, and timers', () => {
    const state = createGameState(config);
    state.score = 42;
    state.gameOver = true;
    state.zombieSpawnCount = 100;
    state.zombies.push({} as never);

    resetGameState(state, config);

    expect(state.score).toBe(0);
    expect(state.gameOver).toBe(false);
    expect(state.zombies).toHaveLength(0);
    expect(state.zombieSpawnCount).toBe(0);
  });

  it('lawnmowers initialized per row when enabled', () => {
    const state = createGameState(config);
    expect(state.lawnmowers).toHaveLength(6);
    for (const lm of state.lawnmowers) {
      expect(lm.state).toBe('idle');
    }
  });
});

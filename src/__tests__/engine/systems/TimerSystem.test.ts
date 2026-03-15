import { describe, it, expect } from 'vitest';
import { updateTimerSystem } from '../../../engine/systems/TimerSystem.ts';
import { createGameState } from '../../../engine/GameState.ts';
import { createDefaultConfig } from '../../../config/defaultConfig.ts';
import type { GameEvent, GameConfig } from '../../../engine/types.ts';

function createLegacyConfig(): GameConfig {
  const config = createDefaultConfig();
  // Strip phases to test legacy timer behavior
  config.level = { ...config.level, phases: undefined };
  return config;
}

describe('TimerSystem', () => {
  it('counts down and emits timerUpdate (legacy)', () => {
    const config = createLegacyConfig();
    const state = createGameState(config);
    const events: GameEvent[] = [];

    updateTimerSystem(state, config, 1000, (e) => events.push(e));

    expect(state.levelTimer).toBe(1000);
    const timerEvent = events.find(e => e.type === 'timerUpdate');
    expect(timerEvent).toBeDefined();
    if (timerEvent?.type === 'timerUpdate') {
      expect(timerEvent.remainingMs).toBe(config.level.durationMs - 1000);
    }
  });

  it('emits levelComplete when timer reaches zero (legacy)', () => {
    const config = createLegacyConfig();
    const state = createGameState(config);
    const events: GameEvent[] = [];

    updateTimerSystem(state, config, config.level.durationMs, (e) => events.push(e));

    expect(state.levelComplete).toBe(true);
    expect(events.some(e => e.type === 'levelComplete')).toBe(true);
  });

  it('does not emit levelComplete twice (legacy)', () => {
    const config = createLegacyConfig();
    const state = createGameState(config);
    state.levelTimer = config.level.durationMs;
    state.levelComplete = true;
    const events: GameEvent[] = [];

    updateTimerSystem(state, config, 1000, (e) => events.push(e));

    expect(events.filter(e => e.type === 'levelComplete')).toHaveLength(0);
  });

  it('emits phase remaining time for phase-based levels', () => {
    const config = createDefaultConfig();
    const state = createGameState(config);
    // Phase-based: state.phase should be set
    expect(state.phase).not.toBeNull();

    const events: GameEvent[] = [];
    // Simulate past the announce phase
    state.phase!.announcing = false;

    updateTimerSystem(state, config, 1000, (e) => events.push(e));

    const timerEvent = events.find(e => e.type === 'timerUpdate');
    expect(timerEvent).toBeDefined();
    // Should NOT set levelComplete for phase-based levels
    expect(state.levelComplete).toBe(false);
  });
});

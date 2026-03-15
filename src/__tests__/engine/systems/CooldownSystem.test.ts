import { describe, it, expect, vi } from 'vitest';
import { updateCooldownSystem } from '../../../engine/systems/CooldownSystem.ts';
import { createGameState } from '../../../engine/GameState.ts';
import { createDefaultConfig } from '../../../config/defaultConfig.ts';
import type { GameEvent } from '../../../engine/types.ts';

describe('CooldownSystem', () => {
  const config = createDefaultConfig();

  it('does nothing when canShoot is true', () => {
    const state = createGameState(config);
    state.canShoot = true;
    const emit = vi.fn();

    updateCooldownSystem(state, config, 5000, emit);

    expect(emit).not.toHaveBeenCalled();
    expect(state.canShoot).toBe(true);
  });

  it('tracks cooldown time', () => {
    const state = createGameState(config);
    state.canShoot = false;
    state.cooldownTimer = 0;

    updateCooldownSystem(state, config, 1000, vi.fn());

    expect(state.cooldownTimer).toBe(1000);
    expect(state.canShoot).toBe(false);
  });

  it('restores canShoot after cooldown expires', () => {
    const state = createGameState(config);
    state.canShoot = false;
    state.cooldownTimer = 0;
    const events: GameEvent[] = [];

    updateCooldownSystem(state, config, config.missCooldownMs, (e) => events.push(e));

    expect(state.canShoot).toBe(true);
    expect(events.some(e => e.type === 'cooldownEnded')).toBe(true);
  });
});

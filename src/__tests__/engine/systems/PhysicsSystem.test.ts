import { describe, it, expect, vi } from 'vitest';
import { updatePhysicsSystem } from '../../../engine/systems/PhysicsSystem.ts';
import { createGameState } from '../../../engine/GameState.ts';
import { createDefaultConfig } from '../../../config/defaultConfig.ts';
import { createZombie } from '../../../engine/entities/Zombie.ts';
import { REGULAR } from '../../../config/zombieTypes.ts';
import type { GameEvent } from '../../../engine/types.ts';

const challenge = { display: '1+1=?', answer: '2', inputType: 'numeric' as const };

describe('PhysicsSystem', () => {
  const config = createDefaultConfig();

  it('moves alive zombies left by speed*dt', () => {
    const state = createGameState(config);
    const zombie = createZombie(1, 0, REGULAR, challenge, 0.1, config);
    const startX = zombie.x;
    state.zombies.push(zombie);

    updatePhysicsSystem(state, config, 100, vi.fn(), vi.fn());

    expect(zombie.x).toBeLessThan(startX);
  });

  it('does not move dying zombies horizontally', () => {
    const state = createGameState(config);
    const zombie = createZombie(1, 0, REGULAR, challenge, 0.1, config);
    zombie.state = 'dying';
    const startX = zombie.x;
    state.zombies.push(zombie);

    updatePhysicsSystem(state, config, 100, vi.fn(), vi.fn());

    expect(zombie.x).toBe(startX);
  });

  it('triggers game over when zombie reaches player with no lawnmower', () => {
    const state = createGameState(config);
    // Remove lawnmowers
    state.lawnmowers = [];
    const zombie = createZombie(1, 0, REGULAR, challenge, 0.1, config);
    zombie.x = config.playerX - 1; // past threshold
    state.zombies.push(zombie);

    const events: GameEvent[] = [];
    updatePhysicsSystem(state, config, 0, (e) => events.push(e), vi.fn());

    expect(state.gameOver).toBe(true);
    expect(events.some(e => e.type === 'gameOver')).toBe(true);
  });

  it('triggers lawnmower when zombie reaches player with lawnmower', () => {
    const state = createGameState(config);
    const zombie = createZombie(1, 0, REGULAR, challenge, 0.1, config);
    zombie.x = config.playerX - 1;
    state.zombies.push(zombie);

    const events: GameEvent[] = [];
    updatePhysicsSystem(state, config, 0, (e) => events.push(e), vi.fn());

    expect(state.gameOver).toBe(false);
    expect(state.lawnmowers[0].state).toBe('active');
    expect(events.some(e => e.type === 'lawnmowerTriggered')).toBe(true);
  });
});

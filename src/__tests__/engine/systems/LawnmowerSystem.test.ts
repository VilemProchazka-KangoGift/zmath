import { describe, it, expect, vi } from 'vitest';
import { updatePhysicsSystem } from '../../../engine/systems/PhysicsSystem.ts';
import { updateAnimationSystem } from '../../../engine/systems/AnimationSystem.ts';
import { createGameState } from '../../../engine/GameState.ts';
import { createDefaultConfig } from '../../../config/defaultConfig.ts';
import { createZombie } from '../../../engine/entities/Zombie.ts';
import { REGULAR } from '../../../config/zombieTypes.ts';
import type { GameEvent } from '../../../engine/types.ts';

const challenge = { display: '1+1=?', answer: '2', inputType: 'numeric' as const };

describe('LawnmowerSystem lifecycle', () => {
  const config = createDefaultConfig();

  it('idle lawnmower activates when zombie reaches threshold', () => {
    const state = createGameState(config);
    const zombie = createZombie(1, 0, REGULAR, challenge, 0.1, config);
    zombie.x = config.playerX - 1;
    state.zombies.push(zombie);

    updatePhysicsSystem(state, config, 0, vi.fn(), vi.fn());

    expect(state.lawnmowers[0].state).toBe('active');
  });

  it('active lawnmower sweeps and destroys zombies in its row', () => {
    const state = createGameState(config);
    state.lawnmowers[0].state = 'active';
    state.lawnmowers[0].x = 100;

    const z1 = createZombie(1, 0, REGULAR, challenge, 0.1, config);
    z1.x = 50; // left of lawnmower
    const z2 = createZombie(2, 0, REGULAR, challenge, 0.1, config);
    z2.x = 200; // right of lawnmower (should survive for now)
    const z3 = createZombie(3, 1, REGULAR, challenge, 0.1, config);
    z3.x = 50; // different row, should survive
    state.zombies.push(z1, z2, z3);

    updateAnimationSystem(state, 0, config.canvas.width);

    // z1 should be removed (x=50 <= lawnmower x=100), z3 in different row survives
    expect(state.zombies.find(z => z.id === 1)).toBeUndefined();
    expect(state.zombies.find(z => z.id === 3)).toBeDefined();
  });

  it('lawnmower becomes used after exiting screen', () => {
    const state = createGameState(config);
    state.lawnmowers[0].state = 'active';
    state.lawnmowers[0].x = config.canvas.width - 1;

    // Move lawnmower past screen edge
    updateAnimationSystem(state, 100, config.canvas.width);

    expect(state.lawnmowers[0].state).toBe('used');
  });

  it('game over when zombie reaches threshold and no lawnmower available', () => {
    const state = createGameState(config);
    state.lawnmowers[0].state = 'used'; // row 0 lawnmower consumed

    const zombie = createZombie(1, 0, REGULAR, challenge, 0.1, config);
    zombie.x = config.playerX - 1;
    state.zombies.push(zombie);

    const events: GameEvent[] = [];
    updatePhysicsSystem(state, config, 0, (e) => events.push(e), vi.fn());

    expect(state.gameOver).toBe(true);
    expect(events.some(e => e.type === 'gameOver')).toBe(true);
  });
});

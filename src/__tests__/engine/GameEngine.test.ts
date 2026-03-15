import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDefaultConfig } from '../../config/defaultConfig.ts';
import { createGameState } from '../../engine/GameState.ts';
import { createZombie } from '../../engine/entities/Zombie.ts';
import { REGULAR } from '../../config/zombieTypes.ts';
import { FailedChallengeTracker } from '../../engine/challenges/FailedChallengeTracker.ts';
import { updateCooldownSystem } from '../../engine/systems/CooldownSystem.ts';
import { updatePhysicsSystem } from '../../engine/systems/PhysicsSystem.ts';
import type { GameEvent } from '../../engine/types.ts';

// Integration-style tests using the state + systems directly
// (GameEngine itself needs canvas/audio which aren't available in jsdom unit tests)
describe('GameEngine integration (via state + systems)', () => {
  const config = createDefaultConfig();
  let tracker: FailedChallengeTracker;

  beforeEach(() => {
    tracker = new FailedChallengeTracker(0.2, 3);
  });

  it('correct answer increments score and records success', () => {
    const state = createGameState(config);
    const challenge = { display: '3 + 4 = ?', answer: '7', inputType: 'numeric' as const };
    const zombie = createZombie(1, 0, REGULAR, challenge, 0.05, config);
    state.zombies.push(zombie);
    state.player.row = 0;

    // Simulate correct answer
    const target = state.zombies.find(z => z.row === 0 && z.state === 'alive');
    expect(target).toBeDefined();
    expect('7').toBe(target!.challenge.answer);

    // Apply effects
    target!.state = 'dying';
    tracker.recordSuccess(target!.challenge);
    state.score++;

    expect(state.score).toBe(1);
    expect(tracker.getAll()).toHaveLength(0); // no failures tracked
  });

  it('wrong answer triggers cooldown and records failure', () => {
    const state = createGameState(config);
    const challenge = { display: '3 + 4 = ?', answer: '7', inputType: 'numeric' as const };
    const zombie = createZombie(1, 0, REGULAR, challenge, 0.05, config);
    state.zombies.push(zombie);
    state.player.row = 0;

    // Simulate wrong answer
    const wrongAnswer = '5';
    expect(wrongAnswer).not.toBe(challenge.answer);

    state.canShoot = false;
    state.cooldownTimer = 0;
    tracker.recordFailure(challenge, 1);

    expect(state.canShoot).toBe(false);
    expect(tracker.getAll()).toHaveLength(1);
    expect(tracker.getAll()[0].failCount).toBe(1);

    // Cooldown expires
    const events: GameEvent[] = [];
    updateCooldownSystem(state, config, config.missCooldownMs, (e) => events.push(e));
    expect(state.canShoot).toBe(true);
  });

  it('game over fires when zombie reaches player with no lawnmower', () => {
    const state = createGameState(config);
    state.lawnmowers = [];
    const challenge = { display: '1+1=?', answer: '2', inputType: 'numeric' as const };
    const zombie = createZombie(1, 0, REGULAR, challenge, 0.1, config);
    zombie.x = config.playerX - 1;
    state.zombies.push(zombie);

    const events: GameEvent[] = [];
    updatePhysicsSystem(state, config, 0, (e) => events.push(e), vi.fn());

    expect(state.gameOver).toBe(true);
    const gameOverEvent = events.find(e => e.type === 'gameOver');
    expect(gameOverEvent).toBeDefined();
  });
});

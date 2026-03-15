import type { GameState, GameConfig, GameEvent } from '../types.ts';

const DYING_DURATION = 500;
const MIN_ZOMBIE_GAP = 70; // minimum px between zombies in the same row

export function updatePhysicsSystem(
  state: GameState,
  config: GameConfig,
  dt: number,
  emit: (event: GameEvent) => void,
  playSound: (id: string) => void,
  playLoop?: (soundId: string, key: string) => void,
): void {
  for (let i = state.zombies.length - 1; i >= 0; i--) {
    const zombie = state.zombies[i];

    if (zombie.state === 'alive') {
      zombie.x -= zombie.speed * dt;

      // Check if zombie reached the left threshold
      if (zombie.x < config.playerX) {
        // Check for lawnmower (idle = trigger it, active = sweep in progress)
        const idleMower = state.lawnmowers.find(
          lm => lm.row === zombie.row && lm.state === 'idle',
        );
        const activeMower = state.lawnmowers.find(
          lm => lm.row === zombie.row && lm.state === 'active',
        );

        if (idleMower) {
          idleMower.state = 'active';
          emit({ type: 'lawnmowerTriggered', row: zombie.row });
          emit({ type: 'zombieReachedEnd', challenge: zombie.challenge });
          if (playLoop) {
            playLoop('lawnmower', `lawnmower-${zombie.row}`);
          }
        } else if (activeMower) {
          // Sweep in progress — zombie will be caught by AnimationSystem
        } else {
          // No protection — game over
          emit({ type: 'zombieReachedEnd', challenge: zombie.challenge });
          state.gameOver = true;
          state.player.rotationAngle = -Math.PI / 2;
          playSound('gameOver');
          emit({ type: 'gameOver', finalScore: state.score });
          return;
        }
      }
    } else if (zombie.state === 'dying') {
      zombie.dyingAnimationTimer += dt;
      if (zombie.dyingAnimationTimer >= DYING_DURATION) {
        if (zombie.typeConfig.transformOnDeath && !zombie.isTransformed) {
          // Transform (tank -> regular)
          zombie.shouldRemove = true;
        } else {
          zombie.shouldRemove = true;
        }
      } else {
        zombie.angle += (Math.PI / 2) * (dt / DYING_DURATION);
      }
    }
  }

  // Prevent alive zombies from overlapping in the same row.
  // For each row, sort by x and push back any zombie that's too close
  // to the one ahead of it (further left).
  for (let row = 0; row < config.numRows; row++) {
    const rowZombies = state.zombies
      .filter(z => z.row === row && z.state === 'alive')
      .sort((a, b) => a.x - b.x); // leftmost first

    for (let j = 1; j < rowZombies.length; j++) {
      const ahead = rowZombies[j - 1];
      const behind = rowZombies[j];
      const gap = behind.x - ahead.x;
      if (gap < MIN_ZOMBIE_GAP) {
        behind.x = ahead.x + MIN_ZOMBIE_GAP;
      }
    }
  }

  // Remove zombies marked for removal
  state.zombies = state.zombies.filter(z => !z.shouldRemove);
}

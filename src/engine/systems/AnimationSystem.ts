import type { GameState } from '../types.ts';

const BOBBING_SPEED = 0.05;
const BOBBING_AMPLITUDE = 5;
const SHOOT_ANIMATION_DURATION = 100;
const LAWNMOWER_SWEEP_SPEED = 0.8; // pixels per ms

export function updateAnimationSystem(
  state: GameState,
  dt: number,
  canvasWidth: number,
  playSound?: (id: string) => void,
  stopLoop?: (key: string) => void,
): void {
  // Bobbing for alive zombies
  for (const zombie of state.zombies) {
    if (zombie.state === 'alive') {
      zombie.bobbingAngle += BOBBING_SPEED;
      zombie.bobbingOffset = Math.sin(zombie.bobbingAngle) * BOBBING_AMPLITUDE;
    }
  }

  // Player shoot flash
  if (state.player.isShooting) {
    state.player.shootAnimationTimer += dt;
    if (state.player.shootAnimationTimer >= SHOOT_ANIMATION_DURATION) {
      state.player.isShooting = false;
      state.player.shootAnimationTimer = 0;
    }
  }

  // Lawnmower sweep animation
  for (const lm of state.lawnmowers) {
    if (lm.state === 'active') {
      lm.x += LAWNMOWER_SWEEP_SPEED * dt;

      // Destroy all alive zombies in this row
      for (const zombie of state.zombies) {
        if (zombie.row === lm.row && zombie.state === 'alive' && zombie.x <= lm.x) {
          zombie.shouldRemove = true;
          // Play zombie death sound when lawnmower kills them
          if (playSound) {
            playSound(zombie.typeConfig.deathSound);
          }
        }
      }

      // Remove swept zombies
      state.zombies = state.zombies.filter(z => !z.shouldRemove);

      if (lm.x > canvasWidth) {
        lm.state = 'used';
        // Stop lawnmower sound when it reaches the edge
        if (stopLoop) {
          stopLoop(`lawnmower-${lm.row}`);
        }
      }
    }
  }
}

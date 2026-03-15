import type { GameState, GameConfig, GameEvent } from '../types.ts';

// LawnmowerSystem handles idle -> active transition when a zombie reaches the threshold.
// The actual sweep animation is handled by AnimationSystem.
// PhysicsSystem checks for lawnmower before declaring game over.

export function updateLawnmowerSystem(
  state: GameState,
  _config: GameConfig,
  _dt: number,
  _emit: (event: GameEvent) => void,
): void {
  // Active lawnmowers that have swept past all zombies in their row
  // and become 'used' are already handled by AnimationSystem.
  // This system exists as an extension point for future lawnmower mechanics.

  // Clean up: if a lawnmower is 'active' and there are no alive zombies in its row,
  // the animation system will continue moving it until off-screen.

  // Nothing additional needed — lifecycle handled by PhysicsSystem (trigger)
  // and AnimationSystem (sweep + state transition).
  void state;
}

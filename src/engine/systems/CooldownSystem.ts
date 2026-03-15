import type { GameState, GameConfig, GameEvent } from '../types.ts';

export function updateCooldownSystem(
  state: GameState,
  config: GameConfig,
  dt: number,
  emit: (event: GameEvent) => void,
): void {
  if (state.canShoot) return;

  state.cooldownTimer += dt;
  if (state.cooldownTimer >= config.missCooldownMs) {
    state.canShoot = true;
    state.cooldownTimer = 0;
    emit({ type: 'cooldownEnded' });
  }
}

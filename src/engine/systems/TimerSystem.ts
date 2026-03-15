import type { GameState, GameConfig, GameEvent } from '../types.ts';
import { getCurrentPhaseRemainingMs } from './PhaseSystem.ts';

export function updateTimerSystem(
  state: GameState,
  config: GameConfig,
  dt: number,
  emit: (event: GameEvent) => void,
): void {
  state.levelTimer += dt;

  // Phase-based levels: report current phase remaining time, skip levelComplete
  if (state.phase && config.level.phases && config.level.phases.length > 0) {
    const remaining = getCurrentPhaseRemainingMs(state, config);
    emit({ type: 'timerUpdate', remainingMs: remaining, elapsedMs: state.levelTimer });
    // PhaseSystem handles levelComplete for phase-based levels
    return;
  }

  // Legacy timer behavior
  const remaining = Math.max(0, config.level.durationMs - state.levelTimer);
  emit({ type: 'timerUpdate', remainingMs: remaining, elapsedMs: state.levelTimer });

  if (remaining <= 0 && !state.levelComplete) {
    state.levelComplete = true;
    emit({ type: 'levelComplete', score: state.score });
  }
}

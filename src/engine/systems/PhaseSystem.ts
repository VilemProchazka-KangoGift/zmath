import type {
  GameState,
  GameConfig,
  GameEvent,
  ActivePhaseConfig,
  PhaseDefinition,
  DifficultyProfile,
} from '../types.ts';

const DEFAULT_ANNOUNCE_DURATION = 2000;
const VICTORY_DURATION = 3000;
const BREATHER_FALLBACK_EXTRA = 3000;

function intersectOps(base: string[], preferred?: string[]): string[] {
  if (!preferred || preferred.length === 0) return base;
  const result = base.filter(op => preferred.includes(op));
  return result.length > 0 ? result : base;
}

function clampRange(phaseVal: number | undefined, configVal: number, isMin: boolean): number {
  if (phaseVal === undefined) return configVal;
  return isMin ? Math.max(phaseVal, configVal) : Math.min(phaseVal, configVal);
}

export function getActivePhaseConfig(config: GameConfig, state: GameState): ActivePhaseConfig | null {
  if (!state.phase || !config.level.phases || config.level.phases.length === 0) return null;

  const phase = config.level.phases[state.phase.currentPhaseIndex];
  if (!phase) return null;

  // Merge difficulty: phase overrides over level base
  const baseDiff = config.level.difficulty;
  const mergedDiff: DifficultyProfile = phase.difficulty
    ? { ...baseDiff, ...phase.difficulty }
    : baseDiff;

  // Operations: intersect phase preferences with config (already user-intersected)
  const mathOperations = intersectOps(config.mathOperations, phase.preferredOperations);

  // Result ranges: phase can tighten but not exceed user settings
  const maxResult = clampRange(phase.maxResult, config.maxResult, false);
  const minResult = clampRange(phase.minResult, config.minResult, true);

  const spawningEnabled = phase.type !== 'breather' && phase.type !== 'victory';

  return {
    difficulty: mergedDiff,
    zombieTypes: phase.zombieTypes ?? config.level.zombieTypes,
    ragdollFrequency: phase.ragdollFrequency ?? config.ragdollFrequency,
    tankFrequency: phase.tankFrequency ?? config.tankFrequency,
    maxResult,
    minResult,
    mathOperations,
    spawningEnabled,
    challengeDifficulty: phase.challengeDifficulty,
  };
}

function getAliveCount(state: GameState): number {
  return state.zombies.filter(z => z.state === 'alive').length;
}

function isPhaseComplete(phase: PhaseDefinition, state: GameState): boolean {
  const ps = state.phase!;

  switch (phase.type) {
    case 'warmup':
    case 'wave':
      return ps.phaseTimer >= phase.durationMs;

    case 'breather': {
      const timerExpired = ps.phaseTimer >= phase.durationMs;
      if (timerExpired && getAliveCount(state) === 0) return true;
      // Fallback: timer + extra time even if zombies remain
      if (ps.phaseTimer >= phase.durationMs + BREATHER_FALLBACK_EXTRA) return true;
      return false;
    }

    case 'boss': {
      // All boss zombies killed
      if (ps.bossSpawned > 0 && ps.bossSpawned >= (phase.bossSpawnCount ?? 1)) {
        const allDead = ps.bossZombieIds.every(id => {
          const z = state.zombies.find(z => z.id === id);
          return !z || z.state === 'dying' || z.shouldRemove;
        });
        if (allDead) return true;
      }
      // Safety timeout
      if (phase.durationMs > 0 && ps.phaseTimer >= phase.durationMs) return true;
      return false;
    }

    case 'victory':
      return ps.phaseTimer >= VICTORY_DURATION;

    default:
      return ps.phaseTimer >= phase.durationMs;
  }
}

function advanceToPhase(
  state: GameState,
  config: GameConfig,
  phaseIndex: number,
  emit: (event: GameEvent) => void,
): void {
  const phases = config.level.phases!;
  const ps = state.phase!;

  ps.currentPhaseIndex = phaseIndex;
  ps.phaseTimer = 0;
  ps.bossZombieIds = [];
  ps.bossSpawned = 0;
  ps.phaseComplete = false;

  const phase = phases[phaseIndex];
  if (!phase) return;

  // Start announcement
  const announceText = phase.announceText ?? '';
  if (announceText) {
    ps.announcing = true;
    ps.announceTimer = 0;
    ps.announceText = announceText;
    emit({ type: 'phaseAnnounce', text: announceText });
  } else {
    ps.announcing = false;
  }

  // Reset difficulty for new phase (sine ramp restarts)
  const phaseConfig = getActivePhaseConfig(config, state);
  if (phaseConfig) {
    state.zombieSpeed = phaseConfig.difficulty.initialZombieSpeed;
    state.spawnRate = phaseConfig.difficulty.initialSpawnRate;
    state.difficultyTimer = 0;
  }

  emit({
    type: 'phaseChanged',
    phaseIndex,
    phaseType: phase.type,
    announceText: announceText || undefined,
  });
}

function handleSurvivalCycleRestart(
  state: GameState,
  config: GameConfig,
  emit: (event: GameEvent) => void,
): void {
  if (config.level.id !== 'survival' || !config.level.phases) return;

  const ps = state.phase!;
  ps.survivalCycle++;

  // Escalate difficulty for new cycle
  const cycle = ps.survivalCycle;
  const speedScale = Math.pow(1.15, cycle);
  const spawnScale = Math.pow(0.9, cycle);

  // Apply scaling to the base difficulty
  const baseDiff = config.level.difficulty;
  config.level.difficulty = {
    ...baseDiff,
    initialZombieSpeed: baseDiff.initialZombieSpeed * speedScale,
    maxZombieSpeed: baseDiff.maxZombieSpeed * speedScale,
    initialSpawnRate: baseDiff.initialSpawnRate * spawnScale,
    minSpawnRate: baseDiff.minSpawnRate * spawnScale,
    maxSpawnRate: baseDiff.maxSpawnRate * spawnScale,
  };

  // Increase boss count for boss phases
  for (const phase of config.level.phases) {
    if (phase.type === 'boss' && phase.bossSpawnCount !== undefined) {
      phase.bossSpawnCount += 1;
    }
  }

  // Skip warmup on subsequent cycles — start at phase 1
  const startPhase = config.level.phases.length > 1 ? 1 : 0;
  advanceToPhase(state, config, startPhase, emit);

  // Override announcement text for survival cycles
  const phase = config.level.phases[startPhase];
  if (phase?.announceText) {
    ps.announceText = `${phase.announceText} (Cyklus ${cycle + 1})`;
  }
}

export function updatePhaseSystem(
  state: GameState,
  config: GameConfig,
  dt: number,
  emit: (event: GameEvent) => void,
): void {
  if (!state.phase || !config.level.phases || config.level.phases.length === 0) return;

  const ps = state.phase;
  const phases = config.level.phases;

  // Handle announcement
  if (ps.announcing) {
    ps.announceTimer += dt;
    const phase = phases[ps.currentPhaseIndex];
    const duration = phase?.announceDurationMs ?? DEFAULT_ANNOUNCE_DURATION;
    if (ps.announceTimer >= duration) {
      ps.announcing = false;
      emit({ type: 'phaseAnnounceEnd' });
    }
    return; // Skip game logic during announcement
  }

  // Increment phase timer
  ps.phaseTimer += dt;

  // Check end condition
  const currentPhase = phases[ps.currentPhaseIndex];
  if (!currentPhase) return;

  if (isPhaseComplete(currentPhase, state)) {
    // Award wave clear bonus
    if ((currentPhase.type === 'wave' || currentPhase.type === 'warmup') && getAliveCount(state) === 0) {
      const secondsRemaining = Math.max(0, Math.floor((currentPhase.durationMs - ps.phaseTimer) / 1000));
      if (secondsRemaining > 0) {
        const bonus = {
          text: `+${secondsRemaining} Čistá vlna!`,
          points: secondsRemaining,
          x: config.canvas.width / 2,
          y: config.canvas.height / 2 - 60,
          timer: 0,
        };
        state.pendingBonuses.push(bonus);
        state.bonusScore += secondsRemaining;
        state.score += secondsRemaining;
        emit({ type: 'scoreBonus', bonus });
        emit({ type: 'scoreChanged', score: state.score });
      }
    }

    // Boss defeated bonus
    if (currentPhase.type === 'boss') {
      const points = 10 + 5 * ps.currentPhaseIndex;
      const bonus = {
        text: `+${points} Boss poražen!`,
        points,
        x: config.canvas.width / 2,
        y: config.canvas.height / 2 - 60,
        timer: 0,
      };
      state.pendingBonuses.push(bonus);
      state.bonusScore += points;
      state.score += points;
      emit({ type: 'bossDefeated' });
      emit({ type: 'scoreBonus', bonus });
      emit({ type: 'scoreChanged', score: state.score });
    }

    const nextIndex = ps.currentPhaseIndex + 1;

    if (nextIndex >= phases.length) {
      // All phases done
      if (config.level.id === 'survival') {
        handleSurvivalCycleRestart(state, config, emit);
      } else {
        // Level complete
        state.levelComplete = true;
        emit({ type: 'levelComplete', score: state.score });
      }
    } else {
      // Victory phase triggers level complete after its duration
      const nextPhase = phases[nextIndex];
      if (nextPhase?.type === 'victory') {
        advanceToPhase(state, config, nextIndex, emit);
      } else {
        advanceToPhase(state, config, nextIndex, emit);
      }
    }
  }
}

export function getCurrentPhaseRemainingMs(state: GameState, config: GameConfig): number {
  if (!state.phase || !config.level.phases) return 0;
  const phase = config.level.phases[state.phase.currentPhaseIndex];
  if (!phase) return 0;
  if (phase.type === 'boss') return 0; // Boss has no meaningful timer
  return Math.max(0, phase.durationMs - state.phase.phaseTimer);
}

import type { GameState, GameConfig, ActivePhaseConfig, DifficultyProfile } from '../types.ts';

const RAMP_DURATION = 20_000;       // 20s linear ramp per phase
const SINE_PERIOD = 60_000;         // 60s sine wave cycle
const BASELINE_DRIFT_PER_MS = 0.08 / 60_000; // baseline drifts 8% per minute

function computeSineDifficulty(
  elapsed: number,
  diff: DifficultyProfile,
): { zombieSpeed: number; spawnRate: number } {
  const sinElapsed = elapsed - RAMP_DURATION;
  const sine = Math.sin(2 * Math.PI * sinElapsed / SINE_PERIOD);  // -1..1
  const normalized = (sine + 1) / 2;                                // 0..1

  // Baseline drift: makes each cycle slightly harder than the last
  const driftFactor = sinElapsed * BASELINE_DRIFT_PER_MS; // 0..~0.08 per minute
  const driftedMinSpeed = diff.initialZombieSpeed + driftFactor * (diff.maxZombieSpeed - diff.initialZombieSpeed);
  const driftedMaxSpawn = diff.maxSpawnRate - driftFactor * (diff.maxSpawnRate - diff.minSpawnRate);

  // Peak (normalized=1): many zombies, slow → spawnRate=minSpawnRate, speed=driftedMinSpeed
  // Trough (normalized=0): few zombies, fast → spawnRate=driftedMaxSpawn, speed=maxZombieSpeed
  const zombieSpeed = Math.min(
    diff.maxZombieSpeed,
    driftedMinSpeed + (1 - normalized) * (diff.maxZombieSpeed - driftedMinSpeed),
  );
  const spawnRate = Math.max(
    diff.minSpawnRate,
    diff.minSpawnRate + (1 - normalized) * (driftedMaxSpawn - diff.minSpawnRate),
  );

  return { zombieSpeed, spawnRate };
}

export function updateDifficultySystem(
  state: GameState,
  config: GameConfig,
  dt: number,
  phaseConfig?: ActivePhaseConfig | null,
): void {
  const diff = phaseConfig?.difficulty ?? config.level.difficulty;
  state.difficultyTimer += dt;

  const elapsed = state.difficultyTimer;

  if (elapsed <= RAMP_DURATION) {
    // Phase 1: linear ramp from initial values to baseline
    const t = elapsed / RAMP_DURATION; // 0..1

    // Speed ramps from initial toward a mid-point
    const baselineSpeed = (diff.initialZombieSpeed + diff.maxZombieSpeed) / 2;
    state.zombieSpeed = diff.initialZombieSpeed + t * (baselineSpeed - diff.initialZombieSpeed);

    // Spawn rate ramps from initial toward mid-point (getting faster)
    const baselineSpawn = (diff.initialSpawnRate + diff.minSpawnRate) / 2;
    state.spawnRate = diff.initialSpawnRate + t * (baselineSpawn - diff.initialSpawnRate);
  } else {
    // Phase 2: sine-driven oscillation with baseline drift
    const result = computeSineDifficulty(elapsed, diff);
    state.zombieSpeed = result.zombieSpeed;
    state.spawnRate = result.spawnRate;
  }
}

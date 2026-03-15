import type { GameState, GameConfig, ZombieTypeConfig, ActivePhaseConfig } from '../types.ts';
import type { ChallengeProvider } from '../../challenges/types.ts';
import { createZombie } from '../entities/Zombie.ts';
import type { FailedChallengeTracker } from '../challenges/FailedChallengeTracker.ts';

function selectZombieType(
  spawnCount: number,
  types: ZombieTypeConfig[],
  tankFrequency: number,
  ragdollFrequency: number,
): ZombieTypeConfig {
  // Check tank first (rarer)
  const tank = types.find(t => t.id === 'tank');
  if (tank && tankFrequency > 0 && spawnCount % tankFrequency === 0) {
    return tank;
  }
  // Then ragdoll
  const ragdoll = types.find(t => t.id === 'ragdoll');
  if (ragdoll && ragdollFrequency > 0 && spawnCount % ragdollFrequency === 0) {
    return ragdoll;
  }
  // Default to regular
  return types.find(t => t.spawnFrequency === 1) ?? types[0];
}

function getAvailableRows(state: GameState, config: GameConfig): number[] {
  const rows: number[] = [];
  for (let row = 0; row < config.numRows; row++) {
    const zombiesInRow = state.zombies.filter(z => z.row === row && z.state === 'alive');
    const tooClose = zombiesInRow.some(
      z => (config.canvas.width - z.x) < config.minZombieSpacing,
    );
    if (!tooClose) {
      rows.push(row);
    }
  }
  return rows;
}

export function updateSpawnSystem(
  state: GameState,
  config: GameConfig,
  dt: number,
  providers: Map<string, ChallengeProvider>,
  tracker: FailedChallengeTracker,
  playSound: (id: string) => void,
  phaseConfig?: ActivePhaseConfig | null,
): void {
  // Phase-based spawning control
  if (phaseConfig && !phaseConfig.spawningEnabled) return;

  // Boss phase: stop spawning once all bosses are out
  if (state.phase && config.level.phases) {
    const currentPhase = config.level.phases[state.phase.currentPhaseIndex];
    if (currentPhase?.type === 'boss') {
      if (state.phase.bossSpawned >= (currentPhase.bossSpawnCount ?? 1)) {
        return; // All bosses spawned, wait for kills
      }
    }
  }

  state.spawnTimer += dt;

  const shouldSpawn = state.spawnTimer > state.spawnRate ||
    state.zombies.filter(z => z.state === 'alive').length === 0;

  if (!shouldSpawn) return;

  const availableRows = getAvailableRows(state, config);
  if (availableRows.length === 0) return;

  state.spawnTimer = 0;
  state.zombieSpawnCount++;

  const row = availableRows[Math.floor(Math.random() * availableRows.length)];

  // Use phase config if available, otherwise fall back to base config
  const zombieTypes = phaseConfig?.zombieTypes ?? config.level.zombieTypes;
  const tankFreq = phaseConfig?.tankFrequency ?? config.tankFrequency;
  const ragdollFreq = phaseConfig?.ragdollFrequency ?? config.ragdollFrequency;
  const ops = phaseConfig?.mathOperations ?? config.mathOperations;
  const maxResult = phaseConfig?.maxResult ?? config.maxResult;
  const minResult = phaseConfig?.minResult ?? config.minResult;
  const challengeDiff = phaseConfig?.challengeDifficulty ?? undefined;

  let typeConfig: ZombieTypeConfig;

  // Boss phase: always spawn tank+ragdoll boss zombies
  if (state.phase && config.level.phases) {
    const currentPhase = config.level.phases[state.phase.currentPhaseIndex];
    if (currentPhase?.type === 'boss') {
      // Alternate between tank and ragdoll for boss zombies
      const tank = zombieTypes.find(t => t.id === 'tank');
      const ragdoll = zombieTypes.find(t => t.id === 'ragdoll');
      typeConfig = (state.phase.bossSpawned % 2 === 0 && tank) ? tank : (ragdoll ?? zombieTypes[0]);
    } else {
      typeConfig = selectZombieType(state.zombieSpawnCount, zombieTypes, tankFreq, ragdollFreq);
    }
  } else {
    typeConfig = selectZombieType(state.zombieSpawnCount, zombieTypes, tankFreq, ragdollFreq);
  }

  // Determine challenge
  let challenge;
  if (tracker.shouldRetry()) {
    challenge = tracker.getRetryChallenge();
  }
  if (!challenge) {
    const providerIds = config.level.challengeProviderIds;
    // Ragdolls always get 3-part math problems (unless math provider not available)
    let providerId: string;
    if (typeConfig.id === 'ragdoll' && providers.has('math')) {
      providerId = 'math';
    } else {
      providerId = providerIds[Math.floor(Math.random() * providerIds.length)];
    }
    const provider = providers.get(providerId);
    if (provider) {
      const difficulty = challengeDiff ?? typeConfig.challengeDifficulty;
      const failedChallengeDisplays = tracker.getFailedDisplays();
      challenge = provider.generate(difficulty, {
        minResult,
        maxResult,
        operations: ops,
        nasoblikaTables: config.nasoblikaTables,
        nasoblikaDivision: config.nasoblikaDivision,
        czechLetters: config.czechLetters,
        failedChallengeDisplays,
      });
    } else {
      challenge = { display: '1 + 1 = ?', answer: '2', inputType: 'numeric' as const };
    }
  }

  const zombie = createZombie(
    state.nextZombieId++,
    row,
    typeConfig,
    challenge,
    state.zombieSpeed,
    config,
  );
  zombie.spawnedAtGameTime = state.levelTimer;
  state.zombies.push(zombie);

  // Track boss zombie IDs
  if (state.phase && config.level.phases) {
    const currentPhase = config.level.phases[state.phase.currentPhaseIndex];
    if (currentPhase?.type === 'boss') {
      state.phase.bossZombieIds.push(zombie.id);
      state.phase.bossSpawned++;
    }
  }

  playSound(typeConfig.spawnSound);
}

export { selectZombieType, getAvailableRows };

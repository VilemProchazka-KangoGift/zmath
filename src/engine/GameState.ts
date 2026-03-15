import type { GameState, GameConfig, PhaseState } from './types.ts';
import { createPlayer } from './entities/Player.ts';
import { createLawnmowers } from './entities/Lawnmower.ts';

function createPhaseState(config: GameConfig): PhaseState | null {
  if (!config.level.phases || config.level.phases.length === 0) return null;
  const firstPhase = config.level.phases[0];
  return {
    currentPhaseIndex: 0,
    phaseTimer: 0,
    announcing: true,
    announceTimer: 0,
    announceText: firstPhase.announceText ?? '',
    bossZombieIds: [],
    bossSpawned: 0,
    phaseComplete: false,
    survivalCycle: 0,
  };
}

export function createGameState(config: GameConfig): GameState {
  const diff = config.level.difficulty;

  return {
    player: createPlayer(config),
    zombies: [],
    bloodSplatters: [],
    lawnmowers: createLawnmowers(config),
    score: 0,
    gameOver: false,
    levelComplete: false,
    paused: false,
    canShoot: true,
    cooldownTimer: 0,
    zombieSpeed: diff.initialZombieSpeed,
    spawnRate: diff.initialSpawnRate,
    spawnTimer: 0,
    spawnRateDirection: -1,
    difficultyTimer: 0,
    levelTimer: 0,
    zombieSpawnCount: 0,
    nextZombieId: 1,
    // Phase system
    phase: createPhaseState(config),
    streak: 0,
    pendingBonuses: [],
    bonusScore: 0,
  };
}

export function resetGameState(state: GameState, config: GameConfig): void {
  const fresh = createGameState(config);
  Object.assign(state, fresh);
}

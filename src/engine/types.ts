import type { Challenge } from '../challenges/types.ts';

// ── Zombie Type Config ──
export interface ZombieTypeConfig {
  id: string;
  spriteKey: string;
  sizeMultiplier: number;
  speedMultiplier: number;
  challengeDifficulty: number;
  spawnSound: string;
  deathSound: string;
  spawnFrequency: number;
  transformOnDeath?: string;
  suppressBloodOnTransform?: boolean;
}

// ── Entities ──
export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  row: number;
  isShooting: boolean;
  shootAnimationTimer: number;
  rotationAngle: number;
}

export interface ZombieEntity {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  row: number;
  speed: number;
  randomVariance: number;
  state: 'alive' | 'dying';
  dyingAnimationTimer: number;
  angle: number;
  bobbingAngle: number;
  bobbingOffset: number;
  shouldRemove: boolean;
  typeConfig: ZombieTypeConfig;
  challenge: Challenge;
  isTransformed: boolean;
  spawnedAtGameTime: number;
}

export interface BloodSplatterEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
}

export type LawnmowerState = 'idle' | 'active' | 'used';

export interface LawnmowerEntity {
  row: number;
  x: number;
  y: number;
  state: LawnmowerState;
}

// ── Difficulty ──
export interface DifficultyProfile {
  initialZombieSpeed: number;
  maxZombieSpeed: number;
  zombieSpeedIncrement: number;
  initialSpawnRate: number;
  minSpawnRate: number;
  maxSpawnRate: number;
  spawnRateStep: number;
  difficultyTickInterval: number;
  spawnRateOscillates: boolean;
}

// ── Phase ──
export type PhaseType = 'warmup' | 'wave' | 'breather' | 'boss' | 'victory';

export interface PhaseDefinition {
  type: PhaseType;
  durationMs: number;
  difficulty?: Partial<DifficultyProfile>;
  zombieTypes?: ZombieTypeConfig[];
  ragdollFrequency?: number;
  tankFrequency?: number;
  bossSpawnCount?: number;
  preferredOperations?: string[];
  maxResult?: number;
  minResult?: number;
  announceText?: string;
  announceDurationMs?: number;
  challengeDifficulty?: number;
}

export interface PhaseState {
  currentPhaseIndex: number;
  phaseTimer: number;
  announcing: boolean;
  announceTimer: number;
  announceText: string;
  bossZombieIds: number[];
  bossSpawned: number;
  phaseComplete: boolean;
  survivalCycle: number;
}

export interface ScoreBonus {
  text: string;
  points: number;
  x: number;
  y: number;
  timer: number;
}

export interface ActivePhaseConfig {
  difficulty: DifficultyProfile;
  zombieTypes: ZombieTypeConfig[];
  ragdollFrequency: number;
  tankFrequency: number;
  maxResult: number;
  minResult: number;
  mathOperations: string[];
  spawningEnabled: boolean;
  challengeDifficulty?: number;
}

// ── Level ──
export interface LevelDefinition {
  id: string;
  name: string;
  durationMs: number;
  backgroundKey: string;
  challengeProviderIds: string[];
  zombieTypes: ZombieTypeConfig[];
  difficulty: DifficultyProfile;
  lawnmowersEnabled: boolean;
  unlockCondition?: { levelId: string };
  phases?: PhaseDefinition[];
  preferredOperations?: string[];
  maxResult?: number;
  minResult?: number;
  theme?: string;
}

// ── Sound ──
export interface SoundEntry {
  path: string;
  volume: number;
}

// ── Game Config ──
export interface GameConfig {
  canvas: { width: number; height: number };
  numRows: number;
  topPadding: number;
  playerX: number;
  playerSize: number;
  missCooldownMs: number;
  minZombieSpacing: number;
  sounds: Record<string, SoundEntry>;
  playerSpriteKey: string;
  level: LevelDefinition;
  lawnmowerSpriteKey?: string;
  failedChallengeRetryChance: number;
  failedChallengeCorrectToRemove: number;
  // Visual settings
  showBlood: boolean;
  showTimer: boolean;
  zombieSizeMultiplier: number;
  showRowHighlight: boolean;
  // Challenge tuning
  maxResult: number;
  minResult: number;
  // Monster spawning
  ragdollFrequency: number;
  tankFrequency: number;
  // Math operations
  mathOperations: string[];           // enabled operation symbols
  nasoblikaTables: number[];
  nasoblikaDivision: boolean;
  // Czech language
  czechLetters: string[];
}

// ── Game State ──
export interface GameState {
  player: PlayerState;
  zombies: ZombieEntity[];
  bloodSplatters: BloodSplatterEntity[];
  lawnmowers: LawnmowerEntity[];
  score: number;
  gameOver: boolean;
  levelComplete: boolean;
  paused: boolean;
  canShoot: boolean;
  cooldownTimer: number;
  zombieSpeed: number;
  spawnRate: number;
  spawnTimer: number;
  spawnRateDirection: number;
  difficultyTimer: number;
  levelTimer: number;
  zombieSpawnCount: number;
  nextZombieId: number;
  // Phase system
  phase: PhaseState | null;
  streak: number;
  pendingBonuses: ScoreBonus[];
  bonusScore: number;
}

// ── Events ──
export type GameEvent =
  | { type: 'scoreChanged'; score: number }
  | { type: 'gameOver'; finalScore: number }
  | { type: 'levelComplete'; score: number }
  | { type: 'timerUpdate'; remainingMs: number; elapsedMs: number }
  | { type: 'cooldownStarted' }
  | { type: 'cooldownEnded' }
  | { type: 'paused' }
  | { type: 'resumed' }
  | { type: 'lawnmowerTriggered'; row: number }
  | { type: 'restarted' }
  | { type: 'zombieReachedEnd'; challenge: Challenge }
  | { type: 'phaseChanged'; phaseIndex: number; phaseType: PhaseType; announceText?: string }
  | { type: 'phaseAnnounce'; text: string }
  | { type: 'phaseAnnounceEnd' }
  | { type: 'bossDefeated' }
  | { type: 'scoreBonus'; bonus: ScoreBonus }
  | { type: 'streakUpdate'; streak: number }
  | { type: 'challengeCorrect'; challenge: Challenge; responseTimeMs: number }
  | { type: 'challengeIncorrect'; challenge: Challenge };

// ── Screen State Machine ──
export type Screen =
  | { id: 'profileSelect' }
  | { id: 'menu' }
  | { id: 'modeSelect' }
  | { id: 'levelSelect' }
  | { id: 'settings' }
  | { id: 'leaderboard' }
  | { id: 'failedQuestions' }
  | { id: 'gameHistory' }
  | { id: 'game'; levelId: string; mode: 'survival' | 'levels' };

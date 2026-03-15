import type { Challenge } from '../challenges/types.ts';

export interface UserProfile {
  id: string;
  name: string;
  avatarId: string;
  createdAt: string;
}

export interface CustomAvatar {
  id: string;       // 'custom-{uuid}'
  name: string;     // user-provided name or filename
  dataUrl: string;  // base64 data URL
}

export interface SavedSettings {
  // Audio
  soundEnabled: boolean;
  volume: number;

  // Avatar
  avatarId: string;
  customAvatars: CustomAvatar[];

  // Gameplay
  zombieSpeedMultiplier: number;    // 0.3 – 5.0 (scales all zombie speeds)
  spawnRateMultiplier: number;      // 0.3 – 5.0 (higher = slower spawning, easier)
  missCooldownMs: number;           // 500 – 8000 (wrong answer cooldown)
  numRows: number;                  // 3 – 8
  lawnmowersEnabled: boolean;

  // Math / challenge tuning
  maxResult: number;                // 5 – 1000
  minResult: number;                // 0 – 10

  // Failed challenge tracking
  failedChallengeRetryChance: number;      // 0 – 0.5
  failedChallengeCorrectToRemove: number;  // 1 – 5

  // Monster spawning
  ragdollFrequency: number;           // every Nth spawn (default 5)
  tankFrequency: number;              // every Nth spawn (default 12)

  // Math operations
  mathAddition: boolean;
  mathSubtraction: boolean;
  mathMultiplication: boolean;
  mathDivision: boolean;
  nasoblikaTables: number[];         // which multiplication tables are active (2-10)
  nasoblikaDivision: boolean;        // also generate division from tables (42 ÷ 7 = ?)

  // Czech language
  czechEnabled: boolean;
  czechLetters: string[];             // 'B','F','L','M','P','S','V','Z'

  // Visual
  showBlood: boolean;
  showTimer: boolean;
  zombieSizeMultiplier: number;     // 0.5 – 2.0 (visual scale of all zombies)
  showRowHighlight: boolean;
  laneLength: number;              // 600 – 1200 (canvas width / lane length in pixels)
}

export interface InProgressGame {
  levelId: string;
  mode: 'survival' | 'levels';
  score: number;
  phaseIndex: number;
  elapsedMs: number;
  zombieSpawnCount: number;
  zombieSpeed: number;
  spawnRate: number;
  survivalCycle: number;
}

export interface SavedProgress {
  completedLevels: string[];
  highScores: Record<string, number>;
  inProgressGame?: InProgressGame;
}

export interface LeaderboardEntry {
  levelId: string;
  score: number;
  date: string;
}

export interface FailedChallengeRecord {
  challenge: Challenge;
  providerDifficulty: number;
  failCount: number;
  consecutiveCorrect: number;
}

export interface SlowAnswer {
  challengeDisplay: string;
  challengeAnswer: string;
  responseTimeMs: number;
}

export interface GameHistoryEntry {
  id: string;
  levelId: string;
  mode: 'survival' | 'levels';
  date: string;
  durationMs: number;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  zombiesEscaped: number;
  maxStreak: number;
  avgResponseTimeMs: number;
  slowAnswers: SlowAnswer[];
}

export interface ProfileData {
  settings: SavedSettings;
  progress: SavedProgress;
  leaderboard: LeaderboardEntry[];
  failedChallenges: FailedChallengeRecord[];
  gameHistory: GameHistoryEntry[];
}

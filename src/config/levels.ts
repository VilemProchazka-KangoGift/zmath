import type { LevelDefinition, PhaseDefinition } from '../engine/types.ts';
import { REGULAR, RAGDOLL, TANK } from './zombieTypes.ts';
import { DEFAULT_DIFFICULTY } from './difficultyProfiles.ts';

// ── Helper: create standard phase sequences ──

function warmup(durationMs: number, overrides?: Partial<PhaseDefinition>): PhaseDefinition {
  return {
    type: 'warmup',
    durationMs,
    announceText: 'Připravte se!',
    announceDurationMs: 2000,
    ...overrides,
  };
}

function wave(index: number, durationMs: number, overrides?: Partial<PhaseDefinition>): PhaseDefinition {
  return {
    type: 'wave',
    durationMs,
    announceText: `Vlna ${index}!`,
    announceDurationMs: 1500,
    ...overrides,
  };
}

function breather(durationMs: number): PhaseDefinition {
  return {
    type: 'breather',
    durationMs,
    announceText: 'Oddech...',
    announceDurationMs: 1000,
  };
}

function boss(count: number, overrides?: Partial<PhaseDefinition>): PhaseDefinition {
  return {
    type: 'boss',
    durationMs: 120_000, // safety timeout
    bossSpawnCount: count,
    announceText: 'BOSS!',
    announceDurationMs: 2000,
    challengeDifficulty: 2,
    ...overrides,
  };
}

function victory(): PhaseDefinition {
  return {
    type: 'victory',
    durationMs: 3000,
    announceText: 'Vítězství!',
    announceDurationMs: 2500,
  };
}

// ── Level definitions ──

export const LEVELS: LevelDefinition[] = [
  // Level 1: První kroky — addition only
  {
    id: 'level-1',
    name: 'První kroky',
    theme: 'Základy',
    durationMs: 90_000,
    backgroundKey: 'background',
    challengeProviderIds: ['math'],
    zombieTypes: [REGULAR],
    preferredOperations: ['+'],
    maxResult: 20,
    difficulty: {
      ...DEFAULT_DIFFICULTY,
      maxZombieSpeed: 0.010,
    },
    lawnmowersEnabled: true,
    phases: [
      warmup(15_000, { preferredOperations: ['+'], maxResult: 10 }),
      wave(1, 25_000, { maxResult: 15 }),
      breather(5_000),
      wave(2, 30_000, {
        difficulty: { zombieSpeedIncrement: 0.0007 },
      }),
      victory(),
    ],
  },

  // Level 2: Odčítání — addition + subtraction
  {
    id: 'level-2',
    name: 'Odčítání',
    theme: '+/-',
    durationMs: 100_000,
    backgroundKey: 'background',
    challengeProviderIds: ['math'],
    zombieTypes: [REGULAR, RAGDOLL],
    preferredOperations: ['+', '-'],
    maxResult: 20,
    difficulty: {
      ...DEFAULT_DIFFICULTY,
      initialZombieSpeed: 0.005,
      maxZombieSpeed: 0.012,
    },
    lawnmowersEnabled: true,
    unlockCondition: { levelId: 'level-1' },
    phases: [
      warmup(15_000, { preferredOperations: ['+'], maxResult: 15 }),
      wave(1, 25_000),
      breather(5_000),
      wave(2, 30_000, {
        difficulty: { zombieSpeedIncrement: 0.0006 },
        ragdollFrequency: 4,
      }),
      victory(),
    ],
  },

  // Level 3: Tankové zombíky — tanks introduced
  {
    id: 'level-3',
    name: 'Tankové zombíky',
    theme: 'Tanky',
    durationMs: 110_000,
    backgroundKey: 'background',
    challengeProviderIds: ['math'],
    zombieTypes: [REGULAR, RAGDOLL, TANK],
    preferredOperations: ['+', '-'],
    maxResult: 30,
    difficulty: {
      ...DEFAULT_DIFFICULTY,
      initialZombieSpeed: 0.005,
      maxZombieSpeed: 0.013,
    },
    lawnmowersEnabled: true,
    unlockCondition: { levelId: 'level-2' },
    phases: [
      warmup(15_000, { maxResult: 20 }),
      wave(1, 25_000, { tankFrequency: 8 }),
      breather(5_000),
      wave(2, 30_000, {
        tankFrequency: 6,
        difficulty: { zombieSpeedIncrement: 0.0006 },
      }),
      breather(4_000),
      boss(3),
      victory(),
    ],
  },

  // Level 4: Násobilka — multiplication focus
  {
    id: 'level-4',
    name: 'Násobilka',
    theme: '× focus',
    durationMs: 120_000,
    backgroundKey: 'background',
    challengeProviderIds: ['math'],
    zombieTypes: [REGULAR, RAGDOLL, TANK],
    preferredOperations: ['×'],
    maxResult: 50,
    difficulty: {
      ...DEFAULT_DIFFICULTY,
      initialZombieSpeed: 0.005,
      maxZombieSpeed: 0.013,
    },
    lawnmowersEnabled: true,
    unlockCondition: { levelId: 'level-3' },
    phases: [
      warmup(15_000, { preferredOperations: ['+', '-'], maxResult: 20 }),
      wave(1, 30_000, { preferredOperations: ['×'] }),
      breather(5_000),
      wave(2, 30_000, {
        preferredOperations: ['×'],
        difficulty: { zombieSpeedIncrement: 0.0005 },
      }),
      breather(4_000),
      boss(4),
      victory(),
    ],
  },

  // Level 5: Mix operací — all operations
  {
    id: 'level-5',
    name: 'Mix operací',
    theme: 'All ops',
    durationMs: 140_000,
    backgroundKey: 'background',
    challengeProviderIds: ['math'],
    zombieTypes: [REGULAR, RAGDOLL, TANK],
    preferredOperations: ['+', '-', '×', '÷'],
    maxResult: 50,
    difficulty: {
      ...DEFAULT_DIFFICULTY,
      initialZombieSpeed: 0.006,
      maxZombieSpeed: 0.014,
    },
    lawnmowersEnabled: true,
    unlockCondition: { levelId: 'level-4' },
    phases: [
      warmup(12_000, { maxResult: 30 }),
      wave(1, 25_000),
      breather(5_000),
      wave(2, 25_000, { ragdollFrequency: 4, tankFrequency: 8 }),
      breather(4_000),
      wave(3, 25_000, {
        difficulty: { zombieSpeedIncrement: 0.0006 },
        tankFrequency: 6,
      }),
      breather(4_000),
      boss(5),
      victory(),
    ],
  },

  // Level 6: Rychlé vlny — speed challenge
  {
    id: 'level-6',
    name: 'Rychlé vlny',
    theme: 'Speed',
    durationMs: 140_000,
    backgroundKey: 'background',
    challengeProviderIds: ['math'],
    zombieTypes: [REGULAR, RAGDOLL, TANK],
    preferredOperations: ['+', '-', '×', '÷'],
    maxResult: 60,
    difficulty: {
      ...DEFAULT_DIFFICULTY,
      initialZombieSpeed: 0.007,
      maxZombieSpeed: 0.016,
      minSpawnRate: 4000,
    },
    lawnmowersEnabled: true,
    unlockCondition: { levelId: 'level-5' },
    phases: [
      warmup(10_000, { maxResult: 30 }),
      wave(1, 25_000, {
        difficulty: { initialSpawnRate: 10000, minSpawnRate: 5000 },
      }),
      breather(4_000),
      wave(2, 25_000, {
        difficulty: { initialSpawnRate: 8000, minSpawnRate: 4000 },
        tankFrequency: 8,
      }),
      breather(4_000),
      wave(3, 25_000, {
        difficulty: { initialSpawnRate: 7000, minSpawnRate: 3500 },
        tankFrequency: 6,
        ragdollFrequency: 4,
      }),
      breather(4_000),
      boss(6),
      victory(),
    ],
  },

  // Level 7: Velká čísla — big numbers
  {
    id: 'level-7',
    name: 'Velká čísla',
    theme: 'Big numbers',
    durationMs: 130_000,
    backgroundKey: 'background',
    challengeProviderIds: ['math'],
    zombieTypes: [REGULAR, RAGDOLL, TANK],
    preferredOperations: ['+', '-', '×', '÷'],
    maxResult: 100,
    difficulty: {
      ...DEFAULT_DIFFICULTY,
      initialZombieSpeed: 0.005,
      maxZombieSpeed: 0.013,
    },
    lawnmowersEnabled: true,
    unlockCondition: { levelId: 'level-6' },
    phases: [
      warmup(12_000, { maxResult: 50 }),
      wave(1, 30_000, { maxResult: 80 }),
      breather(5_000),
      wave(2, 35_000, {
        maxResult: 100,
        difficulty: { zombieSpeedIncrement: 0.0005 },
        tankFrequency: 8,
      }),
      breather(4_000),
      boss(6, { maxResult: 100 }),
      victory(),
    ],
  },

  // Level 8: Finální bitva — everything, 3-operand bosses
  {
    id: 'level-8',
    name: 'Finální bitva',
    theme: 'Everything',
    durationMs: 160_000,
    backgroundKey: 'background',
    challengeProviderIds: ['math'],
    zombieTypes: [REGULAR, RAGDOLL, TANK],
    preferredOperations: ['+', '-', '×', '÷'],
    maxResult: 100,
    difficulty: {
      ...DEFAULT_DIFFICULTY,
      initialZombieSpeed: 0.007,
      maxZombieSpeed: 0.016,
      minSpawnRate: 4000,
    },
    lawnmowersEnabled: true,
    unlockCondition: { levelId: 'level-7' },
    phases: [
      warmup(10_000, { maxResult: 50 }),
      wave(1, 25_000, {
        difficulty: { initialSpawnRate: 10000, minSpawnRate: 5000 },
      }),
      breather(4_000),
      wave(2, 25_000, {
        tankFrequency: 6,
        ragdollFrequency: 4,
        difficulty: { initialSpawnRate: 8000, minSpawnRate: 4000 },
      }),
      breather(4_000),
      wave(3, 30_000, {
        tankFrequency: 5,
        ragdollFrequency: 3,
        difficulty: {
          initialSpawnRate: 7000,
          minSpawnRate: 3500,
          zombieSpeedIncrement: 0.0007,
        },
      }),
      breather(4_000),
      boss(8, { challengeDifficulty: 2 }),
      victory(),
    ],
  },
];

export const SURVIVAL_LEVEL: LevelDefinition = {
  id: 'survival',
  name: 'Přežití',
  durationMs: Infinity,
  backgroundKey: 'background',
  challengeProviderIds: ['math'],
  zombieTypes: [REGULAR, RAGDOLL, TANK],
  preferredOperations: ['+', '-', '×', '÷'],
  difficulty: DEFAULT_DIFFICULTY,
  lawnmowersEnabled: true,
  phases: [
    warmup(15_000),
    wave(1, 40_000),
    breather(5_000),
    wave(2, 45_000, {
      difficulty: { zombieSpeedIncrement: 0.0006 },
      tankFrequency: 8,
    }),
    breather(4_000),
    boss(3),
    // Cycle restarts at phase 1 (skipping warmup) via PhaseSystem
  ],
};

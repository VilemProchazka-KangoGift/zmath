import type { GameConfig } from '../engine/types.ts';
import type { SavedSettings } from '../persistence/types.ts';
import { LEVELS, SURVIVAL_LEVEL } from './levels.ts';
import { SOUND_MANIFEST } from './soundManifest.ts';
import { AVATARS } from './avatars.ts';

function buildMathOperations(settings?: SavedSettings): string[] {
  if (!settings) return ['+', '-'];
  const ops: string[] = [];
  if (settings.mathAddition) ops.push('+');
  if (settings.mathSubtraction) ops.push('-');
  if (settings.mathMultiplication) ops.push('×');
  if (settings.mathDivision) ops.push('÷');
  // If nothing selected, return empty — mathProvider will handle it
  return ops;
}

function intersectOps(userOps: string[], levelOps?: string[]): string[] {
  if (!levelOps || levelOps.length === 0) return userOps;
  const result = userOps.filter(op => levelOps.includes(op));
  return result.length > 0 ? result : userOps;
}

function resolvePlayerSpriteKey(avatarId?: string): string {
  if (!avatarId) return 'player';
  // Custom avatars use their ID directly as the image key
  if (avatarId.startsWith('custom-')) return avatarId;
  // Built-in avatars: look up spriteKey from AVATARS config
  const builtin = AVATARS.find(a => a.id === avatarId);
  return builtin?.spriteKey ?? 'player';
}

export function createDefaultConfig(levelId?: string, settings?: SavedSettings): GameConfig {
  const allLevels = [...LEVELS, SURVIVAL_LEVEL];
  const level = allLevels.find(l => l.id === (levelId ?? 'level-1')) ?? LEVELS[0];

  const numRows = settings?.numRows ?? 6;
  const lawnmowersEnabled = settings?.lawnmowersEnabled ?? level.lawnmowersEnabled;

  // Apply speed/spawn multipliers to the level's difficulty profile
  const baseDiff = level.difficulty;
  const speedMul = settings?.zombieSpeedMultiplier ?? 1.0;
  const spawnMul = settings?.spawnRateMultiplier ?? 1.0;

  const adjustedLevel = {
    ...level,
    lawnmowersEnabled,
    difficulty: {
      ...baseDiff,
      initialZombieSpeed: baseDiff.initialZombieSpeed * speedMul,
      maxZombieSpeed: baseDiff.maxZombieSpeed * speedMul,
      zombieSpeedIncrement: baseDiff.zombieSpeedIncrement * speedMul,
      initialSpawnRate: baseDiff.initialSpawnRate * spawnMul,
      minSpawnRate: baseDiff.minSpawnRate * spawnMul,
      maxSpawnRate: baseDiff.maxSpawnRate * spawnMul,
    },
  };

  // Build provider list based on settings
  const userOps = buildMathOperations(settings);
  const tables = settings?.nasoblikaTables ?? [];
  const hasMath = userOps.length > 0 || tables.length > 0;
  const hasCzech = settings?.czechEnabled ?? false;

  let challengeProviderIds: string[];
  if (hasMath && hasCzech) {
    challengeProviderIds = ['math', 'czech'];
  } else if (hasCzech) {
    challengeProviderIds = ['czech'];
  } else {
    // Math only (default) — if no ops selected, math provider falls back to addition
    challengeProviderIds = ['math'];
  }
  const finalLevel = { ...adjustedLevel, challengeProviderIds };

  // Layer 1 intersection: user ops ∩ level preferred ops
  const effectiveOps = intersectOps(userOps, level.preferredOperations);

  // Clamp level result ranges to user settings
  const userMax = settings?.maxResult ?? 20;
  const userMin = settings?.minResult ?? 0;
  const effectiveMax = level.maxResult !== undefined ? Math.min(level.maxResult, userMax) : userMax;
  const effectiveMin = level.minResult !== undefined ? Math.max(level.minResult, userMin) : userMin;

  return {
    canvas: { width: settings?.laneLength ?? 800, height: 600 },
    numRows,
    topPadding: 80,
    playerX: 50,
    playerSize: 40,
    missCooldownMs: settings?.missCooldownMs ?? 3000,
    minZombieSpacing: 100,
    sounds: SOUND_MANIFEST,
    playerSpriteKey: resolvePlayerSpriteKey(settings?.avatarId),
    level: finalLevel,
    failedChallengeRetryChance: settings?.failedChallengeRetryChance ?? 0.2,
    failedChallengeCorrectToRemove: settings?.failedChallengeCorrectToRemove ?? 3,
    // Visual settings stored on config for renderer access
    showBlood: settings?.showBlood ?? true,
    showTimer: settings?.showTimer ?? true,
    zombieSizeMultiplier: settings?.zombieSizeMultiplier ?? 1.0,
    showRowHighlight: settings?.showRowHighlight ?? true,
    maxResult: effectiveMax,
    minResult: effectiveMin,
    ragdollFrequency: settings?.ragdollFrequency ?? 5,
    tankFrequency: settings?.tankFrequency ?? 12,
    mathOperations: effectiveOps,
    nasoblikaTables: settings?.nasoblikaTables ?? [],
    nasoblikaDivision: settings?.nasoblikaDivision ?? false,
    czechLetters: settings?.czechLetters ?? [],
  };
}

import { describe, it, expect } from 'vitest';
import { createDefaultConfig } from '../../config/defaultConfig.ts';
import type { SavedSettings } from '../../persistence/types.ts';

function makeSettings(overrides: Partial<SavedSettings> = {}): SavedSettings {
  return {
    soundEnabled: true,
    volume: 1.0,
    avatarId: 'default',
    customAvatars: [],
    zombieSpeedMultiplier: 1.0,
    spawnRateMultiplier: 1.0,
    missCooldownMs: 3000,
    numRows: 6,
    lawnmowersEnabled: true,
    maxResult: 20,
    minResult: 0,
    failedChallengeRetryChance: 0.2,
    failedChallengeCorrectToRemove: 3,
    ragdollFrequency: 5,
    tankFrequency: 12,
    mathAddition: true,
    mathSubtraction: true,
    mathMultiplication: false,
    mathDivision: false,
    nasoblikaTables: [],
    nasoblikaDivision: false,
    czechEnabled: false,
    czechLetters: [],
    showBlood: true,
    showTimer: true,
    zombieSizeMultiplier: 1.0,
    showRowHighlight: true,
    laneLength: 800,
    ...overrides,
  };
}

describe('createDefaultConfig with settings', () => {
  it('uses default values when no settings provided', () => {
    const config = createDefaultConfig();
    expect(config.numRows).toBe(6);
    expect(config.missCooldownMs).toBe(3000);
    expect(config.showBlood).toBe(true);
    expect(config.maxResult).toBe(20);
  });

  it('applies zombie speed multiplier to difficulty profile', () => {
    const slowConfig = createDefaultConfig('level-1', makeSettings({ zombieSpeedMultiplier: 0.5 }));
    const fastConfig = createDefaultConfig('level-1', makeSettings({ zombieSpeedMultiplier: 2.0 }));

    expect(fastConfig.level.difficulty.initialZombieSpeed).toBeGreaterThan(
      slowConfig.level.difficulty.initialZombieSpeed,
    );
    expect(fastConfig.level.difficulty.maxZombieSpeed).toBeGreaterThan(
      slowConfig.level.difficulty.maxZombieSpeed,
    );
  });

  it('applies spawn rate multiplier', () => {
    const easyConfig = createDefaultConfig('level-1', makeSettings({ spawnRateMultiplier: 2.0 }));
    const hardConfig = createDefaultConfig('level-1', makeSettings({ spawnRateMultiplier: 0.5 }));

    // Higher multiplier = longer intervals = easier
    expect(easyConfig.level.difficulty.initialSpawnRate).toBeGreaterThan(
      hardConfig.level.difficulty.initialSpawnRate,
    );
  });

  it('applies custom numRows', () => {
    const config = createDefaultConfig('level-1', makeSettings({ numRows: 4 }));
    expect(config.numRows).toBe(4);
  });

  it('applies custom missCooldownMs', () => {
    const config = createDefaultConfig('level-1', makeSettings({ missCooldownMs: 1000 }));
    expect(config.missCooldownMs).toBe(1000);
  });

  it('applies custom maxResult / minResult (clamped by level)', () => {
    // Level-1 has maxResult=20, so effective max = min(20, 50) = 20
    const config = createDefaultConfig('level-1', makeSettings({ maxResult: 50, minResult: 5 }));
    expect(config.maxResult).toBe(20);
    expect(config.minResult).toBe(5);
  });

  it('uses user maxResult when level has no maxResult restriction', () => {
    // Survival level has no maxResult, so user setting applies directly
    const config = createDefaultConfig('survival', makeSettings({ maxResult: 50, minResult: 5 }));
    expect(config.maxResult).toBe(50);
    expect(config.minResult).toBe(5);
  });

  it('applies visual settings', () => {
    const config = createDefaultConfig('level-1', makeSettings({
      showBlood: false,
      showTimer: false,
      showRowHighlight: false,
      zombieSizeMultiplier: 1.5,
    }));
    expect(config.showBlood).toBe(false);
    expect(config.showTimer).toBe(false);
    expect(config.showRowHighlight).toBe(false);
    expect(config.zombieSizeMultiplier).toBe(1.5);
  });

  it('applies failed challenge tracking settings', () => {
    const config = createDefaultConfig('level-1', makeSettings({
      failedChallengeRetryChance: 0.4,
      failedChallengeCorrectToRemove: 5,
    }));
    expect(config.failedChallengeRetryChance).toBe(0.4);
    expect(config.failedChallengeCorrectToRemove).toBe(5);
  });

  it('overrides lawnmowers per settings', () => {
    const config = createDefaultConfig('level-1', makeSettings({ lawnmowersEnabled: false }));
    expect(config.level.lawnmowersEnabled).toBe(false);
  });
});

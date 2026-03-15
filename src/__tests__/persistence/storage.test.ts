import { describe, it, expect, beforeEach } from 'vitest';
import {
  getProfiles,
  saveProfiles,
  getActiveProfileId,
  setActiveProfileId,
  getProfileData,
  saveProfileData,
  deleteProfileData,
} from '../../persistence/storage.ts';
import type { UserProfile, ProfileData } from '../../persistence/types.ts';
import { makeSettings } from './testHelpers.ts';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when no profiles saved', () => {
    expect(getProfiles()).toEqual([]);
  });

  it('saves and loads profiles', () => {
    const profiles: UserProfile[] = [
      { id: '1', name: 'Alice', avatarId: 'default', createdAt: '2024-01-01' },
    ];
    saveProfiles(profiles);
    expect(getProfiles()).toEqual(profiles);
  });

  it('saves and loads active profile id', () => {
    setActiveProfileId('test-id');
    expect(getActiveProfileId()).toBe('test-id');
  });

  it('returns default profile data when none saved', () => {
    const data = getProfileData('nonexistent');
    expect(data.settings.soundEnabled).toBe(true);
    expect(data.settings.zombieSpeedMultiplier).toBe(1.0);
    expect(data.settings.numRows).toBe(6);
    expect(data.progress.completedLevels).toEqual([]);
    expect(data.leaderboard).toEqual([]);
    expect(data.failedChallenges).toEqual([]);
  });

  it('saves and loads profile data', () => {
    const data: ProfileData = {
      settings: makeSettings({ soundEnabled: false, volume: 0.5, avatarId: 'custom' }),
      progress: { completedLevels: ['level-1'], highScores: { 'level-1': 42 } },
      leaderboard: [{ levelId: 'level-1', score: 42, date: '2024-01-01' }],
      failedChallenges: [],
      gameHistory: [],
    };
    saveProfileData('p1', data);
    expect(getProfileData('p1')).toEqual(data);
  });

  it('profile data is isolated between profiles', () => {
    const data1: ProfileData = {
      settings: makeSettings({ avatarId: 'a' }),
      progress: { completedLevels: ['level-1'], highScores: {} },
      leaderboard: [],
      failedChallenges: [],
      gameHistory: [],
    };
    const data2: ProfileData = {
      settings: makeSettings({ soundEnabled: false, volume: 0.3, avatarId: 'b' }),
      progress: { completedLevels: [], highScores: {} },
      leaderboard: [],
      failedChallenges: [],
      gameHistory: [],
    };
    saveProfileData('p1', data1);
    saveProfileData('p2', data2);

    expect(getProfileData('p1').settings.avatarId).toBe('a');
    expect(getProfileData('p2').settings.avatarId).toBe('b');
  });

  it('deletes profile data', () => {
    saveProfileData('p1', {
      settings: makeSettings(),
      progress: { completedLevels: [], highScores: {} },
      leaderboard: [],
      failedChallenges: [],
      gameHistory: [],
    });
    deleteProfileData('p1');
    expect(getProfileData('p1').settings.soundEnabled).toBe(true);
  });

  it('merges defaults when loading saved data missing new settings fields', () => {
    // Simulate old-format data in localStorage (only 3 settings fields)
    const oldData = {
      settings: { soundEnabled: false, volume: 0.5, avatarId: 'old-avatar' },
      progress: { completedLevels: [], highScores: {} },
      leaderboard: [],
      failedChallenges: [],
    };
    localStorage.setItem('zombiemath_profile_old_data', JSON.stringify(oldData));

    const loaded = getProfileData('old');
    // Old values preserved
    expect(loaded.settings.soundEnabled).toBe(false);
    expect(loaded.settings.volume).toBe(0.5);
    expect(loaded.settings.avatarId).toBe('old-avatar');
    // New fields have defaults
    expect(loaded.settings.zombieSpeedMultiplier).toBe(1.0);
    expect(loaded.settings.numRows).toBe(6);
    expect(loaded.settings.showBlood).toBe(true);
    expect(loaded.settings.maxResult).toBe(20);
  });
});

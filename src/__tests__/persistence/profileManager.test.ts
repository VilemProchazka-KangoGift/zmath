import { describe, it, expect, beforeEach } from 'vitest';
import { createProfile, deleteProfile, switchProfile, getActiveProfile } from '../../persistence/profileManager.ts';
import { getProfiles, getActiveProfileId, getProfileData, saveProfileData } from '../../persistence/storage.ts';
import { makeSettings } from './testHelpers.ts';

describe('profileManager', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a profile with UUID', () => {
    const profile = createProfile('Alice');
    expect(profile.name).toBe('Alice');
    expect(profile.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(profile.avatarId).toBe('default');
    expect(profile.createdAt).toBeTruthy();
  });

  it('sets newly created profile as active', () => {
    const profile = createProfile('Alice');
    expect(getActiveProfileId()).toBe(profile.id);
  });

  it('switches active profile', () => {
    const alice = createProfile('Alice');
    const bob = createProfile('Bob');
    expect(getActiveProfileId()).toBe(bob.id);

    switchProfile(alice.id);
    expect(getActiveProfileId()).toBe(alice.id);
  });

  it('throws when switching to nonexistent profile', () => {
    expect(() => switchProfile('nonexistent')).toThrow();
  });

  it('deletes profile and its data', () => {
    const alice = createProfile('Alice');
    saveProfileData(alice.id, {
      settings: makeSettings(),
      progress: { completedLevels: ['level-1'], highScores: {} },
      leaderboard: [],
      failedChallenges: [],
      gameHistory: [],
    });

    deleteProfile(alice.id);

    expect(getProfiles()).toHaveLength(0);
    // Data should be cleaned up (returns default)
    expect(getProfileData(alice.id).progress.completedLevels).toEqual([]);
  });

  it('getActiveProfile returns null when no profiles', () => {
    expect(getActiveProfile()).toBeNull();
  });

  it('getActiveProfile returns current profile', () => {
    const alice = createProfile('Alice');
    expect(getActiveProfile()?.id).toBe(alice.id);
  });
});

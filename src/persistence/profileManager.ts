import type { UserProfile } from './types.ts';
import {
  getProfiles,
  saveProfiles,
  getActiveProfileId,
  setActiveProfileId,
  deleteProfileData,
} from './storage.ts';

function generateId(): string {
  return crypto.randomUUID();
}

export function createProfile(name: string, avatarId = 'default'): UserProfile {
  const profile: UserProfile = {
    id: generateId(),
    name,
    avatarId,
    createdAt: new Date().toISOString(),
  };

  const profiles = getProfiles();
  profiles.push(profile);
  saveProfiles(profiles);
  setActiveProfileId(profile.id);

  return profile;
}

export function deleteProfile(profileId: string): void {
  const profiles = getProfiles().filter(p => p.id !== profileId);
  saveProfiles(profiles);
  deleteProfileData(profileId);

  if (getActiveProfileId() === profileId) {
    if (profiles.length > 0) {
      setActiveProfileId(profiles[0].id);
    } else {
      localStorage.removeItem('zombiemath_active_profile');
    }
  }
}

export function switchProfile(profileId: string): void {
  const profiles = getProfiles();
  if (!profiles.find(p => p.id === profileId)) {
    throw new Error(`Profile ${profileId} not found`);
  }
  setActiveProfileId(profileId);
}

export function getActiveProfile(): UserProfile | null {
  const id = getActiveProfileId();
  if (!id) return null;
  return getProfiles().find(p => p.id === id) ?? null;
}

import type { UserProfile, ProfileData, SavedSettings, SavedProgress } from './types.ts';

const PROFILES_KEY = 'zombiemath_profiles';
const ACTIVE_PROFILE_KEY = 'zombiemath_active_profile';

function profileDataKey(profileId: string): string {
  return `zombiemath_profile_${profileId}_data`;
}

const DEFAULT_SETTINGS: SavedSettings = {
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
};

export function getProfiles(): UserProfile[] {
  const raw = localStorage.getItem(PROFILES_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as UserProfile[];
}

export function saveProfiles(profiles: UserProfile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function getActiveProfileId(): string | null {
  return localStorage.getItem(ACTIVE_PROFILE_KEY);
}

export function setActiveProfileId(id: string): void {
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

export function getProfileData(profileId: string): ProfileData {
  const raw = localStorage.getItem(profileDataKey(profileId));
  if (!raw) return createDefaultProfileData();

  const parsed = JSON.parse(raw) as ProfileData;
  // Merge with defaults to handle newly added settings fields
  parsed.settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
  // Ensure gameHistory exists for profiles created before this feature
  if (!parsed.gameHistory) parsed.gameHistory = [];
  return parsed;
}

export function saveProfileData(profileId: string, data: ProfileData): void {
  localStorage.setItem(profileDataKey(profileId), JSON.stringify(data));
}

export function deleteProfileData(profileId: string): void {
  localStorage.removeItem(profileDataKey(profileId));
}

function createDefaultProfileData(): ProfileData {
  const defaultProgress: SavedProgress = {
    completedLevels: [],
    highScores: {},
  };

  return {
    settings: { ...DEFAULT_SETTINGS },
    progress: defaultProgress,
    leaderboard: [],
    failedChallenges: [],
    gameHistory: [],
  };
}

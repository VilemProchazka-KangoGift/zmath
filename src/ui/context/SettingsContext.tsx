import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SavedSettings } from '../../persistence/types.ts';
import { useProfile } from './ProfileContext.tsx';

interface SettingsContextValue {
  settings: SavedSettings;
  updateSettings: (partial: Partial<SavedSettings>) => void;
}

const defaultSettings: SavedSettings = {
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

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { profileData, saveData } = useProfile();
  const [settings, setSettings] = useState<SavedSettings>(
    profileData?.settings ?? defaultSettings,
  );

  useEffect(() => {
    if (profileData) {
      setSettings(profileData.settings);
    }
  }, [profileData]);

  const updateSettings = (partial: Partial<SavedSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    if (profileData) {
      saveData({ ...profileData, settings: updated });
    }
  };

  return (
    <SettingsContext value={{ settings, updateSettings }}>
      {children}
    </SettingsContext>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

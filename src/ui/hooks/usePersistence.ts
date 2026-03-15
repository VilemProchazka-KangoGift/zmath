import { useCallback } from 'react';
import { useProfile } from '../context/ProfileContext.tsx';
import type { LeaderboardEntry, FailedChallengeRecord, GameHistoryEntry } from '../../persistence/types.ts';

export function usePersistence() {
  const { profileData, saveData, activeProfile } = useProfile();

  const saveScore = useCallback(
    (levelId: string, score: number) => {
      if (!profileData || !activeProfile) return;

      const entry: LeaderboardEntry = {
        levelId,
        score,
        date: new Date().toISOString(),
      };

      const updated = {
        ...profileData,
        leaderboard: [...profileData.leaderboard, entry],
        progress: {
          ...profileData.progress,
          highScores: {
            ...profileData.progress.highScores,
            [levelId]: Math.max(
              profileData.progress.highScores[levelId] ?? 0,
              score,
            ),
          },
        },
      };

      saveData(updated);
    },
    [profileData, activeProfile, saveData],
  );

  const completeLevel = useCallback(
    (levelId: string, score: number) => {
      if (!profileData || !activeProfile) return;

      const completedLevels = profileData.progress.completedLevels.includes(levelId)
        ? profileData.progress.completedLevels
        : [...profileData.progress.completedLevels, levelId];

      const updated = {
        ...profileData,
        progress: {
          ...profileData.progress,
          completedLevels,
          highScores: {
            ...profileData.progress.highScores,
            [levelId]: Math.max(
              profileData.progress.highScores[levelId] ?? 0,
              score,
            ),
          },
        },
        leaderboard: [
          ...profileData.leaderboard,
          { levelId, score, date: new Date().toISOString() },
        ],
      };

      saveData(updated);
    },
    [profileData, activeProfile, saveData],
  );

  const saveFailedChallenges = useCallback(
    (challenges: FailedChallengeRecord[]) => {
      if (!profileData) return;
      saveData({ ...profileData, failedChallenges: challenges });
    },
    [profileData, saveData],
  );

  const saveGameHistory = useCallback(
    (entry: GameHistoryEntry) => {
      if (!profileData) return;
      const history = profileData.gameHistory ?? [];
      saveData({ ...profileData, gameHistory: [...history, entry] });
    },
    [profileData, saveData],
  );

  return {
    profileData,
    saveScore,
    completeLevel,
    saveFailedChallenges,
    saveGameHistory,
    isLevelCompleted: (levelId: string) =>
      profileData?.progress.completedLevels.includes(levelId) ?? false,
    getHighScore: (levelId: string) =>
      profileData?.progress.highScores[levelId] ?? 0,
  };
}

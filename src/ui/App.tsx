import { useState, useEffect, useRef, useCallback } from 'react';
import type { Screen } from '../engine/types.ts';
import { ProfileProvider, useProfile } from './context/ProfileContext.tsx';
import { SettingsProvider } from './context/SettingsContext.tsx';
import { ProfileSelect } from './screens/ProfileSelect.tsx';
import { MainMenu } from './screens/MainMenu.tsx';
import { ModeSelect } from './screens/ModeSelect.tsx';
import { LevelSelect } from './screens/LevelSelect.tsx';
import { SettingsScreen } from './screens/SettingsScreen.tsx';
import { LeaderboardScreen } from './screens/LeaderboardScreen.tsx';
import { FailedQuestionsScreen } from './screens/FailedQuestionsScreen.tsx';
import { GameHistoryScreen } from './screens/GameHistoryScreen.tsx';
import { GameScreen } from './screens/GameScreen.tsx';

function screenToHash(screen: Screen): string {
  switch (screen.id) {
    case 'profileSelect': return '#/profil';
    case 'menu': return '#/menu';
    case 'modeSelect': return '#/rezim';
    case 'levelSelect': return '#/levely';
    case 'settings': return '#/nastaveni';
    case 'leaderboard': return '#/zebricek';
    case 'failedQuestions': return '#/chyby';
    case 'gameHistory': return '#/historie';
    case 'game':
      return screen.mode === 'survival'
        ? '#/hra/preziti'
        : `#/hra/level/${screen.levelId}`;
  }
}

function hashToScreen(hash: string): Screen | null {
  if (!hash || hash === '#' || hash === '#/') return null;
  if (hash === '#/profil') return { id: 'profileSelect' };
  if (hash === '#/menu') return { id: 'menu' };
  if (hash === '#/rezim') return { id: 'modeSelect' };
  if (hash === '#/levely') return { id: 'levelSelect' };
  if (hash === '#/nastaveni') return { id: 'settings' };
  if (hash === '#/zebricek') return { id: 'leaderboard' };
  if (hash === '#/chyby') return { id: 'failedQuestions' };
  if (hash === '#/historie') return { id: 'gameHistory' };
  if (hash === '#/hra/preziti') return { id: 'game', levelId: 'survival', mode: 'survival' };
  const levelMatch = hash.match(/^#\/hra\/level\/(.+)$/);
  if (levelMatch) return { id: 'game', levelId: levelMatch[1], mode: 'levels' };
  return null;
}

function AppInner() {
  const { activeProfile } = useProfile();
  const [screen, setScreenRaw] = useState<Screen>({ id: 'profileSelect' });
  const initializedRef = useRef(false);
  const skipHashUpdate = useRef(false);

  // Navigate: update state + push to history
  const navigate = useCallback((newScreen: Screen) => {
    setScreenRaw(newScreen);
    const hash = screenToHash(newScreen);
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash);
    }
  }, []);

  // On initial load: restore from hash or profile state
  useEffect(() => {
    if (initializedRef.current) return;
    const fromHash = hashToScreen(window.location.hash);
    if (fromHash) {
      // Don't navigate to game/settings/etc without a profile
      if (activeProfile || fromHash.id === 'profileSelect') {
        setScreenRaw(fromHash);
        initializedRef.current = true;
        return;
      }
    }
    if (activeProfile) {
      navigate({ id: 'menu' });
      initializedRef.current = true;
    }
  }, [activeProfile, navigate]);

  // Listen for browser back/forward
  useEffect(() => {
    const onPopState = () => {
      const fromHash = hashToScreen(window.location.hash);
      if (fromHash) {
        skipHashUpdate.current = true;
        setScreenRaw(fromHash);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Sync hash when screen changes via skipHashUpdate (popstate)
  useEffect(() => {
    if (skipHashUpdate.current) {
      skipHashUpdate.current = false;
      return;
    }
  }, [screen]);

  switch (screen.id) {
    case 'profileSelect':
      return (
        <ProfileSelect onSelect={() => navigate({ id: 'menu' })} />
      );

    case 'menu':
      return (
        <MainMenu
          onPlay={() => navigate({ id: 'modeSelect' })}
          onSettings={() => navigate({ id: 'settings' })}
          onLeaderboard={() => navigate({ id: 'leaderboard' })}
          onFailedQuestions={() => navigate({ id: 'failedQuestions' })}
          onGameHistory={() => navigate({ id: 'gameHistory' })}
          onSwitchProfile={() => navigate({ id: 'profileSelect' })}
        />
      );

    case 'modeSelect':
      return (
        <ModeSelect
          onSurvival={() => navigate({ id: 'game', levelId: 'survival', mode: 'survival' })}
          onLevels={() => navigate({ id: 'levelSelect' })}
          onBack={() => navigate({ id: 'menu' })}
        />
      );

    case 'levelSelect':
      return (
        <LevelSelect
          onSelectLevel={(levelId) => navigate({ id: 'game', levelId, mode: 'levels' })}
          onBack={() => navigate({ id: 'modeSelect' })}
        />
      );

    case 'settings':
      return (
        <SettingsScreen onBack={() => navigate({ id: 'menu' })} />
      );

    case 'leaderboard':
      return (
        <LeaderboardScreen onBack={() => navigate({ id: 'menu' })} />
      );

    case 'failedQuestions':
      return (
        <FailedQuestionsScreen onBack={() => navigate({ id: 'menu' })} />
      );

    case 'gameHistory':
      return (
        <GameHistoryScreen onBack={() => navigate({ id: 'menu' })} />
      );

    case 'game':
      return (
        <GameScreen
          levelId={screen.levelId}
          mode={screen.mode}
          onMenu={() => navigate({ id: 'menu' })}
          onNextLevel={(nextId) => navigate({ id: 'game', levelId: nextId, mode: 'levels' })}
        />
      );
  }
}

export function App() {
  return (
    <ProfileProvider>
      <SettingsProvider>
        <AppInner />
      </SettingsProvider>
    </ProfileProvider>
  );
}

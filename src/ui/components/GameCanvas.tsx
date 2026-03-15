import { useRef, useEffect, useCallback } from 'react';
import { useGameEngine } from '../hooks/useGameEngine.ts';
import { useGameEvents } from '../hooks/useGameEvents.ts';
import { usePersistence } from '../hooks/usePersistence.ts';
import { useSettings } from '../context/SettingsContext.tsx';
import { LEVELS } from '../../config/levels.ts';
import { HUD } from './HUD.tsx';
import { GameOverScreen } from './GameOverScreen.tsx';
import { PauseOverlay } from './PauseOverlay.tsx';
import type { GameEvent } from '../../engine/types.ts';
import type { SlowAnswer } from '../../persistence/types.ts';

interface GameCanvasProps {
  levelId: string;
  mode: 'survival' | 'levels';
  onMenu: () => void;
  onNextLevel?: (levelId: string) => void;
}

export function GameCanvas({ levelId, mode, onMenu, onNextLevel }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { settings } = useSettings();
  const { getEngine } = useGameEngine(levelId, canvasRef, settings);
  const uiState = useGameEvents(getEngine);
  const { saveScore, completeLevel, saveFailedChallenges, saveGameHistory } = usePersistence();
  const savedRef = useRef(false);

  // Game stats tracking
  const gameStatsRef = useRef({
    correctAnswers: 0,
    incorrectAnswers: 0,
    zombiesEscaped: 0,
    maxStreak: 0,
    totalResponseTimeMs: 0,
    slowAnswers: [] as SlowAnswer[],
  });

  // Track game stats via engine events
  useEffect(() => {
    const engine = getEngine();
    if (!engine) return;

    const statsHandler = (event: GameEvent) => {
      const stats = gameStatsRef.current;
      switch (event.type) {
        case 'challengeCorrect':
          stats.correctAnswers++;
          stats.totalResponseTimeMs += event.responseTimeMs;
          if (event.responseTimeMs >= 20000) {
            stats.slowAnswers.push({
              challengeDisplay: event.challenge.display,
              challengeAnswer: event.challenge.answer,
              responseTimeMs: event.responseTimeMs,
            });
          }
          break;
        case 'challengeIncorrect':
          stats.incorrectAnswers++;
          break;
        case 'zombieReachedEnd':
          stats.zombiesEscaped++;
          break;
        case 'streakUpdate':
          if (event.streak > stats.maxStreak) {
            stats.maxStreak = event.streak;
          }
          break;
        case 'restarted':
          stats.correctAnswers = 0;
          stats.incorrectAnswers = 0;
          stats.zombiesEscaped = 0;
          stats.maxStreak = 0;
          stats.totalResponseTimeMs = 0;
          stats.slowAnswers = [];
          break;
      }
    };

    engine.on(statsHandler);
    return () => { engine.off(statsHandler); };
  }, [getEngine]);

  // Apply settings to engine
  useEffect(() => {
    const engine = getEngine();
    if (!engine) return;
    engine.setSoundEnabled(settings.soundEnabled);
    engine.setMasterVolume(settings.volume);
  }, [getEngine, settings]);

  // Save score + game history on game over / level complete
  useEffect(() => {
    if (savedRef.current) return;
    const engine = getEngine();
    if (!engine) return;

    const saveHistory = () => {
      const state = engine.getState();
      const stats = gameStatsRef.current;
      saveGameHistory({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        levelId,
        mode,
        date: new Date().toISOString(),
        durationMs: state.levelTimer,
        score: uiState.finalScore,
        correctAnswers: stats.correctAnswers,
        incorrectAnswers: stats.incorrectAnswers,
        zombiesEscaped: stats.zombiesEscaped,
        maxStreak: stats.maxStreak,
        avgResponseTimeMs: stats.correctAnswers > 0
          ? stats.totalResponseTimeMs / stats.correctAnswers
          : 0,
        slowAnswers: stats.slowAnswers,
      });
    };

    if (uiState.gameOver) {
      savedRef.current = true;
      saveScore(levelId, uiState.finalScore);
      saveFailedChallenges(engine.getFailedChallenges());
      saveHistory();
    } else if (uiState.levelComplete) {
      savedRef.current = true;
      completeLevel(levelId, uiState.finalScore);
      saveFailedChallenges(engine.getFailedChallenges());
      saveHistory();
    }
  }, [uiState.gameOver, uiState.levelComplete, uiState.finalScore, levelId, mode, getEngine, saveScore, completeLevel, saveFailedChallenges, saveGameHistory]);

  // Save in-progress score when quitting mid-game (quit button, back button, browser close)
  const saveInProgressRef = useRef<() => void>(() => {});
  saveInProgressRef.current = () => {
    if (savedRef.current) return;
    const engine = getEngine();
    if (!engine) return;
    const state = engine.getState();
    if (state.gameOver || state.levelComplete) return;
    if (state.score === 0) return;
    savedRef.current = true;
    saveScore(levelId, state.score);
    saveFailedChallenges(engine.getFailedChallenges());
    const stats = gameStatsRef.current;
    saveGameHistory({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      levelId,
      mode,
      date: new Date().toISOString(),
      durationMs: state.levelTimer,
      score: state.score,
      correctAnswers: stats.correctAnswers,
      incorrectAnswers: stats.incorrectAnswers,
      zombiesEscaped: stats.zombiesEscaped,
      maxStreak: stats.maxStreak,
      avgResponseTimeMs: stats.correctAnswers > 0
        ? stats.totalResponseTimeMs / stats.correctAnswers
        : 0,
      slowAnswers: stats.slowAnswers,
    });
  };

  useEffect(() => {
    const handler = () => saveInProgressRef.current();
    window.addEventListener('beforeunload', handler);
    window.addEventListener('pagehide', handler);
    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener('beforeunload', handler);
      window.removeEventListener('pagehide', handler);
      window.removeEventListener('popstate', handler);
    };
  }, []);

  const handleQuit = useCallback(() => {
    saveInProgressRef.current();
    onMenu();
  }, [onMenu]);

  // Keyboard handling
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const engine = getEngine();
      if (!engine) return;

      engine.markUserInteracted();

      if (e.key === 'Escape') {
        const state = engine.getState();
        if (state.paused) {
          engine.resume();
        } else if (!state.gameOver && !state.levelComplete) {
          engine.pause();
        }
        return;
      }

      if (e.key === ' ' && uiState.gameOver) {
        e.preventDefault();
        handleRestart();
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        engine.movePlayerUp();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        engine.movePlayerDown();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [getEngine, uiState.gameOver]);

  const handleSubmit = useCallback(
    (value: string) => {
      const engine = getEngine();
      if (engine) {
        engine.markUserInteracted();
        engine.submitAnswer(value);
      }
    },
    [getEngine],
  );

  const handleRestart = useCallback(() => {
    savedRef.current = false;
    getEngine()?.restart();
  }, [getEngine]);

  const handleResume = useCallback(() => {
    getEngine()?.resume();
  }, [getEngine]);

  // Find next level
  const currentLevelIndex = LEVELS.findIndex(l => l.id === levelId);
  const nextLevel = currentLevelIndex >= 0 && currentLevelIndex < LEVELS.length - 1
    ? LEVELS[currentLevelIndex + 1]
    : null;

  const handleNextLevel = useCallback(() => {
    if (nextLevel && onNextLevel) {
      onNextLevel(nextLevel.id);
    }
  }, [nextLevel, onNextLevel]);

  return (
    <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
      <div style={{ textAlign: 'right', marginBottom: '4px' }}>
        <button
          data-testid="quit-btn"
          onClick={handleQuit}
          style={{
            fontSize: '13px',
            padding: '4px 12px',
            background: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Ukončit hru
        </button>
      </div>
      <canvas ref={canvasRef} data-testid="game-canvas" />

      {uiState.paused && (
        <PauseOverlay onResume={handleResume} onMenu={handleQuit} />
      )}

      {!uiState.gameOver && !uiState.levelComplete && (
        <HUD
          score={uiState.score}
          remainingMs={uiState.remainingMs}
          elapsedMs={uiState.elapsedMs}
          cooldown={uiState.cooldown}
          onSubmit={handleSubmit}
          showTimer={settings.showTimer && mode !== 'survival'}
          streak={uiState.streak}
          phaseType={uiState.phaseType}
          phaseIndex={uiState.phaseIndex}
          correctAnswers={uiState.correctAnswers}
          incorrectAnswers={uiState.incorrectAnswers}
        />
      )}

      {uiState.gameOver && (
        <GameOverScreen
          score={uiState.finalScore}
          onRestart={handleRestart}
          onMenu={onMenu}
        />
      )}

      {uiState.levelComplete && (
        <div data-testid="level-complete" style={{ textAlign: 'center', padding: '20px' }}>
          <h2 style={{ color: 'green', fontSize: '24px' }}>Level hotov!</h2>
          <p style={{ fontSize: '20px' }}>Skóre: {uiState.finalScore}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
            <button
              data-testid="restart-btn"
              onClick={handleRestart}
              style={{ fontSize: '16px', padding: '5px 20px', background: '#16213e', color: '#e0e0e0', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer' }}
            >
              Znovu
            </button>
            {nextLevel && onNextLevel && (
              <button
                data-testid="next-level-btn"
                onClick={handleNextLevel}
                style={{ fontSize: '16px', padding: '5px 20px', background: '#16213e', color: '#4ade80', border: '1px solid #4ade80', borderRadius: '8px', cursor: 'pointer' }}
              >
                Další level
              </button>
            )}
            <button
              data-testid="menu-btn"
              onClick={onMenu}
              style={{ fontSize: '16px', padding: '5px 20px', background: '#16213e', color: '#aaa', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer' }}
            >
              Menu
            </button>
          </div>
        </div>
      )}

      {!uiState.gameOver && !uiState.levelComplete && (() => {
        const state = getEngine()?.getState();
        if (!state) return null;
        return (
          <div
            data-testid="debug-stats"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#555',
              marginTop: '2px',
              paddingRight: '4px',
            }}
          >
            <span>speed: {state.zombieSpeed.toFixed(4)}</span>
            <span>spawn: {(state.spawnRate / 1000).toFixed(1)}s</span>
          </div>
        );
      })()}
    </div>
  );
}

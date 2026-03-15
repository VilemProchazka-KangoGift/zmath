import { useState, useEffect } from 'react';
import type { GameEngine } from '../../engine/GameEngine.ts';
import type { GameEvent, PhaseType } from '../../engine/types.ts';

interface GameUIState {
  score: number;
  remainingMs: number;
  elapsedMs: number;
  gameOver: boolean;
  levelComplete: boolean;
  paused: boolean;
  cooldown: boolean;
  finalScore: number;
  streak: number;
  phaseIndex: number;
  phaseType: PhaseType | null;
  phaseAnnounce: string | null;
  correctAnswers: number;
  incorrectAnswers: number;
}

export function useGameEvents(getEngine: () => GameEngine | null): GameUIState {
  const [uiState, setUIState] = useState<GameUIState>({
    score: 0,
    remainingMs: 0,
    elapsedMs: 0,
    gameOver: false,
    levelComplete: false,
    paused: false,
    cooldown: false,
    finalScore: 0,
    streak: 0,
    phaseIndex: 0,
    phaseType: null,
    phaseAnnounce: null,
    correctAnswers: 0,
    incorrectAnswers: 0,
  });

  useEffect(() => {
    const engine = getEngine();
    if (!engine) return;

    const handler = (event: GameEvent) => {
      switch (event.type) {
        case 'scoreChanged':
          setUIState(s => ({ ...s, score: event.score }));
          break;
        case 'timerUpdate':
          setUIState(s => ({ ...s, remainingMs: event.remainingMs, elapsedMs: event.elapsedMs }));
          break;
        case 'challengeCorrect':
          setUIState(s => ({ ...s, correctAnswers: s.correctAnswers + 1 }));
          break;
        case 'challengeIncorrect':
          setUIState(s => ({ ...s, incorrectAnswers: s.incorrectAnswers + 1 }));
          break;
        case 'gameOver':
          setUIState(s => ({ ...s, gameOver: true, finalScore: event.finalScore }));
          break;
        case 'levelComplete':
          setUIState(s => ({ ...s, levelComplete: true, finalScore: event.score }));
          break;
        case 'paused':
          setUIState(s => ({ ...s, paused: true }));
          break;
        case 'resumed':
          setUIState(s => ({ ...s, paused: false }));
          break;
        case 'cooldownStarted':
          setUIState(s => ({ ...s, cooldown: true }));
          break;
        case 'cooldownEnded':
          setUIState(s => ({ ...s, cooldown: false }));
          break;
        case 'streakUpdate':
          setUIState(s => ({ ...s, streak: event.streak }));
          break;
        case 'phaseChanged':
          setUIState(s => ({
            ...s,
            phaseIndex: event.phaseIndex,
            phaseType: event.phaseType,
          }));
          break;
        case 'phaseAnnounce':
          setUIState(s => ({ ...s, phaseAnnounce: event.text }));
          break;
        case 'phaseAnnounceEnd':
          setUIState(s => ({ ...s, phaseAnnounce: null }));
          break;
        case 'restarted':
          setUIState({
            score: 0,
            remainingMs: 0,
            elapsedMs: 0,
            gameOver: false,
            levelComplete: false,
            paused: false,
            cooldown: false,
            finalScore: 0,
            streak: 0,
            phaseIndex: 0,
            phaseType: null,
            phaseAnnounce: null,
            correctAnswers: 0,
            incorrectAnswers: 0,
          });
          break;
      }
    };

    engine.on(handler);
    return () => { engine.off(handler); };
  }, [getEngine]);

  return uiState;
}

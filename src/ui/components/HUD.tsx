import { useRef, useEffect } from 'react';
import type { PhaseType } from '../../engine/types.ts';

interface HUDProps {
  score: number;
  remainingMs: number;
  elapsedMs: number;
  cooldown: boolean;
  onSubmit: (value: string) => void;
  showTimer: boolean;
  streak?: number;
  phaseType?: PhaseType | null;
  phaseIndex?: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

const PHASE_LABELS: Record<PhaseType, string> = {
  warmup: 'Rozcvička',
  wave: 'Vlna',
  breather: 'Oddech',
  boss: 'BOSS',
  victory: 'Vítězství',
};

export function HUD({ score, remainingMs, elapsedMs, cooldown, onSubmit, showTimer, streak, phaseType, phaseIndex, correctAnswers, incorrectAnswers }: HUDProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (cooldown) return;
      const val = inputRef.current?.value ?? '';
      onSubmit(val);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    // Allow digits (for math) and i/y (for czech) — strip everything else
    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9iyíý]/gi, '').toLowerCase();
  };

  const seconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const elapsedSec = Math.floor(elapsedMs / 1000);
  const elapsedMin = Math.floor(elapsedSec / 60);
  const elapsedS = elapsedSec % 60;

  const phaseLabel = phaseType ? PHASE_LABELS[phaseType] : null;

  return (
    <div data-testid="hud" style={{ textAlign: 'center', marginTop: '10px' }}>
      <input
        ref={inputRef}
        type="text"
        data-testid="answer-input"
        placeholder="Zadej odpověď..."
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        style={{
          width: '320px',
          fontSize: '28px',
          textAlign: 'center',
          padding: '10px 16px',
          opacity: cooldown ? 0.4 : 1,
          borderColor: cooldown ? '#ef4444' : '#4ade80',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '10px', alignItems: 'baseline' }}>
        <div data-testid="score-display" style={{ fontSize: '32px', fontFamily: 'Creepster, cursive', color: '#4ade80' }}>
          Skóre: {score}
        </div>
        {showTimer && (
          <div data-testid="timer-display" style={{ fontSize: '20px', color: '#888', fontFamily: 'monospace' }}>
            {minutes}:{secs.toString().padStart(2, '0')}
          </div>
        )}
        {phaseLabel && (
          <div
            data-testid="phase-display"
            style={{
              fontSize: '18px',
              fontFamily: 'Creepster, cursive',
              color: phaseType === 'boss' ? '#ef4444' : '#4ade80',
            }}
          >
            {phaseLabel}{phaseType === 'wave' ? ` ${(phaseIndex ?? 0) + 1}` : ''}
          </div>
        )}
        {(streak ?? 0) >= 5 && (
          <div
            data-testid="streak-display"
            style={{
              fontSize: '18px',
              fontFamily: 'Creepster, cursive',
              color: '#fbbf24',
            }}
          >
            Série: {streak}
          </div>
        )}
      </div>
      <div
        data-testid="game-stats"
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '6px',
          fontSize: '13px',
          fontFamily: 'monospace',
          color: '#888',
        }}
      >
        <span>Zabito: {correctAnswers}</span>
        <span style={{ color: '#4ade80' }}>Správně: {correctAnswers}</span>
        <span style={{ color: '#ef4444' }}>Špatně: {incorrectAnswers}</span>
        <span>Čas: {elapsedMin}:{elapsedS.toString().padStart(2, '0')}</span>
      </div>
    </div>
  );
}

import { LEVELS } from '../../config/levels.ts';
import { usePersistence } from '../hooks/usePersistence.ts';

interface LevelSelectProps {
  onSelectLevel: (levelId: string) => void;
  onBack: () => void;
}

export function LevelSelect({ onSelectLevel, onBack }: LevelSelectProps) {
  const { isLevelCompleted, getHighScore } = usePersistence();

  const isUnlocked = (levelId: string): boolean => {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level?.unlockCondition) return true;
    return isLevelCompleted(level.unlockCondition.levelId);
  };

  return (
    <div data-testid="level-select" style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h1>Vyber level</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
        {LEVELS.map((level) => {
          const unlocked = isUnlocked(level.id);
          const completed = isLevelCompleted(level.id);
          const highScore = getHighScore(level.id);
          const phaseCount = level.phases?.length ?? 0;

          return (
            <button
              key={level.id}
              data-testid={`level-${level.id}`}
              onClick={() => unlocked && onSelectLevel(level.id)}
              disabled={!unlocked}
              style={{
                width: '160px',
                padding: '15px',
                fontSize: '16px',
                cursor: unlocked ? 'pointer' : 'not-allowed',
                opacity: unlocked ? 1 : 0.4,
                border: completed ? '2px solid #4ade80' : '1px solid #333',
                background: completed ? '#16213e' : '#16213e',
                borderRadius: '10px',
                color: '#e0e0e0',
              }}
            >
              <div style={{ fontWeight: 'bold', color: completed ? '#4ade80' : '#e0e0e0' }}>{level.name}</div>
              {level.theme && (
                <div style={{ fontSize: '11px', color: '#aaa', fontStyle: 'italic' }}>
                  {level.theme}
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#888' }}>
                {phaseCount > 0
                  ? `${phaseCount} fází`
                  : `${Math.round(level.durationMs / 1000)}s`}
              </div>
              {completed && (
                <div style={{ fontSize: '12px', color: '#4ade80' }}>
                  Nejlepší: {highScore}
                </div>
              )}
              {completed && (
                <div
                  style={{ fontSize: '11px', color: '#888', marginTop: '4px', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLevel(level.id);
                  }}
                >
                  Znovu
                </div>
              )}
              {!unlocked && (
                <div style={{ fontSize: '12px', color: '#666' }}>Zamčeno</div>
              )}
            </button>
          );
        })}
      </div>

      <button
        data-testid="back-btn"
        onClick={onBack}
        style={{ marginTop: '30px', fontSize: '16px', padding: '8px 30px', background: '#16213e', color: '#aaa', border: '1px solid #333', borderRadius: '8px' }}
      >
        Zpět
      </button>
    </div>
  );
}

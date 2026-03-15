import { usePersistence } from '../hooks/usePersistence.ts';
import { LEVELS, SURVIVAL_LEVEL } from '../../config/levels.ts';
import type { GameHistoryEntry } from '../../persistence/types.ts';

interface LeaderboardScreenProps {
  onBack: () => void;
}

function SurvivalStats({ history }: { history: GameHistoryEntry[] }) {
  const games = history.filter(g => g.mode === 'survival');
  if (games.length === 0) return <p style={{ color: '#666' }}>Žádné skóre</p>;

  const bestScore = Math.max(...games.map(g => g.score));
  const mostKills = Math.max(...games.map(g => g.correctAnswers));
  const totalCorrect = games.reduce((s, g) => s + g.correctAnswers, 0);
  const totalIncorrect = games.reduce((s, g) => s + g.incorrectAnswers, 0);
  const totalAnswers = totalCorrect + totalIncorrect;
  const ratio = totalAnswers > 0 ? (totalCorrect / totalAnswers * 100).toFixed(0) : '–';
  const bestStreak = Math.max(...games.map(g => g.maxStreak));

  const statStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
    borderBottom: '1px solid #222',
  };

  return (
    <div style={{ textAlign: 'left', maxWidth: '320px', margin: '0 auto' }}>
      <div style={statStyle}>
        <span style={{ color: '#888' }}>Nejlepší skóre</span>
        <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{bestScore}</span>
      </div>
      <div style={statStyle}>
        <span style={{ color: '#888' }}>Nejvíc zabito</span>
        <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{mostKills}</span>
      </div>
      <div style={statStyle}>
        <span style={{ color: '#888' }}>Správně / Špatně</span>
        <span>
          <span style={{ color: '#4ade80' }}>{totalCorrect}</span>
          {' / '}
          <span style={{ color: '#ef4444' }}>{totalIncorrect}</span>
          <span style={{ color: '#888' }}> ({ratio}%)</span>
        </span>
      </div>
      <div style={statStyle}>
        <span style={{ color: '#888' }}>Nejdelší série</span>
        <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{bestStreak}</span>
      </div>
      <div style={{ ...statStyle, borderBottom: 'none' }}>
        <span style={{ color: '#888' }}>Odehráno her</span>
        <span style={{ color: '#e0e0e0' }}>{games.length}</span>
      </div>

      <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>Top 5 skóre</div>
      <ol style={{ display: 'inline-block', textAlign: 'left', color: '#e0e0e0', marginTop: '4px' }}>
        {games
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map((g, i) => (
            <li key={i} style={{ padding: '2px 0' }}>
              <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{g.score}</span> bodů
              {' '}({g.correctAnswers} zabito)
              {' — '}<span style={{ color: '#888' }}>{new Date(g.date).toLocaleDateString('cs-CZ')}</span>
            </li>
          ))}
      </ol>
    </div>
  );
}

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const { profileData } = usePersistence();
  const entries = profileData?.leaderboard ?? [];
  const history = profileData?.gameHistory ?? [];

  return (
    <div data-testid="leaderboard-screen" style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h1>Žebříček</h1>

      {/* Survival mode — detailed stats */}
      <div style={{ margin: '20px auto', maxWidth: '400px', background: '#16213e', border: '1px solid #333', borderRadius: '10px', padding: '16px' }}>
        <h3 style={{ color: '#4ade80', fontFamily: 'Creepster, cursive', letterSpacing: '1px' }}>{SURVIVAL_LEVEL.name}</h3>
        <SurvivalStats history={history} />
      </div>

      {/* Regular levels — simple top 10 */}
      {LEVELS.map((level) => {
        const levelEntries = entries
          .filter((e) => e.levelId === level.id)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);

        return (
          <div key={level.id} style={{ margin: '20px auto', maxWidth: '400px', background: '#16213e', border: '1px solid #333', borderRadius: '10px', padding: '16px' }}>
            <h3 style={{ color: '#4ade80', fontFamily: 'Creepster, cursive', letterSpacing: '1px' }}>{level.name}</h3>
            {levelEntries.length === 0 ? (
              <p style={{ color: '#666' }}>Žádné skóre</p>
            ) : (
              <ol style={{ display: 'inline-block', textAlign: 'left', color: '#e0e0e0' }}>
                {levelEntries.map((entry, i) => (
                  <li key={i} style={{ padding: '2px 0' }}>
                    <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{entry.score}</span> bodů — <span style={{ color: '#888' }}>{new Date(entry.date).toLocaleDateString('cs-CZ')}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        );
      })}

      <button
        data-testid="leaderboard-back-btn"
        onClick={onBack}
        style={{ marginTop: '20px', fontSize: '16px', padding: '8px 30px', background: '#16213e', color: '#aaa', border: '1px solid #333', borderRadius: '8px' }}
      >
        Zpět
      </button>
    </div>
  );
}

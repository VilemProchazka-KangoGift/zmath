import { useProfile } from '../context/ProfileContext.tsx';

interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
  onLeaderboard: () => void;
  onFailedQuestions: () => void;
  onGameHistory: () => void;
  onSwitchProfile: () => void;
}

export function MainMenu({ onPlay, onSettings, onLeaderboard, onFailedQuestions, onGameHistory, onSwitchProfile }: MainMenuProps) {
  const { activeProfile } = useProfile();

  return (
    <div data-testid="main-menu" style={{ padding: '30px 20px' }}>
      <h1 style={{ fontSize: '4rem', margin: '10px 0' }}>Zombie Matika</h1>
      <div style={{ fontSize: '1.1rem', color: '#4ade80', marginBottom: '8px', fontFamily: 'Creepster, cursive', letterSpacing: '1px' }}>
        Počítej nebo tě sežerou!
      </div>
      {activeProfile && (
        <p style={{ fontSize: '15px', color: '#888', marginBottom: '20px' }}>Hráč: {activeProfile.name}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <button data-testid="play-btn" onClick={onPlay} style={primaryBtn}>
          Hrát
        </button>
        <button data-testid="settings-btn" onClick={onSettings} style={secondaryBtn}>
          Nastavení
        </button>
        <button data-testid="leaderboard-btn" onClick={onLeaderboard} style={secondaryBtn}>
          Žebříček
        </button>
        <button data-testid="failed-questions-btn" onClick={onFailedQuestions} style={secondaryBtn}>
          Chybné příklady
        </button>
        <button data-testid="game-history-btn" onClick={onGameHistory} style={secondaryBtn}>
          Historie her
        </button>
        <button data-testid="switch-profile-btn" onClick={onSwitchProfile} style={{
          ...secondaryBtn,
          background: 'transparent',
          border: '1px solid #555',
          color: '#888',
          fontSize: '14px',
          padding: '8px 30px',
        }}>
          Změnit profil
        </button>
      </div>

      <div style={{ marginTop: '30px', fontSize: '13px', color: '#555', lineHeight: '1.8' }}>
        <b style={{ color: '#4ade80' }}>&uarr;&darr;</b> pohyb &nbsp;
        <b style={{ color: '#4ade80' }}>Číslo + Enter</b> střela &nbsp;
        <b style={{ color: '#4ade80' }}>Escape</b> pauza
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  fontSize: '22px',
  padding: '14px 50px',
  width: '280px',
  background: 'linear-gradient(135deg, #166534, #15803d)',
  color: '#fff',
  border: '2px solid #4ade80',
  borderRadius: '12px',
  fontWeight: 'bold',
  letterSpacing: '1px',
  textTransform: 'uppercase',
  fontFamily: 'Creepster, cursive',
};

const secondaryBtn: React.CSSProperties = {
  fontSize: '16px',
  padding: '10px 40px',
  width: '280px',
  background: '#16213e',
  color: '#e0e0e0',
  border: '1px solid #333',
  borderRadius: '8px',
};

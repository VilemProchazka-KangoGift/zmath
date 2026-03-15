interface GameOverScreenProps {
  score: number;
  onRestart: () => void;
  onMenu: () => void;
}

export function GameOverScreen({ score, onRestart, onMenu }: GameOverScreenProps) {
  return (
    <div data-testid="game-over" style={{ textAlign: 'center', padding: '20px' }}>
      <h2 style={{ color: '#ef4444', fontSize: '2rem', fontFamily: 'Creepster, cursive', textShadow: '0 0 15px rgba(239,68,68,0.5)' }}>
        Zombíci tě sežrali!
      </h2>
      <p style={{ fontSize: '24px', color: '#4ade80', fontFamily: 'Creepster, cursive', margin: '10px 0' }}>
        Skóre: {score}
      </p>
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          data-testid="restart-btn"
          onClick={onRestart}
          style={{
            fontSize: '16px', padding: '10px 24px',
            background: 'linear-gradient(135deg, #166534, #15803d)',
            color: '#fff', border: '2px solid #4ade80', borderRadius: '8px',
          }}
        >
          Znovu (mezerník)
        </button>
        <button
          data-testid="menu-btn"
          onClick={onMenu}
          style={{
            fontSize: '16px', padding: '10px 24px',
            background: '#16213e', color: '#aaa', border: '1px solid #333', borderRadius: '8px',
          }}
        >
          Menu
        </button>
      </div>
    </div>
  );
}

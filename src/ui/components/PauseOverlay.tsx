interface PauseOverlayProps {
  onResume: () => void;
  onMenu: () => void;
}

export function PauseOverlay({ onResume, onMenu }: PauseOverlayProps) {
  return (
    <div
      data-testid="pause-overlay"
      style={{
        textAlign: 'center',
        padding: '30px 40px',
        background: 'rgba(0,0,0,0.85)',
        color: '#fff',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '12px',
        border: '2px solid #4ade80',
        zIndex: 10,
        boxShadow: '0 0 30px rgba(0,0,0,0.7)',
      }}
    >
      <h2 style={{ fontFamily: 'Creepster, cursive', color: '#4ade80', fontSize: '2rem', marginBottom: '16px' }}>Pauza</h2>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          data-testid="resume-btn"
          onClick={onResume}
          style={{
            fontSize: '16px', padding: '10px 24px',
            background: 'linear-gradient(135deg, #166534, #15803d)',
            color: '#fff', border: '2px solid #4ade80', borderRadius: '8px',
          }}
        >
          Pokračovat
        </button>
        <button
          data-testid="pause-menu-btn"
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

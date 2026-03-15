interface ModeSelectProps {
  onSurvival: () => void;
  onLevels: () => void;
  onBack: () => void;
}

export function ModeSelect({ onSurvival, onLevels, onBack }: ModeSelectProps) {
  return (
    <div data-testid="mode-select" style={{ padding: '40px 20px' }}>
      <h1>Vyber režim</h1>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '30px' }}>
        <button
          data-testid="survival-btn"
          onClick={onSurvival}
          style={{
            fontSize: '22px',
            padding: '20px 40px',
            width: '340px',
            background: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
            color: '#fff',
            border: '2px solid #f87171',
            borderRadius: '12px',
            fontFamily: 'Creepster, cursive',
            letterSpacing: '1px',
          }}
        >
          Přežití
          <div style={{ fontSize: '14px', color: '#fca5a5', marginTop: '6px', fontFamily: 'Inter, sans-serif' }}>
            Hraj dokud přežiješ
          </div>
        </button>
        <button
          data-testid="levels-btn"
          onClick={onLevels}
          style={{
            fontSize: '22px',
            padding: '20px 40px',
            width: '340px',
            background: 'linear-gradient(135deg, #1e3a5f, #1e40af)',
            color: '#fff',
            border: '2px solid #60a5fa',
            borderRadius: '12px',
            fontFamily: 'Creepster, cursive',
            letterSpacing: '1px',
          }}
        >
          Levely
          <div style={{ fontSize: '14px', color: '#93c5fd', marginTop: '6px', fontFamily: 'Inter, sans-serif' }}>
            Časovaná kola s rostoucí obtížností
          </div>
        </button>
      </div>

      <button
        data-testid="mode-back-btn"
        onClick={onBack}
        style={{ marginTop: '30px', fontSize: '14px', padding: '8px 24px', background: '#16213e', color: '#aaa', border: '1px solid #333', borderRadius: '6px' }}
      >
        Zpět
      </button>
    </div>
  );
}

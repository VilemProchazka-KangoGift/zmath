import { usePersistence } from '../hooks/usePersistence.ts';

interface FailedQuestionsScreenProps {
  onBack: () => void;
}

export function FailedQuestionsScreen({ onBack }: FailedQuestionsScreenProps) {
  const { profileData } = usePersistence();
  const failed = profileData?.failedChallenges ?? [];

  return (
    <div data-testid="failed-questions-screen" style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h1>Chybné příklady</h1>

      {failed.length === 0 ? (
        <p style={{ color: '#888', marginTop: '20px' }}>Žádné chyby</p>
      ) : (
        <table style={{ margin: '20px auto', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 16px', borderBottom: '2px solid #333', color: '#4ade80' }}>Příklad</th>
              <th style={{ padding: '8px 16px', borderBottom: '2px solid #333', color: '#4ade80' }}>Odpověď</th>
              <th style={{ padding: '8px 16px', borderBottom: '2px solid #333', color: '#4ade80' }}>Počet chyb</th>
              <th style={{ padding: '8px 16px', borderBottom: '2px solid #333', color: '#4ade80' }}>Správně v řadě</th>
            </tr>
          </thead>
          <tbody>
            {failed.map((record, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '8px 16px', fontFamily: 'monospace', fontSize: '16px', color: '#e0e0e0' }}>
                  {record.challenge.display}
                </td>
                <td style={{ padding: '8px 16px', fontWeight: 'bold', fontSize: '16px', color: '#e0e0e0' }}>
                  {record.challenge.answer}
                </td>
                <td style={{ padding: '8px 16px', color: '#f87171', textAlign: 'center' }}>
                  {record.failCount}
                </td>
                <td style={{ padding: '8px 16px', color: '#4ade80', textAlign: 'center' }}>
                  {record.consecutiveCorrect}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        data-testid="failed-back-btn"
        onClick={onBack}
        style={{ marginTop: '20px', fontSize: '16px', padding: '8px 30px', background: '#16213e', color: '#aaa', border: '1px solid #333', borderRadius: '8px' }}
      >
        Zpět
      </button>
    </div>
  );
}

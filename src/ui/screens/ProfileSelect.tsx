import { useState } from 'react';
import { useProfile } from '../context/ProfileContext.tsx';

interface ProfileSelectProps {
  onSelect: () => void;
}

export function ProfileSelect({ onSelect }: ProfileSelectProps) {
  const { profiles, create, switchTo, remove } = useProfile();
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    create(newName.trim());
    setNewName('');
    onSelect();
  };

  const handleSelect = (id: string) => {
    switchTo(id);
    onSelect();
  };

  return (
    <div data-testid="profile-select" style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h1>Zombie Matika</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Vyber profil</h2>

      {profiles.length > 0 && (
        <div style={{ margin: '20px 0' }}>
          {profiles.map((p) => (
            <div key={p.id} style={{ margin: '10px', display: 'inline-block' }}>
              <button
                data-testid={`profile-${p.name}`}
                onClick={() => handleSelect(p.id)}
                style={{
                  fontSize: '18px', padding: '10px 20px', marginRight: '5px',
                  background: '#16213e', color: '#e0e0e0', border: '1px solid #333', borderRadius: '8px',
                }}
              >
                {p.name}
              </button>
              <button
                data-testid={`delete-${p.name}`}
                onClick={() => remove(p.id)}
                style={{
                  fontSize: '12px', padding: '5px 8px',
                  background: 'transparent', color: '#f87171', border: '1px solid #f87171', borderRadius: '4px',
                }}
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <input
          data-testid="new-profile-name"
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Jméno nového profilu"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          style={{ fontSize: '16px', padding: '8px 12px', marginRight: '10px' }}
        />
        <button
          data-testid="create-profile-btn"
          onClick={handleCreate}
          style={{
            fontSize: '16px', padding: '8px 20px',
            background: 'linear-gradient(135deg, #166534, #15803d)',
            color: '#fff', border: '2px solid #4ade80', borderRadius: '8px',
          }}
        >
          Vytvořit
        </button>
      </div>
    </div>
  );
}

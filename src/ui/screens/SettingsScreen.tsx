import { useSettings } from '../context/SettingsContext.tsx';
import { Slider } from '../components/Slider.tsx';
import { AvatarPicker } from '../components/AvatarPicker.tsx';
import type { CustomAvatar } from '../../persistence/types.ts';

interface SettingsScreenProps {
  onBack: () => void;
}

const sectionStyle: React.CSSProperties = {
  margin: '20px auto',
  maxWidth: '520px',
  padding: '16px 20px',
  border: '1px solid #333',
  borderRadius: '10px',
  background: '#16213e',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '12px',
  borderBottom: '1px solid #333',
  paddingBottom: '6px',
  color: '#4ade80',
  fontFamily: 'Creepster, cursive',
  letterSpacing: '1px',
};

const toggleRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  margin: '6px 0',
};

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { settings, updateSettings } = useSettings();

  return (
    <div data-testid="settings-screen" style={{ textAlign: 'center', padding: '20px 10px' }}>
      <h1>Nastavení</h1>

      {/* ── Audio ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Zvuk</div>

        <div style={toggleRowStyle}>
          <label>
            <input
              type="checkbox"
              data-testid="sound-toggle"
              checked={settings.soundEnabled}
              onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
            />
            {' '}Zvuky zapnuty
          </label>
        </div>

        <Slider
          label="Hlasitost"
          value={settings.volume}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => updateSettings({ volume: v })}
          format="percent"
        />
      </div>

      {/* ── Gameplay ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Hratelnost</div>

        <Slider
          label="Rychlost zombíků"
          value={settings.zombieSpeedMultiplier}
          min={0.3}
          max={5.0}
          step={0.1}
          onChange={(v) => updateSettings({ zombieSpeedMultiplier: v })}
          format="multiplier"
        />

        <Slider
          label="Frekvence spawnu"
          value={settings.spawnRateMultiplier}
          min={0.3}
          max={5.0}
          step={0.1}
          onChange={(v) => updateSettings({ spawnRateMultiplier: v })}
          format="multiplier"
        />

        <Slider
          label="Trest za chybu"
          value={settings.missCooldownMs}
          min={500}
          max={8000}
          step={250}
          onChange={(v) => updateSettings({ missCooldownMs: v })}
          format="ms"
        />

        <Slider
          label="Počet řad"
          value={settings.numRows}
          min={3}
          max={8}
          step={1}
          onChange={(v) => updateSettings({ numRows: v })}
          format="integer"
        />

        <Slider
          label="Délka dráhy"
          value={settings.laneLength}
          min={600}
          max={1200}
          step={50}
          onChange={(v) => updateSettings({ laneLength: v })}
          format="integer"
          suffix="px"
        />

        <div style={toggleRowStyle}>
          <label>
            <input
              type="checkbox"
              data-testid="lawnmowers-toggle"
              checked={settings.lawnmowersEnabled}
              onChange={(e) => updateSettings({ lawnmowersEnabled: e.target.checked })}
            />
            {' '}Sekačky (ochrana řad)
          </label>
        </div>

        <Slider
          label="Hadrák (každý N-tý)"
          value={settings.ragdollFrequency}
          min={0}
          max={20}
          step={1}
          onChange={(v) => updateSettings({ ragdollFrequency: v })}
          format="integer"
          suffix="."
        />

        <Slider
          label="Tank (každý N-tý)"
          value={settings.tankFrequency}
          min={0}
          max={30}
          step={1}
          onChange={(v) => updateSettings({ tankFrequency: v })}
          format="integer"
          suffix="."
        />
      </div>

      {/* ── Math / Challenges ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Matematika</div>

        <Slider
          label="Min. výsledek"
          value={settings.minResult}
          min={0}
          max={settings.maxResult - 5}
          step={1}
          onChange={(v) => updateSettings({ minResult: v })}
          format="integer"
          editable
        />

        <Slider
          label="Max. výsledek"
          value={settings.maxResult}
          min={settings.minResult + 5}
          max={1000}
          step={1}
          onChange={(v) => updateSettings({ maxResult: v })}
          format="integer"
          editable
        />

        <div style={{ marginTop: '12px', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Operace</div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { key: 'mathAddition' as const, label: 'Sčítání (+)' },
            { key: 'mathSubtraction' as const, label: 'Odčítání (-)' },
            { key: 'mathMultiplication' as const, label: 'Násobení (×)' },
            { key: 'mathDivision' as const, label: 'Dělení (÷)' },
          ].map(({ key, label }) => (
            <label key={key} style={{ fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => updateSettings({ [key]: e.target.checked })}
              />
              {' '}{label}
            </label>
          ))}
        </div>

        <div style={{ marginTop: '12px', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>Násobilka</div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <label key={n} style={{ fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={(settings.nasoblikaTables ?? []).includes(n)}
                onChange={(e) => {
                  const current = settings.nasoblikaTables ?? [];
                  const updated = e.target.checked
                    ? [...current, n]
                    : current.filter(x => x !== n);
                  updateSettings({ nasoblikaTables: updated });
                }}
              />
              {' '}{n}
            </label>
          ))}
        </div>

        <div style={{ ...toggleRowStyle, marginTop: '8px' }}>
          <label>
            <input
              type="checkbox"
              checked={settings.nasoblikaDivision ?? false}
              onChange={(e) => updateSettings({ nasoblikaDivision: e.target.checked })}
            />
            {' '}Dělení z tabulek (42 ÷ 7 = ?)
          </label>
        </div>
      </div>

      {/* ── Czech Language ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Čeština</div>

        <div style={toggleRowStyle}>
          <label>
            <input
              type="checkbox"
              data-testid="czech-toggle"
              checked={settings.czechEnabled}
              onChange={(e) => updateSettings({ czechEnabled: e.target.checked })}
            />
            {' '}Vyjmenovaná slova (i/y)
          </label>
        </div>

        {settings.czechEnabled && (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
            {['B', 'L', 'M', 'P', 'S', 'V', 'Z'].map((letter) => (
              <label key={letter} style={{ fontSize: '14px', fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  checked={(settings.czechLetters ?? []).includes(letter)}
                  onChange={(e) => {
                    const current = settings.czechLetters ?? [];
                    const updated = e.target.checked
                      ? [...current, letter]
                      : current.filter(x => x !== letter);
                    updateSettings({ czechLetters: updated });
                  }}
                />
                {' '}{letter}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* ── Failed Challenge Tracking ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Opakování chyb</div>

        <Slider
          label="Šance na opakování"
          value={settings.failedChallengeRetryChance}
          min={0}
          max={0.5}
          step={0.05}
          onChange={(v) => updateSettings({ failedChallengeRetryChance: v })}
          format="percent"
        />

        <Slider
          label="Správných k odebrání"
          value={settings.failedChallengeCorrectToRemove}
          min={1}
          max={10}
          step={1}
          onChange={(v) => updateSettings({ failedChallengeCorrectToRemove: v })}
          format="integer"
          suffix="x"
        />
      </div>

      {/* ── Visual ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Vzhled</div>

        <div style={toggleRowStyle}>
          <label>
            <input
              type="checkbox"
              data-testid="blood-toggle"
              checked={settings.showBlood}
              onChange={(e) => updateSettings({ showBlood: e.target.checked })}
            />
            {' '}Krev
          </label>
        </div>

        <div style={toggleRowStyle}>
          <label>
            <input
              type="checkbox"
              data-testid="timer-toggle"
              checked={settings.showTimer}
              onChange={(e) => updateSettings({ showTimer: e.target.checked })}
            />
            {' '}Zobrazit časovač
          </label>
        </div>

        <div style={toggleRowStyle}>
          <label>
            <input
              type="checkbox"
              data-testid="row-highlight-toggle"
              checked={settings.showRowHighlight}
              onChange={(e) => updateSettings({ showRowHighlight: e.target.checked })}
            />
            {' '}Zvýraznění řady
          </label>
        </div>

        <Slider
          label="Velikost zombíků"
          value={settings.zombieSizeMultiplier}
          min={0.5}
          max={2.0}
          step={0.1}
          onChange={(v) => updateSettings({ zombieSizeMultiplier: v })}
          format="multiplier"
        />
      </div>

      {/* ── Avatar ── */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Avatar</div>
        <AvatarPicker
          selectedId={settings.avatarId}
          onSelect={(id) => updateSettings({ avatarId: id })}
          customAvatars={settings.customAvatars ?? []}
          onUpload={(avatar: CustomAvatar) => {
            updateSettings({
              customAvatars: [...(settings.customAvatars ?? []), avatar],
              avatarId: avatar.id,
            });
          }}
          onDeleteCustom={(id: string) => {
            const filtered = (settings.customAvatars ?? []).filter(a => a.id !== id);
            updateSettings({
              customAvatars: filtered,
              // If the deleted avatar was selected, revert to default
              avatarId: settings.avatarId === id ? 'default' : settings.avatarId,
            });
          }}
        />
      </div>

      {/* ── Reset ── */}
      <div style={{ margin: '20px 0' }}>
        <button
          data-testid="reset-settings-btn"
          onClick={() => updateSettings({
            zombieSpeedMultiplier: 1.0,
            spawnRateMultiplier: 1.0,
            missCooldownMs: 3000,
            numRows: 6,
            lawnmowersEnabled: true,
            laneLength: 800,
            maxResult: 20,
            minResult: 0,
            failedChallengeRetryChance: 0.2,
            failedChallengeCorrectToRemove: 3,
            showBlood: true,
            showTimer: true,
            zombieSizeMultiplier: 1.0,
            showRowHighlight: true,
            soundEnabled: true,
            volume: 1.0,
            avatarId: 'default',
            ragdollFrequency: 5,
            tankFrequency: 12,
            mathAddition: true,
            mathSubtraction: true,
            mathMultiplication: false,
            mathDivision: false,
            nasoblikaTables: [],
            nasoblikaDivision: false,
            czechEnabled: false,
            czechLetters: [],
          })}
          style={{ fontSize: '14px', padding: '6px 16px', color: '#f87171', background: 'transparent', border: '1px solid #f87171', borderRadius: '6px' }}
        >
          Obnovit výchozí nastavení
        </button>
      </div>

      <button
        data-testid="settings-back-btn"
        onClick={onBack}
        style={{ marginTop: '10px', fontSize: '16px', padding: '8px 30px', background: '#16213e', color: '#aaa', border: '1px solid #333', borderRadius: '8px' }}
      >
        Zpět
      </button>
    </div>
  );
}

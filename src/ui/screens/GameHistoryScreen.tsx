import { useState, useMemo } from 'react';
import { usePersistence } from '../hooks/usePersistence.ts';
import { LEVELS, SURVIVAL_LEVEL } from '../../config/levels.ts';
import type { GameHistoryEntry } from '../../persistence/types.ts';

interface GameHistoryScreenProps {
  onBack: () => void;
}

const ALL_LEVELS = [...LEVELS, SURVIVAL_LEVEL];

function getLevelName(levelId: string): string {
  return ALL_LEVELS.find(l => l.id === levelId)?.name ?? levelId;
}

function formatDuration(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

function formatResponseTime(ms: number): string {
  return (ms / 1000).toFixed(1) + 's';
}

function accuracy(entry: GameHistoryEntry): number {
  const total = entry.correctAnswers + entry.incorrectAnswers + entry.zombiesEscaped;
  return total > 0 ? entry.correctAnswers / total : 0;
}

// ── Simple SVG Line Chart ──

interface ChartPoint {
  label: string;
  value: number;
}

function MiniLineChart({ data, color, unit, height = 160 }: {
  data: ChartPoint[];
  color: string;
  unit?: string;
  height?: number;
}) {
  if (data.length === 0) return <p style={{ color: '#666' }}>Nedostatek dat</p>;

  const W = 520;
  const H = height;
  const PAD = { top: 20, right: 20, bottom: 35, left: 50 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const values = data.map(d => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const points = data.map((d, i) => ({
    x: PAD.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW),
    y: PAD.top + plotH - ((d.value - minV) / range) * plotH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  // Y-axis labels
  const ySteps = 4;
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
    const val = minV + (range / ySteps) * i;
    return { val, y: PAD.top + plotH - (i / ySteps) * plotH };
  });

  // X-axis labels (show up to 8)
  const xStep = Math.max(1, Math.floor(data.length / 8));
  const xLabels = data.filter((_, i) => i % xStep === 0 || i === data.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: `${W}px`, height: 'auto' }}>
      {/* Grid lines */}
      {yLabels.map((yl, i) => (
        <g key={i}>
          <line x1={PAD.left} x2={W - PAD.right} y1={yl.y} y2={yl.y} stroke="#2a2a3e" strokeWidth="1" />
          <text x={PAD.left - 6} y={yl.y + 4} fill="#666" fontSize="11" textAnchor="end">
            {unit === '%' ? `${Math.round(yl.val)}%` : Math.round(yl.val)}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path
        d={`${pathD} L${points[points.length - 1].x},${PAD.top + plotH} L${points[0].x},${PAD.top + plotH} Z`}
        fill={color}
        opacity="0.1"
      />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}

      {/* X-axis labels */}
      {xLabels.map((d, i) => {
        const idx = data.indexOf(d);
        const x = points[idx]?.x ?? 0;
        return (
          <text key={i} x={x} y={H - 5} fill="#666" fontSize="10" textAnchor="middle">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Stat Card ──

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      background: '#16213e',
      border: '1px solid #333',
      borderRadius: '10px',
      padding: '12px 16px',
      minWidth: '120px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '22px', fontWeight: 'bold', color: color ?? '#4ade80', fontFamily: 'Creepster, cursive' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{label}</div>
    </div>
  );
}

// ── Main Screen ──

export function GameHistoryScreen({ onBack }: GameHistoryScreenProps) {
  const { profileData } = usePersistence();
  const history = useMemo(() => profileData?.gameHistory ?? [], [profileData]);
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const items = filter === 'all' ? history : history.filter(e => e.levelId === filter);
    return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history, filter]);

  // Global stats
  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const totalGames = history.length;
    const totalTimeMs = history.reduce((s, e) => s + e.durationMs, 0);
    const totalCorrect = history.reduce((s, e) => s + e.correctAnswers, 0);
    const totalIncorrect = history.reduce((s, e) => s + e.incorrectAnswers, 0);
    const totalEscaped = history.reduce((s, e) => s + e.zombiesEscaped, 0);
    const totalAttempts = totalCorrect + totalIncorrect + totalEscaped;
    const avgAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    const bestScore = Math.max(...history.map(e => e.score));
    const avgScore = history.reduce((s, e) => s + e.score, 0) / totalGames;
    const bestStreak = Math.max(...history.map(e => e.maxStreak));
    const gamesWithResponse = history.filter(e => e.avgResponseTimeMs > 0);
    const avgResponse = gamesWithResponse.length > 0
      ? gamesWithResponse.reduce((s, e) => s + e.avgResponseTimeMs, 0) / gamesWithResponse.length
      : 0;

    return {
      totalGames, totalTimeMs, avgAccuracy, bestScore, avgScore,
      bestStreak, avgResponse, totalCorrect, totalIncorrect, totalEscaped,
    };
  }, [history]);

  // Chart data: last 30 games (chronological order)
  const chartData = useMemo(() => {
    const items = [...filtered].reverse().slice(-30);
    const scoreData: ChartPoint[] = items.map((e, i) => ({
      label: `${i + 1}`,
      value: e.score,
    }));
    const accuracyData: ChartPoint[] = items.map((e, i) => ({
      label: `${i + 1}`,
      value: accuracy(e) * 100,
    }));
    const responseData: ChartPoint[] = items
      .filter(e => e.avgResponseTimeMs > 0)
      .map((e, i) => ({
        label: `${i + 1}`,
        value: e.avgResponseTimeMs / 1000,
      }));
    return { scoreData, accuracyData, responseData };
  }, [filtered]);

  // Unique levels played
  const playedLevels = useMemo(() => {
    const ids = new Set(history.map(e => e.levelId));
    return ALL_LEVELS.filter(l => ids.has(l.id));
  }, [history]);

  return (
    <div data-testid="game-history-screen" style={{ textAlign: 'center', padding: '30px 20px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>Historie her</h1>

      {history.length === 0 ? (
        <p style={{ color: '#888', marginTop: '40px' }}>Zatím žádné hry. Jdi hrát!</p>
      ) : (
        <>
          {/* Global stats */}
          {stats && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
              <StatCard label="Celkem her" value={`${stats.totalGames}`} />
              <StatCard label="Celkový čas" value={formatDuration(stats.totalTimeMs)} />
              <StatCard label="Nejlepší skóre" value={`${stats.bestScore}`} color="#fbbf24" />
              <StatCard label="Průměrné skóre" value={`${Math.round(stats.avgScore)}`} />
              <StatCard label="Přesnost" value={`${Math.round(stats.avgAccuracy)}%`} color={stats.avgAccuracy >= 70 ? '#4ade80' : '#f87171'} />
              <StatCard label="Nejdelší série" value={`${stats.bestStreak}`} color="#60a5fa" />
              {stats.avgResponse > 0 && (
                <StatCard label="Prům. čas odpovědi" value={formatResponseTime(stats.avgResponse)} color="#c084fc" />
              )}
            </div>
          )}

          {/* Filter tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', margin: '20px 0 10px' }}>
            <FilterTab label="Všechny" active={filter === 'all'} onClick={() => setFilter('all')} />
            {playedLevels.map(l => (
              <FilterTab key={l.id} label={l.name} active={filter === l.id} onClick={() => setFilter(l.id)} />
            ))}
          </div>

          {/* Charts */}
          {filtered.length >= 2 && (
            <div style={{ margin: '20px 0' }}>
              <ChartSection title="Skóre" color="#4ade80" data={chartData.scoreData} />
              <ChartSection title="Přesnost (%)" color="#60a5fa" data={chartData.accuracyData} unit="%" />
              {chartData.responseData.length >= 2 && (
                <ChartSection title="Prům. čas odpovědi (s)" color="#c084fc" data={chartData.responseData} />
              )}
            </div>
          )}

          {/* Game list */}
          <div style={{ margin: '20px 0' }}>
            <h3 style={{ color: '#4ade80', fontFamily: 'Creepster, cursive', letterSpacing: '1px', marginBottom: '12px' }}>
              Záznamy ({filtered.length})
            </h3>
            {filtered.map(entry => (
              <GameRow
                key={entry.id}
                entry={entry}
                expanded={expandedId === entry.id}
                onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              />
            ))}
          </div>
        </>
      )}

      <button
        data-testid="history-back-btn"
        onClick={onBack}
        style={{ marginTop: '20px', fontSize: '16px', padding: '8px 30px', background: '#16213e', color: '#aaa', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer' }}
      >
        Zpět
      </button>
    </div>
  );
}

// ── Sub-components ──

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: '13px',
        padding: '5px 14px',
        background: active ? '#166534' : '#16213e',
        color: active ? '#fff' : '#aaa',
        border: active ? '1px solid #4ade80' : '1px solid #333',
        borderRadius: '6px',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function ChartSection({ title, color, data, unit }: { title: string; color: string; data: ChartPoint[]; unit?: string }) {
  return (
    <div style={{ background: '#16213e', border: '1px solid #333', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
      <h4 style={{ color, margin: '0 0 8px', fontSize: '14px' }}>{title}</h4>
      <MiniLineChart data={data} color={color} unit={unit} />
    </div>
  );
}

function GameRow({ entry, expanded, onToggle }: { entry: GameHistoryEntry; expanded: boolean; onToggle: () => void }) {
  const acc = accuracy(entry);
  const total = entry.correctAnswers + entry.incorrectAnswers + entry.zombiesEscaped;

  return (
    <div style={{
      background: '#16213e',
      border: '1px solid #333',
      borderRadius: '8px',
      marginBottom: '6px',
      overflow: 'hidden',
    }}>
      {/* Summary row */}
      <div
        onClick={onToggle}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto',
          gap: '12px',
          padding: '10px 14px',
          cursor: 'pointer',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '14px' }}>
            {getLevelName(entry.levelId)}
          </span>
          <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>
            {new Date(entry.date).toLocaleDateString('cs-CZ')} {new Date(entry.date).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{entry.score} b.</span>
        <span style={{ color: acc >= 0.7 ? '#4ade80' : acc >= 0.4 ? '#fbbf24' : '#f87171', fontSize: '13px' }}>
          {Math.round(acc * 100)}%
        </span>
        <span style={{ color: '#888', fontSize: '13px' }}>{formatDuration(entry.durationMs)}</span>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: '0 14px 12px', borderTop: '1px solid #2a2a3e' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '10px', fontSize: '13px' }}>
            <DetailItem label="Správně" value={`${entry.correctAnswers}`} color="#4ade80" />
            <DetailItem label="Špatně" value={`${entry.incorrectAnswers}`} color="#f87171" />
            <DetailItem label="Uteklo zombíků" value={`${entry.zombiesEscaped}`} color="#fb923c" />
            <DetailItem label="Celkem otázek" value={`${total}`} color="#e0e0e0" />
            <DetailItem label="Nejdelší série" value={`${entry.maxStreak}`} color="#60a5fa" />
            {entry.avgResponseTimeMs > 0 && (
              <DetailItem label="Prům. čas odpovědi" value={formatResponseTime(entry.avgResponseTimeMs)} color="#c084fc" />
            )}
          </div>

          {/* Slow answers */}
          {entry.slowAnswers.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ color: '#fb923c', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                Pomalé odpovědi (20s+):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {entry.slowAnswers.map((sa, i) => (
                  <span key={i} style={{
                    background: '#1e1e2e',
                    border: '1px solid #fb923c33',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '12px',
                    color: '#e0e0e0',
                  }}>
                    {sa.challengeDisplay} = {sa.challengeAnswer}
                    <span style={{ color: '#fb923c', marginLeft: '4px' }}>({formatResponseTime(sa.responseTimeMs)})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '6px', background: '#1e1e2e', borderRadius: '6px' }}>
      <div style={{ color, fontWeight: 'bold', fontSize: '16px' }}>{value}</div>
      <div style={{ color: '#888', fontSize: '11px' }}>{label}</div>
    </div>
  );
}

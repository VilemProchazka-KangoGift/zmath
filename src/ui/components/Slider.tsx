import { useState, useRef } from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** How to format the display value. Default: 'percent' */
  format?: 'percent' | 'multiplier' | 'ms' | 'integer' | 'decimal';
  /** Custom suffix (e.g., "ms", "x"). Overrides format-based suffix. */
  suffix?: string;
  /** Allow clicking the value to type a custom number. */
  editable?: boolean;
}

function formatValue(value: number, format: string, suffix?: string): string {
  if (suffix !== undefined) {
    if (format === 'integer') return `${Math.round(value)}${suffix}`;
    if (format === 'decimal') return `${value.toFixed(1)}${suffix}`;
    return `${Math.round(value * 100)}${suffix}`;
  }
  switch (format) {
    case 'percent': return `${Math.round(value * 100)}%`;
    case 'multiplier': return `${value.toFixed(1)}x`;
    case 'ms': return `${(value / 1000).toFixed(1)}s`;
    case 'integer': return `${Math.round(value)}`;
    case 'decimal': return `${value.toFixed(1)}`;
    default: return `${value}`;
  }
}

function rawNumber(value: number, format: string): string {
  switch (format) {
    case 'percent': return `${Math.round(value * 100)}`;
    case 'multiplier': return `${value.toFixed(1)}`;
    case 'ms': return `${Math.round(value)}`;
    case 'integer': return `${Math.round(value)}`;
    case 'decimal': return `${value.toFixed(1)}`;
    default: return `${value}`;
  }
}

function parseInput(text: string, format: string): number {
  const n = parseFloat(text);
  if (isNaN(n)) return NaN;
  if (format === 'percent') return n / 100;
  return n;
}

export function Slider({ label, value, min, max, step, onChange, format = 'percent', suffix, editable }: SliderProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commitEdit = () => {
    const text = inputRef.current?.value ?? '';
    const parsed = parseInput(text, format);
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)));
    }
    setEditing(false);
  };

  return (
    <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
      <label style={{ minWidth: '200px', textAlign: 'right' }}>
        {label}:
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '200px' }}
        data-testid={`slider-${label}`}
      />
      {editable && editing ? (
        <input
          ref={inputRef}
          type="number"
          defaultValue={rawNumber(value, format)}
          min={min}
          max={max}
          autoFocus
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') setEditing(false);
          }}
          style={{
            minWidth: '60px',
            width: '70px',
            textAlign: 'left',
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '2px 4px',
            background: '#0a0a23',
            color: '#4ade80',
            border: '1px solid #4ade80',
            borderRadius: '4px',
          }}
        />
      ) : (
        <span
          onClick={editable ? () => setEditing(true) : undefined}
          style={{
            minWidth: '60px',
            textAlign: 'left',
            fontFamily: 'monospace',
            cursor: editable ? 'pointer' : 'default',
            borderBottom: editable ? '1px dashed #555' : 'none',
          }}
          title={editable ? 'Klikni pro zadání čísla' : undefined}
        >
          {formatValue(value, format, suffix)}
        </span>
      )}
    </div>
  );
}

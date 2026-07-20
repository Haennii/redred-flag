import { RiskLevel, Trend } from '../types';
import { RISK_LABELS } from '../utils/riskFlags';

interface Props {
  label: string;
  value: number;
  unit: string;
  severity: RiskLevel;
  trend: Trend;
  description: string;
  basis: string;
}

const TREND_ICONS: Record<Trend, string> = { UP: '↑', DOWN: '↓', STABLE: '→' };

export default function IndicatorCard({ label, value, unit, severity, trend, description, basis }: Props) {
  const { color, bg } = RISK_LABELS[severity];

  const displayValue = Math.abs(value) >= 100
    ? value.toFixed(1)
    : value.toFixed(2);

  return (
    <div className="rounded-xl p-4 border transition-all" style={{ backgroundColor: bg, borderColor: `${color}33` }}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-400 font-medium leading-tight max-w-[130px]">{label}</span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold ml-2 shrink-0"
          style={{ color, backgroundColor: `${color}22` }}
        >
          {RISK_LABELS[severity].label}
        </span>
      </div>

      <div className="flex items-end justify-between mt-3">
        <div>
          <span className="text-2xl font-bold" style={{ color: severity === 'SAFE' ? '#F9FAFB' : color }}>
            {displayValue}
          </span>
          <span className="text-sm text-gray-400 ml-1">{unit}</span>
        </div>
        <span
          className="text-sm font-semibold"
          style={{ color: trend === 'UP' ? '#EF4444' : trend === 'DOWN' ? '#10B981' : '#6B7280' }}
        >
          {TREND_ICONS[trend]}
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-400 leading-relaxed">{description}</p>

      <p className="mt-1.5 text-[10px] text-gray-600 leading-tight border-t border-gray-800 pt-1.5">
        기준: {basis}
      </p>
    </div>
  );
}

import { RiskLevel, Trend } from '../types';
import { RISK_LABELS } from '../utils/riskFlags';

interface Props {
  label: string;
  value: number;
  unit: string;
  threshold: number;
  thresholdLabel?: string;
  severity: RiskLevel;
  trend: Trend;
  description?: string;
}

const TREND_ICONS: Record<Trend, string> = {
  UP: '↑',
  DOWN: '↓',
  STABLE: '→',
};

export default function IndicatorCard({
  label, value, unit, threshold, thresholdLabel, severity, trend, description
}: Props) {
  const { color, bg } = RISK_LABELS[severity];
  const isGood = severity === 'SAFE';

  return (
    <div
      className="rounded-xl p-4 border transition-all"
      style={{ backgroundColor: bg, borderColor: `${color}33` }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-400 font-medium leading-tight max-w-[120px]">{label}</span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-semibold ml-2 shrink-0"
          style={{ color, backgroundColor: `${color}22` }}
        >
          {RISK_LABELS[severity].label}
        </span>
      </div>

      <div className="flex items-end justify-between mt-3">
        <div>
          <span className="text-2xl font-bold" style={{ color: isGood ? '#F9FAFB' : color }}>
            {value.toFixed(value >= 100 ? 1 : 2)}
          </span>
          <span className="text-sm text-gray-400 ml-1">{unit}</span>
        </div>
        <span
          className="text-sm font-semibold"
          style={{ color: trend === 'UP' ? '#10B981' : trend === 'DOWN' ? '#EF4444' : '#6B7280' }}
        >
          {TREND_ICONS[trend]}
        </span>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        기준: {threshold}{unit}
        {thresholdLabel && <span className="ml-1 text-gray-600">({thresholdLabel})</span>}
      </div>

      {description && (
        <p className="mt-2 text-xs text-gray-400 leading-relaxed border-t border-gray-700 pt-2">
          {description}
        </p>
      )}
    </div>
  );
}

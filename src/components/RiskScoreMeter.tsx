import { RiskLevel } from '../types';
import { RISK_LABELS } from '../utils/riskFlags';

interface Props {
  score: number;
  riskLevel: RiskLevel;
}

export default function RiskScoreMeter({ score, riskLevel }: Props) {
  const { label, color } = RISK_LABELS[riskLevel];
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1F2937" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <span
        className="text-sm font-bold px-3 py-1 rounded-full"
        style={{ color, backgroundColor: RISK_LABELS[riskLevel].bg }}
      >
        {label}
      </span>
    </div>
  );
}

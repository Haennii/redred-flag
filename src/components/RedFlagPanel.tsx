import { useState } from 'react';
import { RedFlag } from '../types';
import { RISK_LABELS } from '../utils/riskFlags';

interface Props {
  flags: RedFlag[];
}

export default function RedFlagPanel({ flags }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const triggered = flags.filter(f => f.triggered);

  if (triggered.length === 0) {
    return (
      <div className="bg-[#1A2235] rounded-xl p-6 border border-gray-800">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">이상징후 탐지 결과</h3>
        <div className="flex items-center gap-2 text-green-400">
          <span className="text-lg">✓</span>
          <span className="text-sm">탐지된 이상징후 없음 — 모든 지표 정상 범위</span>
        </div>
      </div>
    );
  }

  const sorted = [...triggered].sort((a, b) => b.scoreContribution - a.scoreContribution);

  return (
    <div className="bg-[#1A2235] rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">이상징후 탐지 결과</h3>
        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-semibold">
          {triggered.length}건 감지
        </span>
      </div>

      <div className="divide-y divide-gray-800">
        {sorted.map(flag => {
          const { color, bg } = RISK_LABELS[flag.severity];
          const isOpen = expanded === flag.id;

          return (
            <div key={flag.id} className="p-4">
              <button
                className="w-full text-left"
                onClick={() => setExpanded(isOpen ? null : flag.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-200 truncate">
                        {flag.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{flag.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span
                      className="text-xs px-2 py-0.5 rounded font-semibold"
                      style={{ color, backgroundColor: bg }}
                    >
                      +{flag.scoreContribution}점
                    </span>
                    <span className="text-gray-600 text-xs">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="mt-3 ml-5 p-3 rounded-lg bg-gray-900/50 border border-gray-700">
                  <div className="text-xs text-yellow-400 font-semibold mb-1">감사인 시사점</div>
                  <p className="text-xs text-gray-300 leading-relaxed">{flag.auditNote}</p>
                  <div className="mt-2 text-xs text-gray-600">
                    영문명: {flag.nameEn}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

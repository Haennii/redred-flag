import { BankAnalysis } from '../types';
import { BANKS } from '../constants/banks';
import { THRESHOLDS } from '../constants/thresholds';
import { RISK_LABELS } from '../utils/riskFlags';
import RiskScoreMeter from './RiskScoreMeter';
import IndicatorCard from './IndicatorCard';
import RedFlagPanel from './RedFlagPanel';
import TrendLineChart from './charts/TrendLineChart';
import ComparisonBarChart from './charts/ComparisonBarChart';

interface Props {
  analyses: BankAnalysis[];
  selectedBankId: string;
  onSelectBank: (id: string) => void;
}

export default function Dashboard({ analyses, selectedBankId, onSelectBank }: Props) {
  const selected = analyses.find(a => a.bank.id === selectedBankId);
  const isOverview = selectedBankId === 'overview';

  // 추세 차트용 데이터 변환
  function toTrendData(key: keyof import('../types').FinancialMetrics) {
    return analyses[0]?.metrics.map((_, i) => {
      const point: any = { year: analyses[0].metrics[i].year };
      analyses.forEach(a => {
        point[a.bank.id] = a.metrics[i]?.[key] ?? null;
      });
      return point;
    }) ?? [];
  }

  // 은행별 비교 데이터
  function toComparisonData(
    key: keyof import('../types').FinancialMetrics,
    higherIsWorse: boolean,
    thresholds: { danger: number; warning: number; watch: number }
  ) {
    return analyses.map(a => {
      const value = a.latestMetrics[key] as number;
      let severity: import('../types').RiskLevel = 'SAFE';
      if (higherIsWorse) {
        if (value >= thresholds.danger) severity = 'DANGER';
        else if (value >= thresholds.warning) severity = 'WARNING';
        else if (value >= thresholds.watch) severity = 'WATCH';
      } else {
        if (value <= thresholds.danger) severity = 'DANGER';
        else if (value <= thresholds.warning) severity = 'WARNING';
        else if (value <= thresholds.watch) severity = 'WATCH';
      }
      return { name: a.bank.shortName, value, color: a.bank.color, severity };
    });
  }

  const trendSeries = analyses.map(a => ({
    key: a.bank.id,
    name: a.bank.shortName,
    color: a.bank.color,
  }));

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      {/* 은행 탭 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => onSelectBank('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            isOverview
              ? 'bg-white text-gray-900'
              : 'bg-[#1A2235] text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          전체 비교
        </button>
        {BANKS.map(bank => {
          const analysis = analyses.find(a => a.bank.id === bank.id);
          const isActive = selectedBankId === bank.id;
          return (
            <button
              key={bank.id}
              onClick={() => onSelectBank(bank.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border ${
                isActive ? 'text-gray-900' : 'bg-[#1A2235] text-gray-400 hover:text-white border-gray-800'
              }`}
              style={isActive ? { backgroundColor: bank.color, borderColor: bank.color } : {}}
            >
              {bank.shortName}
              {analysis && (
                <span
                  className="ml-2 text-xs px-1.5 py-0.5 rounded"
                  style={isActive
                    ? { backgroundColor: 'rgba(0,0,0,0.2)', color: '#111' }
                    : { backgroundColor: RISK_LABELS[analysis.riskLevel].bg, color: RISK_LABELS[analysis.riskLevel].color }
                  }
                >
                  {RISK_LABELS[analysis.riskLevel].label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 전체 비교 뷰 */}
      {isOverview && (
        <div className="space-y-6">
          {/* 은행별 종합 위험도 */}
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              종합 감사위험 점수
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {analyses.map(a => (
                <div
                  key={a.bank.id}
                  className="bg-[#1A2235] rounded-xl p-5 border border-gray-800 cursor-pointer hover:border-gray-600 transition-all"
                  onClick={() => onSelectBank(a.bank.id)}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a.bank.color }} />
                    <span className="text-sm font-semibold text-gray-200">{a.bank.shortName}</span>
                    {a.dataSource === 'MOCK' && (
                      <span className="text-xs text-gray-600 ml-auto">추정치</span>
                    )}
                  </div>
                  <RiskScoreMeter score={a.riskScore} riskLevel={a.riskLevel} />
                  <div className="mt-3 text-center text-xs text-gray-500">
                    이상징후 {a.redFlags.filter(f => f.triggered).length}건
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 비교 차트 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ComparisonBarChart
              title="BIS 자기자본비율 비교 (2024)"
              data={toComparisonData('bisRatio', false, THRESHOLDS.bisRatio)}
              unit="%"
              referenceValue={THRESHOLDS.bisRatio.danger}
              referenceLabel="최소요건"
            />
            <ComparisonBarChart
              title="고정이하여신비율(NPL) 비교 (2024)"
              data={toComparisonData('nplRatio', true, THRESHOLDS.nplRatio)}
              unit="%"
              referenceValue={THRESHOLDS.nplRatio.warning}
              referenceLabel="경계"
            />
            <ComparisonBarChart
              title="ROA 비교 (2024)"
              data={toComparisonData('roa', false, THRESHOLDS.roa)}
              unit="%"
              referenceValue={THRESHOLDS.roa.warning}
              referenceLabel="경계"
            />
            <ComparisonBarChart
              title="예대율 비교 (2024)"
              data={toComparisonData('ldr', true, THRESHOLDS.ldr)}
              unit="%"
              referenceValue={THRESHOLDS.ldr.danger}
              referenceLabel="규제한도"
            />
          </div>

          {/* 추세 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TrendLineChart
              title="순이자마진(NIM) 추이"
              data={toTrendData('nim')}
              series={trendSeries}
              unit="%"
              referenceValue={THRESHOLDS.nim.warning}
              referenceLabel="경계"
            />
            <TrendLineChart
              title="NPL 비율 추이"
              data={toTrendData('nplRatio')}
              series={trendSeries}
              unit="%"
              referenceValue={THRESHOLDS.nplRatio.warning}
              referenceLabel="경계"
            />
          </div>
        </div>
      )}

      {/* 개별 은행 상세 뷰 */}
      {!isOverview && selected && (
        <div className="space-y-6">
          {/* 상단: 위험도 + 핵심지표 */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* 위험 점수 */}
            <div className="bg-[#1A2235] rounded-xl p-6 border border-gray-800 flex flex-col items-center justify-center">
              <div className="text-xs text-gray-500 mb-3 font-medium">종합 감사위험도</div>
              <RiskScoreMeter score={selected.riskScore} riskLevel={selected.riskLevel} />
              <div className="mt-3 text-xs text-center text-gray-500">
                <div className="text-gray-400 font-medium">{selected.bank.name}</div>
                <div className="mt-1">기준연도: {selected.latestMetrics.year}</div>
                {selected.dataSource === 'MOCK' && (
                  <div className="mt-1 text-yellow-600">* 공시 추정치 기반</div>
                )}
              </div>
            </div>

            {/* KPI 카드 4개 */}
            <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {selected.redFlags.slice(0, 4).map(flag => (
                <IndicatorCard
                  key={flag.id}
                  label={flag.name}
                  value={flag.currentValue}
                  unit={flag.unit}
                  threshold={flag.threshold}
                  severity={flag.severity}
                  trend={flag.trend}
                />
              ))}
            </div>
          </div>

          {/* 나머지 지표 카드 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {selected.redFlags.slice(4).map(flag => (
              <IndicatorCard
                key={flag.id}
                label={flag.name}
                value={flag.currentValue}
                unit={flag.unit}
                threshold={flag.threshold}
                severity={flag.severity}
                trend={flag.trend}
              />
            ))}
          </div>

          {/* 이상징후 패널 */}
          <RedFlagPanel flags={selected.redFlags} />

          {/* 추세 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TrendLineChart
              title="BIS 자기자본비율 추이"
              data={selected.metrics.map(m => ({ year: m.year, [selected.bank.id]: m.bisRatio }))}
              series={[{ key: selected.bank.id, name: selected.bank.shortName, color: selected.bank.color }]}
              unit="%"
              referenceValue={THRESHOLDS.bisRatio.danger}
              referenceLabel="최소요건 10.5%"
            />
            <TrendLineChart
              title="NPL 비율 추이"
              data={selected.metrics.map(m => ({ year: m.year, [selected.bank.id]: m.nplRatio }))}
              series={[{ key: selected.bank.id, name: selected.bank.shortName, color: selected.bank.color }]}
              unit="%"
              referenceValue={THRESHOLDS.nplRatio.warning}
              referenceLabel="경계 0.8%"
            />
            <TrendLineChart
              title="ROA / ROE 추이"
              data={selected.metrics.map(m => ({ year: m.year, roa: m.roa, roe: m.roe / 10 }))}
              series={[
                { key: 'roa', name: 'ROA', color: selected.bank.color },
                { key: 'roe', name: 'ROE/10', color: '#6B7280' },
              ]}
              unit="%"
            />
            <TrendLineChart
              title="NIM / 예대율 추이"
              data={selected.metrics.map(m => ({
                year: m.year,
                nim: m.nim,
                ldr: m.ldr / 50, // 스케일 조정
              }))}
              series={[
                { key: 'nim', name: 'NIM(%)', color: selected.bank.color },
                { key: 'ldr', name: '예대율(/50)', color: '#F59E0B' },
              ]}
              unit="%"
            />
          </div>

          {/* 재무 요약 테이블 */}
          <div className="bg-[#1A2235] rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-gray-300">연도별 핵심 재무지표</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">지표</th>
                    {selected.metrics.map(m => (
                      <th key={m.year} className="text-right px-4 py-3 text-xs font-medium text-gray-500">
                        {m.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {[
                    { label: '총자산 (조원)', key: 'totalAssets', divisor: 10000, decimals: 1 },
                    { label: '당기순이익 (억원)', key: 'netIncome', divisor: 1, decimals: 0 },
                    { label: 'BIS 자기자본비율', key: 'bisRatio', divisor: 1, decimals: 1, suffix: '%' },
                    { label: 'NPL 비율', key: 'nplRatio', divisor: 1, decimals: 2, suffix: '%' },
                    { label: 'NIM', key: 'nim', divisor: 1, decimals: 2, suffix: '%' },
                    { label: 'ROA', key: 'roa', divisor: 1, decimals: 2, suffix: '%' },
                    { label: 'ROE', key: 'roe', divisor: 1, decimals: 1, suffix: '%' },
                    { label: '예대율', key: 'ldr', divisor: 1, decimals: 1, suffix: '%' },
                    { label: '대손충당금적립률', key: 'allowanceCoverage', divisor: 1, decimals: 1, suffix: '%' },
                  ].map(row => (
                    <tr key={row.label} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-gray-400 font-medium text-xs">{row.label}</td>
                      {selected.metrics.map(m => {
                        const raw = m[row.key as keyof typeof m] as number;
                        const val = raw / row.divisor;
                        return (
                          <td key={m.year} className="text-right px-4 py-3 text-gray-300 font-mono text-xs">
                            {val.toFixed(row.decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            {row.suffix ?? ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

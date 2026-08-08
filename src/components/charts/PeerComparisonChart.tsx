import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { BankAnalysis } from '../../types';
import { FinancialMetrics } from '../../types';

interface Props {
  analyses: BankAnalysis[];
}

interface MetricConfig {
  key: keyof FinancialMetrics;
  label: string;
  unit: string;
  decimals: number;
  divisor?: number;
  divisorLabel?: string;
  note?: string;
}

const METRICS: MetricConfig[] = [
  { key: 'nim',            label: 'NIM',         unit: '%',  decimals: 2 },
  { key: 'roe',            label: 'ROE',         unit: '%',  decimals: 1 },
  { key: 'cet1Ratio',      label: 'CET1',        unit: '%',  decimals: 2 },
  { key: 'creditCostRatio', label: '대손비용률', unit: '%', decimals: 2 },
  { key: 'totalAssets',    label: '총자산',      unit: '조', decimals: 0, divisor: 10000, divisorLabel: '조원' },
  { key: 'netIncome',      label: '당기순이익',  unit: '억', decimals: 0 },
];

const CustomTooltip = ({ active, payload, label, metric }: any) => {
  if (!active || !payload?.length) return null;
  const divisor = metric.divisor ?? 1;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[160px]">
      <div className="text-xs text-gray-400 mb-2 font-medium">{label}년</div>
      {payload
        .filter((p: any) => p.dataKey !== '__avg')
        .map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-gray-300">{p.name}</span>
            </span>
            <span className="font-semibold font-mono" style={{ color: p.color }}>
              {(p.value / divisor).toFixed(metric.decimals)}{metric.unit}
            </span>
          </div>
        ))}
      {payload.find((p: any) => p.dataKey === '__avg') && (
        <div className="flex items-center justify-between gap-4 text-xs mt-2 pt-2 border-t border-gray-700">
          <span className="text-gray-500">4행 평균</span>
          <span className="font-mono text-gray-400">
            {(payload.find((p: any) => p.dataKey === '__avg').value / divisor).toFixed(metric.decimals)}{metric.unit}
          </span>
        </div>
      )}
    </div>
  );
};

export default function PeerComparisonChart({ analyses }: Props) {
  const [activeMetric, setActiveMetric] = useState<MetricConfig>(METRICS[0]);

  const data = analyses[0]?.metrics.map((_, i) => {
    const point: any = { year: analyses[0].metrics[i].year };
    let sum = 0;
    analyses.forEach(a => {
      const v = a.metrics[i]?.[activeMetric.key] as number ?? null;
      point[a.bank.id] = v;
      if (v !== null) sum += v;
    });
    point['__avg'] = sum / analyses.length;
    return point;
  }) ?? [];

  const divisor = activeMetric.divisor ?? 1;
  const allValues = data.flatMap(d =>
    analyses.map(a => d[a.bank.id] as number).filter(v => v !== null)
  );
  const minV = Math.min(...allValues) / divisor;
  const maxV = Math.max(...allValues) / divisor;
  const pad = (maxV - minV) * 0.15 || 0.5;
  const yMin = parseFloat((minV - pad).toFixed(activeMetric.decimals));
  const yMax = parseFloat((maxV + pad).toFixed(activeMetric.decimals));

  return (
    <div className="bg-[#1A2235] rounded-xl border border-gray-800 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-gray-300">4대 은행 피어 비교 추이 (2020–2024)</h3>
        <div className="flex flex-wrap gap-1">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                activeMetric.key === m.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#0B1120] text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}${activeMetric.unit}`}
            width={50}
          />
          <Tooltip content={<CustomTooltip metric={activeMetric} />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#9CA3AF', paddingTop: '8px' }}
            formatter={(value) => <span style={{ color: '#9CA3AF' }}>{value}</span>}
          />
          {/* 4행 평균 */}
          <Line
            type="monotone"
            dataKey="__avg"
            name="4행 평균"
            stroke="#4B5563"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            dot={false}
            legendType="plainline"
          />
          {analyses.map(a => (
            <Line
              key={a.bank.id}
              type="monotone"
              dataKey={a.bank.id}
              name={a.bank.shortName}
              stroke={a.bank.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: a.bank.color }}
              activeDot={{ r: 5 }}
            />
          ))}
          {/* 대손비용률에서 0선 강조 */}
          {activeMetric.key === 'creditCostRatio' && (
            <ReferenceLine y={0} stroke="#6B7280" strokeWidth={1} strokeDasharray="2 2" />
          )}
        </LineChart>
      </ResponsiveContainer>

      {activeMetric.note && (
        <div className="mt-3 flex gap-2 bg-amber-950/40 border border-amber-800/40 rounded-lg px-4 py-2.5">
          <span className="text-amber-400 text-xs mt-0.5">⚠</span>
          <p className="text-xs text-amber-300/80 leading-relaxed">{activeMetric.note}</p>
        </div>
      )}
    </div>
  );
}

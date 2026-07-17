import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { RISK_LABELS } from '../../utils/riskFlags';
import { RiskLevel } from '../../types';

interface DataPoint {
  name: string;
  value: number;
  color: string;
  severity: RiskLevel;
}

interface Props {
  data: DataPoint[];
  unit: string;
  title: string;
  referenceValue?: number;
  referenceLabel?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, unit }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DataPoint;
  const { label, color } = RISK_LABELS[d.severity];
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
      <div className="text-sm font-semibold text-white mb-1">{d.name}</div>
      <div className="text-lg font-bold" style={{ color: d.color }}>
        {d.value.toFixed(2)}{unit}
      </div>
      <div className="text-xs mt-1" style={{ color }}>
        {label}
      </div>
    </div>
  );
};

export default function ComparisonBarChart({
  data, unit, title, referenceValue, referenceLabel, height = 200
}: Props) {
  return (
    <div className="bg-[#1A2235] rounded-xl p-5 border border-gray-800">
      <h4 className="text-sm font-semibold text-gray-300 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}${unit}`}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          {referenceValue !== undefined && (
            <ReferenceLine
              y={referenceValue}
              stroke="#EF4444"
              strokeDasharray="4 2"
              label={{ value: referenceLabel ?? '', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }}
            />
          )}
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';

interface DataPoint {
  year: number;
  [key: string]: number;
}

interface SeriesConfig {
  key: string;
  name: string;
  color: string;
}

interface Props {
  data: DataPoint[];
  series: SeriesConfig[];
  unit: string;
  referenceValue?: number;
  referenceLabel?: string;
  title: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
      <div className="text-xs text-gray-400 mb-2">{label}년</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.color }}>
            {p.value.toFixed(2)}{unit}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function TrendLineChart({
  data, series, unit, referenceValue, referenceLabel, title, height = 220
}: Props) {
  return (
    <div className="bg-[#1A2235] rounded-xl p-5 border border-gray-800">
      <h4 className="text-sm font-semibold text-gray-300 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}${unit}`}
          />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          {series.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: '11px', color: '#9CA3AF', paddingTop: '8px' }}
            />
          )}
          {referenceValue !== undefined && (
            <ReferenceLine
              y={referenceValue}
              stroke="#EF4444"
              strokeDasharray="4 2"
              label={{ value: referenceLabel ?? '', fill: '#EF4444', fontSize: 10, position: 'insideTopRight' }}
            />
          )}
          {series.map(s => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: s.color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

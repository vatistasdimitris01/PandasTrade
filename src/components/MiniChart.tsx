import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { ChartDataPoint } from '../lib/stockData';

interface MiniChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  isPositive: boolean;
}

const MiniChart: React.FC<MiniChartProps> = ({ data, width = 70, height = 36, isPositive }) => {
  // Safety check for empty or invalid data
  if (!data || data.length === 0) {
    return <div style={{ width, height }} className="bg-neutral-800/30 rounded" />;
  }

  const color = isPositive ? '#10b981' : '#ef4444';

  const prices = data.map(d => d.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  // Avoid flat line issues if min === max
  const domain = min === max ? [min * 0.95, max * 1.05] : [min, max];

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={domain} hide />
          <Line
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniChart;
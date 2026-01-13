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
  const color = isPositive ? '#10b981' : '#ef4444';

  // Calculate min/max for domain to make the chart look dynamic
  const prices = data.map(d => d.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={[min, max]} hide />
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
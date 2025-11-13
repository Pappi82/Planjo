'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VelocityChartProps {
  data: { [key: string]: number };
}

export default function VelocityChart({ data }: VelocityChartProps) {
  const chartData = Object.entries(data).map(([week, count]) => ({
    week,
    tasks: count,
  }));

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/12 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.02] p-4 shadow-[0_20px_46px_rgba(5,8,26,0.45)]">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-16 right-10 h-40 w-40 rounded-full bg-[#6f9eff]/25 blur-[100px]" />
      </div>
      <div className="relative z-10">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <XAxis dataKey="week" stroke="#ffffff66" />
            <YAxis stroke="#ffffff66" />
            <Tooltip
              contentStyle={{
                background: 'rgba(5,7,20,0.95)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '18px',
                color: '#fff',
              }}
            />
            <Line
              type="monotone"
              dataKey="tasks"
              stroke="#8c6ff7"
              strokeWidth={3}
              dot={{ stroke: '#38f8c7', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

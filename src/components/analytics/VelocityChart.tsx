'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Task completion velocity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
            <XAxis dataKey="week" stroke="#ffffff66" />
            <YAxis stroke="#ffffff66" />
            <Tooltip
              contentStyle={{
                background: 'rgba(5,7,20,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
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
      </CardContent>
    </Card>
  );
}

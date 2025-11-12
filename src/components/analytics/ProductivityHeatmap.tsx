'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ProductivityHeatmapProps {
  hourlyActivity: { [hour: number]: number };
}

export default function ProductivityHeatmap({ hourlyActivity }: ProductivityHeatmapProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const maxActivity = Math.max(...Object.values(hourlyActivity), 1);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-white/5';
    const intensity = count / maxActivity;
    if (intensity > 0.75) return 'bg-[#8c6ff7]';
    if (intensity > 0.5) return 'bg-[#6f9eff]';
    if (intensity > 0.25) return 'bg-[#38f8c7]';
    return 'bg-[#38f8c7]/50';
  };

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Most productive hours</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-6 gap-3 sm:grid-cols-12">
          {hours.map((hour) => {
            const count = hourlyActivity[hour] || 0;
            return (
              <div key={hour} className="flex flex-col items-center gap-1 text-white/60">
                <div
                  className={`flex h-12 w-full flex-col items-center justify-center rounded-2xl border border-white/10 text-xs font-semibold text-white ${getColor(count)}`}
                  title={`${hour}:00 - ${count} activities`}
                >
                  {count > 0 ? count : '—'}
                </div>
                <span className="text-[0.6rem] uppercase tracking-[0.3em]">{hour}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

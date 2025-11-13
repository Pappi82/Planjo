'use client';

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
    <div className="relative overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.04] p-4 shadow-[0_20px_46px_rgba(5,8,26,0.45)]">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-12 left-16 h-32 w-32 rounded-full bg-[#38f8c7]/25 blur-[90px]" />
      </div>
      <div className="relative z-10 grid grid-cols-6 gap-3 sm:grid-cols-12">
        {hours.map((hour) => {
          const count = hourlyActivity[hour] || 0;
          return (
            <div key={hour} className="flex flex-col items-center gap-1 text-white/60">
              <div
                className={`flex h-14 w-full flex-col items-center justify-center rounded-2xl border border-white/12 text-sm font-semibold text-white ${getColor(
                  count
                )}`}
                title={`${hour}:00 • ${count} activities`}
              >
                {count > 0 ? count : '—'}
              </div>
              <span className="text-[0.6rem] uppercase tracking-[0.3em]">{hour}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

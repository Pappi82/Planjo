'use client';

import { Flame, Trophy } from 'lucide-react';

interface StreakDisplayProps {
  current: number;
  max: number;
}

export default function StreakDisplay({ current, max }: StreakDisplayProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <StreakTile
        icon={Flame}
        accent="#ff5c87"
        label="Current streak"
        value={current}
        footnote="Consecutive days"
      />
      <StreakTile
        icon={Trophy}
        accent="#ffd966"
        label="Best streak"
        value={max}
        footnote="Personal record"
      />
    </div>
  );
}

interface StreakTileProps {
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  label: string;
  value: number;
  footnote: string;
}

function StreakTile({ icon: Icon, accent, label, value, footnote }: StreakTileProps) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/12 bg-gradient-to-br from-white/[0.08] via-[#05071a]/70 to-[#070819]/90 p-6 text-white shadow-[0_24px_48px_rgba(5,8,26,0.45)]">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -top-10 right-8 h-36 w-36 rounded-full" style={{ backgroundColor: `${accent}33`, filter: 'blur(90px)' }} />
      </div>
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">{label}</p>
          <p className="text-4xl font-semibold">{value}</p>
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-white/45">{footnote}</p>
        </div>
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl border"
          style={{ borderColor: `${accent}55`, backgroundColor: `${accent}1a`, color: accent }}
        >
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </div>
  );
}

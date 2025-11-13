'use client';

import StreakDisplay from '@/components/analytics/StreakDisplay';
import VelocityChart from '@/components/analytics/VelocityChart';
import ProductivityHeatmap from '@/components/analytics/ProductivityHeatmap';
import { TrendingUp, Target, Clock } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { PageHero } from '@/components/layout/PageHero';
import { SectionSurface } from '@/components/layout/SectionSurface';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsPage() {
  const { analytics, isLoading } = useAnalytics({ days: 30 });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 rounded-[32px] border border-white/10 bg-white/10" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-56 rounded-[28px] border border-white/10 bg-white/10" />
          <Skeleton className="h-56 rounded-[28px] border border-white/10 bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <PageHero
        label="Analytics"
        title="Momentum tracker"
        description="Observe how often you show up, surfacing the windows where deep work sticks and the sprints that move the needle."
        meta={
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Last 30 days</p>
            <p className="text-sm text-white">
              {analytics?.tasksCompleted ?? 0} tasks shipped • {analytics?.activeDays ?? 0} active days
            </p>
          </div>
        }
      />

      <SectionSurface>
        <StreakDisplay current={analytics?.streak?.current || 0} max={analytics?.streak?.max || 0} />
      </SectionSurface>

      <SectionSurface>
        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile
            icon={Target}
            label="Tasks completed"
            value={analytics?.tasksCompleted ?? 0}
            footnote="Last 30 days"
          />
          <MetricTile
            icon={TrendingUp}
            label="Active days"
            value={analytics?.activeDays ?? 0}
            footnote="Showing up"
          />
          <MetricTile
            icon={Clock}
            label="Peak hour"
            value={`${analytics?.mostProductiveHour ?? 0}:00`}
            footnote="Deep work window"
          />
        </div>
      </SectionSurface>

      <SectionSurface title="Cadence over time" description="Velocity for each tracked week.">
        <VelocityChart data={analytics?.weeklyVelocity || {}} />
      </SectionSurface>

      <SectionSurface
        title="Focus heatmap"
        description="Where your energy lands across the day. Stack your next Vibe session where you naturally spike."
      >
        <ProductivityHeatmap hourlyActivity={analytics?.hourlyActivity || {}} />
      </SectionSurface>
    </div>
  );
}

interface MetricTileProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  footnote: string;
}

function MetricTile({ icon: Icon, label, value, footnote }: MetricTileProps) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.06] p-5 text-white shadow-[0_24px_48px_rgba(5,8,26,0.45)]">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -top-10 right-6 h-28 w-28 rounded-full bg-[#8c6ff7]/25 blur-[90px]" />
      </div>
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">{label}</p>
          <Icon className="h-4 w-4 text-white/60" />
        </div>
        <p className="text-3xl font-semibold">{value}</p>
        <p className="text-[0.7rem] uppercase tracking-[0.35em] text-white/45">{footnote}</p>
      </div>
    </div>
  );
}

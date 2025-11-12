'use client';

import StreakDisplay from '@/components/analytics/StreakDisplay';
import VelocityChart from '@/components/analytics/VelocityChart';
import ProductivityHeatmap from '@/components/analytics/ProductivityHeatmap';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, Target, Clock } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function AnalyticsPage() {
  const { analytics, isLoading } = useAnalytics({ days: 30 });

  if (isLoading) {
    return <div className="p-8 text-white/60">Loading analytics...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="planjo-panel rounded-3xl border border-white/10 bg-white/5 p-8 text-white">
        <h1 className="text-3xl font-semibold">Momentum tracker</h1>
        <p className="mt-2 text-white/60">
          Observe how often you show up and the windows where deep work sticks.
        </p>
      </div>

      <StreakDisplay current={analytics?.streak?.current || 0} max={analytics?.streak?.max || 0} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Tasks completed</CardTitle>
            <Target className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white">{analytics?.tasksCompleted || 0}</div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Active days</CardTitle>
            <TrendingUp className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white">{analytics?.activeDays || 0}</div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Presence</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Peak hour</CardTitle>
            <Clock className="h-4 w-4 text-white/60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-white">
              {analytics?.mostProductiveHour || 0}:00
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Deep work</p>
          </CardContent>
        </Card>
      </div>

      <VelocityChart data={analytics?.weeklyVelocity || {}} />

      <ProductivityHeatmap hourlyActivity={analytics?.hourlyActivity || {}} />
    </div>
  );
}

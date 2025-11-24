'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, TrendingUp, Flame } from 'lucide-react';

interface DailyMomentumProps {
  userId?: string;
}

export default function DailyMomentum({ userId }: DailyMomentumProps) {
  const [momentumPoints, setMomentumPoints] = useState(0);
  const [tasksCompletedToday, setTasksCompletedToday] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchTodaysMomentum = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch activity logs for today to calculate momentum points
      const response = await fetch(`/api/activity?date=${today.toISOString()}`);

      if (response.ok) {
        const data = await response.json();
        const activities = data.activities || [];

        console.log('[DailyMomentum] Fetched activities:', activities.length);
        console.log('[DailyMomentum] Activities:', activities);

        // Calculate total momentum points from activities
        // Only count positive momentum (forward progress and completions)
        // Backward movements don't deduct points, they just don't add any
        let totalPoints = 0;
        let completedCount = 0;

        activities.forEach((activity: any) => {
          const points = activity.metadata?.momentumPoints || 0;
          console.log('[DailyMomentum] Activity:', activity.type, 'Points:', points);

          // Only add positive momentum points
          if (points > 0) {
            totalPoints += points;
          }

          if (activity.type === 'task_completed') {
            completedCount++;
          }
        });

        console.log('[DailyMomentum] Total points:', totalPoints, 'Completed:', completedCount);

        setMomentumPoints(totalPoints);
        setTasksCompletedToday(completedCount);
      } else {
        console.error('[DailyMomentum] Failed to fetch activities:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch today\'s momentum:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchTodaysMomentum();

    // Poll every 5 seconds to detect task movements
    const intervalId = setInterval(fetchTodaysMomentum, 5000);

    return () => clearInterval(intervalId);
  }, [fetchTodaysMomentum]);

  // Energy levels based on momentum points (not just completed tasks)
  const getEnergyLevel = (points: number) => {
    if (points === 0) return { level: 'Idle', color: '#ffffff', opacity: 0.3, bars: 0 };
    if (points < 1) return { level: 'Warming up', color: '#6f9eff', opacity: 0.5, bars: 1 };
    if (points < 2) return { level: 'Building', color: '#8c6ff7', opacity: 0.7, bars: 2 };
    if (points < 3) return { level: 'Flowing', color: '#f9a826', opacity: 0.85, bars: 3 };
    if (points >= 3) return { level: 'On Fire', color: '#38f8c7', opacity: 1, bars: 4 };
    return { level: 'Idle', color: '#ffffff', opacity: 0.3, bars: 0 };
  };

  const energy = getEnergyLevel(momentumPoints);
  const maxBars = 4;

  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.04] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/[0.08]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: `radial-gradient(circle at top, ${energy.color}22 0%, transparent 60%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-500"
              style={{
                borderColor: `${energy.color}${Math.round(energy.opacity * 80).toString(16).padStart(2, '0')}`,
                backgroundColor: `${energy.color}${Math.round(energy.opacity * 15).toString(16).padStart(2, '0')}`
              }}
            >
              {momentumPoints >= 3 ? (
                <Flame className="h-6 w-6 transition-colors duration-500" style={{ color: energy.color }} />
              ) : (
                <Zap className="h-6 w-6 transition-colors duration-500" style={{ color: energy.color }} />
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Daily Energy</p>
              <h3 className="text-xl font-semibold">Momentum</h3>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{momentumPoints.toFixed(1)}</span>
            <span className="text-sm text-white/60">points</span>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 h-32 animate-pulse rounded-2xl bg-white/5" />
        ) : (
          <>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <p
                  className="text-lg font-semibold transition-colors duration-500"
                  style={{ color: energy.color, opacity: energy.opacity }}
                >
                  {energy.level}
                </p>
                <TrendingUp
                  className="h-5 w-5 transition-all duration-500"
                  style={{
                    color: energy.color,
                    opacity: energy.opacity
                  }}
                />
              </div>

              {/* Energy bars visualization */}
              <div className="flex gap-2">
                {Array.from({ length: maxBars }).map((_, index) => {
                  const isActive = index < energy.bars;
                  return (
                    <div
                      key={index}
                      className="relative h-16 flex-1 overflow-hidden rounded-lg border"
                      style={{
                        borderColor: isActive ? `${energy.color}40` : '#ffffff20',
                        backgroundColor: isActive ? `${energy.color}15` : '#ffffff05',
                      }}
                    >
                      {isActive && (
                        <>
                          <div
                            className="absolute inset-0 transition-all duration-700"
                            style={{
                              background: `linear-gradient(to top, ${energy.color}40 0%, ${energy.color}10 100%)`,
                            }}
                          />
                          <div
                            className="absolute inset-0 animate-pulse transition-all duration-700"
                            style={{
                              background: `radial-gradient(circle at center, ${energy.color}30 0%, transparent 70%)`,
                            }}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Momentum points</span>
                <span className="font-semibold text-white">{momentumPoints.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-white/60">Tasks completed</span>
                <span className="font-semibold text-white">{tasksCompletedToday}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-white/60">Energy level</span>
                <span className="font-semibold" style={{ color: energy.color }}>
                  {Math.round(energy.opacity * 100)}%
                </span>
              </div>
            </div>

            {momentumPoints === 0 && (
              <p className="mt-3 text-center text-xs text-white/50">
                Complete tasks or move them forward to build momentum
              </p>
            )}
            {momentumPoints >= 3 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#38f8c7]/30 bg-[#38f8c7]/10 px-3 py-2">
                <Flame className="h-4 w-4 text-[#38f8c7]" />
                <p className="text-xs text-white/90">
                  You're on fire! Keep the momentum going!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

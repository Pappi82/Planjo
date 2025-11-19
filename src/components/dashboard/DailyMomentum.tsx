'use client';

import { useState, useEffect } from 'react';
import { Zap, TrendingUp, Flame } from 'lucide-react';

interface DailyMomentumProps {
  userId?: string;
}

export default function DailyMomentum({ userId }: DailyMomentumProps) {
  const [tasksCompletedToday, setTasksCompletedToday] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodaysCompletions() {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const response = await fetch(
          `/api/tasks?completedAfter=${today.toISOString()}&completedBefore=${tomorrow.toISOString()}`
        );

        if (response.ok) {
          const data = await response.json();
          setTasksCompletedToday(data.tasks?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch today\'s completions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTodaysCompletions();
  }, [userId]);

  // Energy levels based on tasks completed
  const getEnergyLevel = (count: number) => {
    if (count === 0) return { level: 'Idle', color: '#ffffff', opacity: 0.3, bars: 0 };
    if (count === 1) return { level: 'Warming up', color: '#6f9eff', opacity: 0.5, bars: 1 };
    if (count === 2) return { level: 'Building', color: '#8c6ff7', opacity: 0.7, bars: 2 };
    if (count === 3) return { level: 'Flowing', color: '#f9a826', opacity: 0.85, bars: 3 };
    if (count >= 4) return { level: 'On Fire', color: '#38f8c7', opacity: 1, bars: 4 };
    return { level: 'Idle', color: '#ffffff', opacity: 0.3, bars: 0 };
  };

  const energy = getEnergyLevel(tasksCompletedToday);
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
              {tasksCompletedToday >= 4 ? (
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
            <span className="text-3xl font-bold">{tasksCompletedToday}</span>
            <span className="text-sm text-white/60">today</span>
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

            {tasksCompletedToday === 0 && (
              <p className="mt-3 text-center text-xs text-white/50">
                Complete your first task today to start building momentum
              </p>
            )}
            {tasksCompletedToday >= 4 && (
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

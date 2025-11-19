'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, ChevronRight } from 'lucide-react';
import { Task, Project } from '@/types';
import { useRouter } from 'next/navigation';
import { TASK_PRIORITIES } from '@/lib/constants';

interface HighPriorityTasksProps {
  userId?: string;
}

export default function HighPriorityTasks({ userId }: HighPriorityTasksProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<(Task & { project?: Project })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHighPriorityTasks() {
      try {
        const response = await fetch('/api/tasks?priority=high,urgent&limit=5');
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks || []);
        }
      } catch (error) {
        console.error('Failed to fetch high priority tasks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHighPriorityTasks();
  }, [userId]);

  const highCount = tasks.filter(t => t.priority === 'high').length;
  const urgentCount = tasks.filter(t => t.priority === 'urgent').length;

  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.04] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/[0.08]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: `radial-gradient(circle at top, #ff5c8722 0%, transparent 60%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff5c87]/30 bg-[#ff5c87]/10">
              <AlertCircle className="h-6 w-6 text-[#ff5c87]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Priority Focus</p>
              <h3 className="text-xl font-semibold">High Priority</h3>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{urgentCount + highCount}</span>
            <span className="text-sm text-white/60">tasks</span>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-white/60">No high priority tasks</p>
            <p className="mt-1 text-xs text-white/40">You're all caught up!</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {tasks.slice(0, 3).map(task => {
              const priorityInfo = TASK_PRIORITIES.find(p => p.value === task.priority);
              return (
                <button
                  key={task._id.toString()}
                  onClick={() => router.push(`/projects/${task.projectId}/board`)}
                  className="group/task w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-white/30 hover:bg-white/[0.08]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: priorityInfo?.color }}
                        />
                        <p className="truncate text-sm font-medium text-white">{task.title}</p>
                      </div>
                      {task.project && (
                        <p className="mt-1 text-xs text-white/50">{task.project.title}</p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/40 transition group-hover/task:text-white/70" />
                  </div>
                </button>
              );
            })}
            {tasks.length > 3 && (
              <button
                onClick={() => router.push('/projects')}
                className="w-full rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-3 text-center text-xs text-white/60 transition hover:border-white/40 hover:text-white/80"
              >
                +{tasks.length - 3} more high priority tasks
              </button>
            )}
          </div>
        )}

        {urgentCount > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#ff5c87]/30 bg-[#ff5c87]/10 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-[#ff5c87]" />
            <p className="text-xs text-white/90">
              <span className="font-semibold">{urgentCount}</span> urgent task{urgentCount !== 1 ? 's' : ''} need immediate attention
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

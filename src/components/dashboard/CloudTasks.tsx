'use client';

import { useState, useEffect } from 'react';
import { Cloud, ChevronRight } from 'lucide-react';
import { Task, Project } from '@/types';
import { useRouter } from 'next/navigation';

interface CloudTasksProps {
  userId?: string;
}

export default function CloudTasks({ userId }: CloudTasksProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<(Task & { project?: Project })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCloudTasks() {
      try {
        const response = await fetch('/api/tasks?isCloudTask=true&limit=10');
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks || []);
        }
      } catch (error) {
        console.error('Failed to fetch cloud tasks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCloudTasks();
  }, [userId]);

  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.04] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/[0.08]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: `radial-gradient(circle at top, #4ecbff22 0%, transparent 60%)` }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#4ecbff]/30 bg-[#4ecbff]/10">
              <Cloud className="h-6 w-6 text-[#4ecbff]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Quick Wins</p>
              <h3 className="text-xl font-semibold">Cloud Tasks</h3>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{tasks.length}</span>
            <span className="text-sm text-white/60">ready</span>
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
            <Cloud className="mx-auto h-10 w-10 text-white/20" />
            <p className="mt-3 text-sm text-white/60">No quick wins marked</p>
            <p className="mt-1 text-xs text-white/40">Click the cloud icon on any task card to add it here</p>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-2">
              {tasks.slice(0, 4).map(task => {
                const projectId = task.project?._id?.toString() || task.projectId?.toString();
                return (
                  <button
                    key={task._id.toString()}
                    onClick={() => projectId && router.push(`/projects/${projectId}/board`)}
                    className="group/task w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-[#4ecbff]/30 hover:bg-[#4ecbff]/5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Cloud className="h-3.5 w-3.5 flex-shrink-0 text-[#4ecbff]" />
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
              {tasks.length > 4 && (
                <button
                  onClick={() => router.push('/projects')}
                  className="w-full rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-3 text-center text-xs text-white/60 transition hover:border-white/40 hover:text-white/80"
                >
                  +{tasks.length - 4} more quick wins
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

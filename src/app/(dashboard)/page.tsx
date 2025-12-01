'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  FolderKanban,
  Lightbulb,
  BookOpen,
  BarChart3,
  Plus,
  Focus as FocusIcon,
  Activity,
  Flame,
  Target,
  Clock,
  CheckCircle2,
  NotebookPen,
  FileText,
  ListChecks,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectForm } from '@/components/projects/ProjectForm';
import StreakDisplay from '@/components/analytics/StreakDisplay';
import HighPriorityTasks from '@/components/dashboard/HighPriorityTasks';
import CloudTasks from '@/components/dashboard/CloudTasks';
import DailyMomentum from '@/components/dashboard/DailyMomentum';
import { useProjects } from '@/hooks/useProjects';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { useFocusTasks } from '@/hooks/useFocusTasks';
import { usePlanjoSound } from '@/components/providers/PlanjoExperienceProvider';
import { Project, ProjectDashboardStat, Task as TaskType, ActivityLog } from '@/types';
import { PROJECT_STATUSES, MOOD_OPTIONS_ARRAY } from '@/lib/constants';

type QuickActionKey = 'project' | 'idea' | 'journal' | 'momentum';

const activityMeta: Record<
  string,
  { label: string; icon: LucideIcon; accent: string }
> = {
  project_created: { label: 'Project created', icon: FolderKanban, accent: '#8c6ff7' },
  task_created: { label: 'Task added', icon: Plus, accent: '#6f9eff' },
  task_completed: { label: 'Task completed', icon: CheckCircle2, accent: '#38f8c7' },
  task_moved: { label: 'Task moved', icon: ListChecks, accent: '#f9a826' },
  journal_entry: { label: 'Journal entry', icon: NotebookPen, accent: '#ff5c87' },
  doc_created: { label: 'Doc captured', icon: FileText, accent: '#4ecbff' },
};

const priorityColors: Record<string, string> = {
  urgent: '#ff5c87',
  high: '#f9a826',
  medium: '#6f9eff',
  low: '#38f8c7',
};

const commandAccents: Record<QuickActionKey | 'analytics', string> = {
  project: '#6f9eff',
  idea: '#ff5c87',
  journal: '#4ecbff',
  momentum: '#38f8c7',
  analytics: '#f9a826',
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { play } = usePlanjoSound();
  const { projects, stats, mutate: refreshProjects } = useProjects({ withStats: true });
  const { analytics } = useAnalytics({ days: 30 });
  const { activities, mutate: refreshActivity } = useRecentActivity(5);
  const { tasks: focusTasks, mutate: refreshFocus } = useFocusTasks(5);

  const [actionDialog, setActionDialog] = useState<QuickActionKey | null>(null);
  const [ideaForm, setIdeaForm] = useState({ title: '', description: '', tags: '' });
  const [journalForm, setJournalForm] = useState({
    content: '',
    mood: MOOD_OPTIONS_ARRAY[1]?.value || 'good',
  });
  const [isSavingIdea, setIsSavingIdea] = useState(false);
  const [isSavingJournal, setIsSavingJournal] = useState(false);

  const statsMap = useMemo(() => {
    const map: Record<string, ProjectDashboardStat> = {};
    stats.forEach((stat) => {
      map[stat.projectId] = stat;
    });
    return map;
  }, [stats]);

  const projectLookup = useMemo(() => {
    const map: Record<string, Project> = {};
    projects.forEach((project) => {
      map[project._id.toString()] = project;
    });
    return map;
  }, [projects]);

  const featuredProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (b.status === 'active' && a.status !== 'active') return 1;
        const aRate = statsMap[a._id.toString()]?.completionRate || 0;
        const bRate = statsMap[b._id.toString()]?.completionRate || 0;
        return bRate - aRate;
      });
  }, [projects, statsMap]);

  const weeklyVelocity = analytics?.weeklyVelocity || {};
  const weeklyValues = Object.values(weeklyVelocity);
  const latestWeek = weeklyValues[weeklyValues.length - 1] || 0;
  const peakWeek =
    weeklyValues.length > 0 ? Math.max(...weeklyValues) : latestWeek || 1;
  const cadencePercent =
    peakWeek > 0 ? Math.round((latestWeek / peakWeek) * 100) : 0;
  const focusRetention = Math.min(
    100,
    Math.round(((analytics?.activeDays || 0) / 30) * 100)
  );
  const flowState =
    cadencePercent >= 80 ? 'Locked In' : cadencePercent >= 50 ? 'Steady' : 'Priming';
  const flowAccent =
    cadencePercent >= 80 ? '#38f8c7' : cadencePercent >= 50 ? '#8c6ff7' : '#ff5c87';

  const streakCurrent = analytics?.streak?.current || 0;
  const streakMax = analytics?.streak?.max || 0;

  const quickActions: { key: QuickActionKey; label: string; icon: LucideIcon }[] = [
    { key: 'project', label: 'New project', icon: FolderKanban },
    { key: 'idea', label: 'Add idea', icon: Lightbulb },
    { key: 'journal', label: 'Log journal', icon: BookOpen },
    { key: 'momentum', label: 'Momentum pulse', icon: BarChart3 },
  ];

  const closeActionDialog = () => setActionDialog(null);

  const handleCreateProject = async (data: any) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      await refreshProjects();
      await refreshActivity();
      closeActionDialog();
    } catch (error) {
      console.error(error);
      alert('Unable to create project right now.');
    }
  };

  const handleCreateIdea = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ideaForm.title.trim()) return;
    setIsSavingIdea(true);
    try {
      const response = await fetch('/api/parking-lot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ideaForm,
          tags: ideaForm.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to capture idea');
      }
      setIdeaForm({ title: '', description: '', tags: '' });
      await refreshActivity();
      closeActionDialog();
    } catch (error) {
      console.error(error);
      alert('Unable to save idea right now.');
    } finally {
      setIsSavingIdea(false);
    }
  };

  const handleCreateJournal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!journalForm.content.trim()) return;
    setIsSavingJournal(true);
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          content: journalForm.content,
          mood: journalForm.mood,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to log entry');
      }
      setJournalForm({
        content: '',
        mood: MOOD_OPTIONS_ARRAY[1]?.value || 'good',
      });
      await refreshActivity();
      closeActionDialog();
    } catch (error) {
      console.error(error);
      alert('Unable to log journal entry right now.');
    } finally {
      setIsSavingJournal(false);
    }
  };

  const renderDialogContent = () => {
    if (actionDialog === 'project') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Launch project</DialogTitle>
          </DialogHeader>
          <ProjectForm onSubmit={handleCreateProject} onCancel={closeActionDialog} />
        </>
      );
    }

    if (actionDialog === 'idea') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Capture idea</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateIdea} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idea-title">Title *</Label>
              <Input
                id="idea-title"
                value={ideaForm.title}
                onChange={(event) =>
                  setIdeaForm((prev) => ({ ...prev, title: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idea-description">Description</Label>
              <Textarea
                id="idea-description"
                value={ideaForm.description}
                onChange={(event) =>
                  setIdeaForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idea-tags">Tags</Label>
              <Input
                id="idea-tags"
                placeholder="feature, bug, polish..."
                value={ideaForm.tags}
                onChange={(event) =>
                  setIdeaForm((prev) => ({ ...prev, tags: event.target.value }))
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeActionDialog} disabled={isSavingIdea}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingIdea}>
                {isSavingIdea ? 'Saving...' : 'Save idea'}
              </Button>
            </div>
          </form>
        </>
      );
    }

    if (actionDialog === 'journal') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Quick journal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateJournal} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="journal-content">Entry *</Label>
              <Textarea
                id="journal-content"
                rows={5}
                value={journalForm.content}
                onChange={(event) =>
                  setJournalForm((prev) => ({ ...prev, content: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Mood</Label>
              <Select
                value={journalForm.mood}
                onValueChange={(value) =>
                  setJournalForm((prev) => ({ ...prev, mood: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS_ARRAY.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeActionDialog} disabled={isSavingJournal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingJournal}>
                {isSavingJournal ? 'Logging...' : 'Log entry'}
              </Button>
            </div>
          </form>
        </>
      );
    }

    if (actionDialog === 'momentum') {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Momentum pulse</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <MomentumMetric label="Weekly cadence" value={cadencePercent} icon={Target} />
              <MomentumMetric label="Focus retention" value={focusRetention} icon={Clock} />
            </div>
            <StreakDisplay current={streakCurrent} max={streakMax} />
            <div className="flex justify-end">
              <Button asChild variant="outline">
                <Link href="/analytics">Open analytics</Link>
              </Button>
            </div>
          </div>
        </>
      );
    }

    return null;
  };

  const now = new Date();
  const greeting = getTimeGreeting(now);
  const firstName = session?.user?.name?.split(' ')[0] || 'maker';
  const shippingRate = featuredProjects.length
    ? Math.round(
        (featuredProjects.reduce((total, project) => {
          const completion = statsMap[project._id.toString()]?.completionRate || 0;
          return total + completion;
        }, 0) /
          featuredProjects.length) *
          100
      )
    : 0;

  return (
    <div className="relative flex min-h-full flex-col gap-10 pb-20">
      <div className="pointer-events-none absolute inset-x-0 -top-40 z-0 h-[420px]">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#6f9eff]/40 via-[#ff5c87]/25 to-transparent blur-[140px]" />
        <div className="absolute left-[12%] top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#38f8c7]/30 via-transparent to-transparent blur-[120px]" />
      </div>

      <section className="relative z-10 overflow-hidden rounded-[32px] border border-white/15 bg-slate-950/70 p-8 shadow-[0_30px_80px_rgba(2,6,23,0.65)] backdrop-blur-3xl">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-[#6f9eff]/30 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#ff5c87]/20 blur-[110px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,255,0.08),_transparent_60%)]" />
        </div>

        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <p className="text-[0.75rem] uppercase tracking-[0.4em] text-white/60">Mission Control</p>
              <h1 className="text-3xl font-semibold text-white md:text-4xl">
                {greeting}, {firstName}
              </h1>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                onClick={() => {
                  play('action');
                  setActionDialog('project');
                }}
                className="h-12 rounded-full px-6 text-base shadow-[0_10px_30px_rgba(111,158,255,0.3)]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Launch project
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  play('nav');
                  router.push('/focus');
                }}
                className="h-12 rounded-full border-white/30 bg-white/5 px-6 text-base text-white/90 hover:bg-white/10"
              >
                <FocusIcon className="mr-2 h-4 w-4" />
                Enter focus mode
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <HighPriorityTasks userId={session?.user?.id} />
            <CloudTasks />
            <DailyMomentum userId={session?.user?.id} />
          </div>

          <QuickCommandGrid
            actions={quickActions}
            onSelect={(key) => {
              play('action');
              setActionDialog(key);
            }}
            onAnalytics={() => router.push('/analytics')}
          />
        </div>
      </section>

      <section className="relative z-10 grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <ProjectConstellation
          projects={featuredProjects}
          statsMap={statsMap}
          onCreate={() => {
            play('action');
            setActionDialog('project');
          }}
          onViewAll={() => router.push('/projects')}
        />

        <div className="flex flex-col gap-8">
          <FocusCapsulePreview
            tasks={focusTasks}
            projectLookup={projectLookup}
          />
          <ActivityTimeline activities={activities.slice(0, 6)} />
        </div>
      </section>

      <Dialog open={!!actionDialog} onOpenChange={(open) => (!open ? closeActionDialog() : null)}>
        <DialogContent className={actionDialog === 'project' ? 'max-h-[90vh] max-w-3xl overflow-y-auto rounded-[28px] border-white/10 bg-slate-950/80 backdrop-blur-2xl' : 'max-w-2xl rounded-[24px] border-white/10 bg-slate-950/80 backdrop-blur-2xl'}>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MomentumMetric({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-white shadow-[0_12px_24px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">{label}</p>
        <Icon className="h-4 w-4 text-white/50" />
      </div>
      <p className="mt-3 text-3xl font-semibold">{safeValue}%</p>
      <Progress value={safeValue} className="mt-3 h-1.5" />
    </div>
  );
}

function OrbitMetric({
  label,
  value,
  accent,
  subtitle,
}: {
  label: string;
  value: number;
  accent: string;
  subtitle: string;
}) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  const arc = safeValue * 3.6;

  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/12 bg-white/[0.04] p-6 text-white shadow-[0_18px_40px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/[0.08]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: `radial-gradient(circle at top, ${accent}22 0%, transparent 60%)` }}
      />
      <div className="relative z-10 flex items-center gap-6">
        <div className="relative h-24 w-24">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(${accent} ${arc}deg, rgba(255,255,255,0.08) ${arc}deg)`,
            }}
          />
          <div className="absolute inset-[18%] rounded-full bg-slate-950/80 backdrop-blur">
            <div className="flex h-full flex-col items-center justify-center">
              <span className="text-2xl font-semibold">{safeValue}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-white/60">%</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">{label}</p>
          <p className="text-sm text-white/70">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

function QuickCommandGrid({
  actions,
  onSelect,
  onAnalytics,
}: {
  actions: { key: QuickActionKey; label: string; icon: LucideIcon }[];
  onSelect: (key: QuickActionKey) => void;
  onAnalytics: () => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {actions.map((action) => {
        const accent = commandAccents[action.key];
        return (
          <button
            key={action.key}
            onClick={() => onSelect(action.key)}
            className="group relative overflow-hidden rounded-[20px] border border-white/12 bg-white/[0.05] px-5 py-4 text-left text-white shadow-[0_18px_36px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/[0.08]"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-50 transition-opacity duration-500 group-hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${accent}22 0%, transparent 65%)` }}
            />
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border text-white/80"
                  style={{
                    borderColor: `${accent}55`,
                    backgroundColor: `${accent}1a`,
                    color: accent,
                  }}
                >
                  <action.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{action.label}</span>
              </div>
              <span className="text-sm text-white/50">↗</span>
            </div>
          </button>
        );
      })}
      <button
        onClick={onAnalytics}
        className="group relative overflow-hidden rounded-[20px] border border-white/12 bg-white/[0.05] px-5 py-4 text-left text-white shadow-[0_18px_36px_rgba(15,23,42,0.45)] transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/[0.08]"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50 transition-opacity duration-500 group-hover:opacity-90"
          style={{ background: `linear-gradient(135deg, ${commandAccents.analytics}22 0%, transparent 65%)` }}
        />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl border"
              style={{
                borderColor: `${commandAccents.analytics}55`,
                backgroundColor: `${commandAccents.analytics}1a`,
                color: commandAccents.analytics,
              }}
            >
              <BarChart3 className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">Deep analytics</span>
          </div>
          <span className="text-sm text-white/50">↗</span>
        </div>
      </button>
    </div>
  );
}

function ProjectConstellation({
  projects,
  statsMap,
  onCreate,
  onViewAll,
}: {
  projects: Project[];
  statsMap: Record<string, ProjectDashboardStat>;
  onCreate: () => void;
  onViewAll: () => void;
}) {
  if (projects.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-[32px] border border-dashed border-white/20 bg-white/[0.03] p-8 text-center text-white shadow-[0_24px_48px_rgba(15,23,42,0.5)]">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -top-24 right-10 h-60 w-60 rounded-full bg-[#6f9eff]/20 blur-[120px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5">
            <FolderKanban className="h-7 w-7 text-white/70" />
          </div>
          <h2 className="text-2xl font-semibold">Your project constellation is empty</h2>
          <p className="max-w-md text-sm text-white/60">
            Launch a project to anchor your ideas, then watch this dashboard light up with progress, focus, and momentum.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={onCreate} className="rounded-full px-6">
              <Plus className="mr-2 h-4 w-4" />
              Launch project
            </Button>
            <Button
              variant="outline"
              onClick={onViewAll}
              className="rounded-full border-white/30 bg-white/5 text-white/80 hover:bg-white/10"
            >
              Explore workspace
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/12 bg-gradient-to-br from-white/[0.08] via-slate-900/60 to-slate-950/80 p-8 text-white shadow-[0_26px_60px_rgba(15,23,42,0.55)]">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-28 left-12 h-72 w-72 rounded-full bg-[#38f8c7]/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#ff5c87]/15 blur-[140px]" />
      </div>
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-white/60">Project nebula</p>
          <h2 className="text-2xl font-semibold">Featured work</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            onClick={onViewAll}
            className="rounded-full border border-white/25 bg-white/5 px-5 text-sm text-white/80 hover:text-white"
          >
            View all
          </Button>
        </div>
      </div>

      <div className="relative z-10 mt-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectConstellationCard
              key={project._id.toString()}
              project={project}
              stat={statsMap[project._id.toString()]}
              isPrimary={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectConstellationCard({
  project,
  stat,
  isPrimary,
}: {
  project: Project;
  stat?: ProjectDashboardStat;
  isPrimary: boolean;
}) {
  const accent = project.colorTheme || '#6f9eff';
  const statusInfo = PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES];
  const completion = stat ? Math.round((stat.completionRate || 0) * 100) : 0;
  const nextDue = stat?.nextDueDate ? new Date(stat.nextDueDate) : null;
  const dueText = nextDue ? `Next due ${formatDistanceToNow(nextDue, { addSuffix: true })}` : 'No due dates';
  const overdue = stat?.overdueTasks || 0;

  return (
    <Link
      href={`/projects/${project._id.toString()}/board`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.05] p-6 text-left text-white shadow-[0_24px_48px_rgba(15,23,42,0.5)] transition hover:-translate-y-1 hover:border-white/40 hover:bg-white/[0.1]"
      style={{ borderColor: `${accent}33` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: `linear-gradient(135deg, ${accent}${isPrimary ? '26' : '1f'} 0%, transparent 70%)` }}
      />
      <div className="relative z-10 flex flex-1 flex-col justify-between gap-6">
        <div className="space-y-4">
          <Badge
            style={{ color: accent, borderColor: `${accent}55` }}
            className="bg-transparent text-[0.65rem] uppercase tracking-[0.35em]"
          >
            {statusInfo?.label || '—'}
          </Badge>
          <div>
            <h3 className="text-2xl font-semibold">{project.title}</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/70">
            <span>{stat ? `${stat.completedTasks}/${stat.totalTasks} tasks` : 'No tasks yet'}</span>
            {stat && stat.upcomingTasks > 0 ? <span>• {stat.upcomingTasks} upcoming</span> : null}
            {overdue > 0 ? <span className="text-[#ff5c87]">{overdue} overdue</span> : null}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>{dueText}</span>
              <span className="text-white">{completion}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${completion}%`, background: accent }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FocusCapsulePreview({
  tasks,
  projectLookup,
}: {
  tasks: TaskType[];
  projectLookup: Record<string, Project>;
}) {
  const router = useRouter();
  const { play } = usePlanjoSound();

  // Filter to show only urgent tasks
  const urgentTasks = tasks.filter((task) => task.priority === 'urgent');
  const displayTasks = urgentTasks.slice(0, 3);

  return (
    <Link
      href="/focus"
      onClick={() => play('nav')}
      className="group relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.04] p-6 text-white shadow-[0_20px_40px_rgba(15,23,42,0.45)] transition-all hover:border-white/25 hover:bg-white/[0.06]"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-white/60">Focus capsule</p>
          <h3 className="text-xl font-semibold">Next flow session</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ff5c87]/30 bg-[#ff5c87]/10 transition-all group-hover:border-[#ff5c87]/50 group-hover:bg-[#ff5c87]/20">
          <FocusIcon className="h-5 w-5 text-[#ff5c87]" />
        </div>
      </div>

      {urgentTasks.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-6 text-center text-sm text-white/60">
          No urgent tasks. Click to add one.
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {displayTasks.map((task) => {
            const projectId =
              typeof task.projectId === 'string'
                ? task.projectId
                : task.projectId?.toString?.();
            const projectTitle = projectId ? projectLookup[projectId]?.title : undefined;

            return (
              <div
                key={task._id.toString()}
                className="rounded-xl border border-white/8 bg-white/[0.02] p-3 transition-colors group-hover:border-white/15"
              >
                <p className="text-sm font-medium text-white">{task.title}</p>
                <p className="mt-1 text-xs text-white/50">{projectTitle || 'Untitled project'}</p>
              </div>
            );
          })}
          {urgentTasks.length > 3 && (
            <p className="pt-2 text-center text-xs text-white/50">
              +{urgentTasks.length - 3} more task{urgentTasks.length - 3 !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/60 group-hover:text-white/80">
        <span>View all</span>
        <span>→</span>
      </div>
    </Link>
  );
}

function ActivityTimeline({ activities }: { activities: ActivityLog[] }) {
  if (activities.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.04] p-6 text-center text-white/70 shadow-[0_20px_40px_rgba(15,23,42,0.45)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/12 bg-white/5">
          <Activity className="h-7 w-7 text-white/55" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">Quiet orbit</h3>
        <p className="mt-2 text-xs text-white/60">
          Capture a task, log a journal entry, or launch a project to wake up the feed.
        </p>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.04] p-6 text-white shadow-[0_20px_40px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-white/60">Signal stream</p>
          <h3 className="text-xl font-semibold">Recent activity</h3>
        </div>
        <Link href="/analytics" className="text-xs uppercase tracking-[0.35em] text-white/50 hover:text-white">
          See all
        </Link>
      </div>
      <div className="mt-6 space-y-4">
        {activities.map((activity, index) => (
          <ActivityTimelineItem
            key={activity._id?.toString?.() || `${activity.description}-${index}`}
            activity={activity}
            isLast={index === activities.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function ActivityTimelineItem({
  activity,
  isLast,
}: {
  activity: ActivityLog;
  isLast: boolean;
}) {
  const meta = activityMeta[activity.type] || activityMeta.task_created;
  const timestamp = activity.createdAt
    ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
    : '';

  return (
    <div className="relative pl-10">
      {!isLast && <span className="absolute left-[11px] top-4 h-full w-px bg-white/12" />}
      <span
        className="absolute left-[6px] top-3 h-3 w-3 rounded-full border"
        style={{ backgroundColor: `${meta.accent}33`, borderColor: `${meta.accent}55` }}
      />
      <div className="relative z-10 rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 transition hover:-translate-y-[1px] hover:border-white/30 hover:bg-white/[0.08]">
        <p className="text-sm font-medium text-white">{activity.description}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
          <meta.icon className="h-3.5 w-3.5" />
          <span>{meta.label}</span>
          {timestamp && (
            <>
              <span>•</span>
              <span>{timestamp}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeGreeting(date: Date) {
  const hour = date.getHours();

  if (hour < 5) return 'Midnight momentum';
  if (hour < 11) return 'Morning launch';
  if (hour < 16) return 'Midday flow';
  if (hour < 20) return 'Twilight push';
  return 'Evening reset';
}

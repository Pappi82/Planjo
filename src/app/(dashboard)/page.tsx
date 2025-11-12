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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { play } = usePlanjoSound();
  const { projects, stats, mutate: refreshProjects } = useProjects({ withStats: true });
  const { analytics } = useAnalytics({ days: 30 });
  const { activities, mutate: refreshActivity } = useRecentActivity(5);
  const { tasks: focusTasks, mutate: refreshFocus } = useFocusTasks(5);

  const [actionDialog, setActionDialog] = useState<QuickActionKey | null>(null);
  const [vibeDialogOpen, setVibeDialogOpen] = useState(false);
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
      })
      .slice(0, 6);
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

  const openVibeLauncher = () => {
    setVibeDialogOpen(true);
    refreshFocus();
  };

  const launchVibeMode = (taskId: string) => {
    setVibeDialogOpen(false);
    play('action');
    router.push(`/vibe/${taskId}`);
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

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <section className="planjo-panel flex items-center justify-between gap-6 px-8 py-5">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-white">
            Welcome back, {session?.user?.name || 'maker'}
          </h1>
          <p className="text-sm text-white/60">
            Your workspace at a glance
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              play('action');
              setActionDialog('project');
            }}
          >
            <Plus className="h-4 w-4" />
            New project
          </Button>
          <Button variant="outline" onClick={openVibeLauncher}>
            <FocusIcon className="h-4 w-4" />
            Focus
          </Button>
        </div>
      </section>

      <div className="flex-1 overflow-hidden px-8 pb-8">
        <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Projects (2/3 width) */}
          <div className="lg:col-span-2">
            <Card className="flex h-full flex-col border-white/10 bg-white/5">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl text-white">Active Projects</CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white"
                >
                  <Link href="/projects">View all</Link>
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {featuredProjects.length === 0 ? (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10">
                    <div className="space-y-3 text-center">
                      <FolderKanban className="mx-auto h-12 w-12 text-white/20" />
                      <p className="text-sm text-white/60">No projects yet</p>
                      <Button
                        size="sm"
                        onClick={() => {
                          play('action');
                          setActionDialog('project');
                        }}
                      >
                        <Plus className="h-3 w-3" />
                        Create your first project
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid h-full auto-rows-fr grid-cols-2 gap-4">
                    {featuredProjects.map((project) => (
                      <ProjectTile
                        key={project._id.toString()}
                        project={project}
                        stat={statsMap[project._id.toString()]}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Stats & Activity (1/3 width) */}
          <div className="flex flex-col gap-6 overflow-hidden">
            {/* Momentum Stats */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-white">Your Flow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Streak</span>
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-[#ff5c87]" />
                      <span className="font-semibold text-white">
                        {streakCurrent} {streakCurrent === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Weekly velocity</span>
                    <span className="font-semibold text-white">{latestWeek} tasks</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Flow state</span>
                    <Badge
                      style={{ color: flowAccent, borderColor: `${flowAccent}55` }}
                      className="bg-transparent"
                    >
                      {flowState}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Cadence</span>
                    <span className="text-white/80">{cadencePercent}%</span>
                  </div>
                  <Progress value={cadencePercent} className="h-2" />
                </div>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Link href="/analytics">
                    <BarChart3 className="h-3 w-3" />
                    Full analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.key}
                    onClick={() => {
                      play('action');
                      setActionDialog(action.key);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    <action.icon className="h-4 w-4" />
                    <span className="font-medium">{action.label}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="flex flex-1 flex-col overflow-hidden border-white/10 bg-white/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-white">Recent</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-xs text-white/60">No activity yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activities.slice(0, 4).map((activity) => (
                      <ActivityRow key={activity._id?.toString?.() || activity.description} activity={activity} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!actionDialog} onOpenChange={(open) => (!open ? closeActionDialog() : null)}>
        <DialogContent className={actionDialog === 'project' ? 'max-h-[90vh] max-w-3xl overflow-y-auto' : 'max-w-lg'}>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>

      <Dialog open={vibeDialogOpen} onOpenChange={setVibeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pick a task for Vibe Mode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {focusTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/60">
                No open tasks detected. Create one inside a project to unlock Vibe Mode.
              </div>
            ) : (
              focusTasks.map((task) => (
                <FocusTaskRow
                  key={task._id.toString()}
                  task={task}
                  projectTitle={projectLookup[task.projectId?.toString()]?.title}
                  onLaunch={() => launchVibeMode(task._id.toString())}
                />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MomentumMetric({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">{label}</p>
        <Icon className="h-4 w-4 text-white/50" />
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}%</p>
      <Progress value={value} className="mt-3" />
    </div>
  );
}

function ProjectTile({
  project,
  stat,
}: {
  project: Project;
  stat?: ProjectDashboardStat;
}) {
  const statusInfo = PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES];
  const completion = stat ? Math.round(stat.completionRate * 100) : 0;
  const accent = project.colorTheme || '#8c6ff7';

  return (
    <Link
      href={`/projects/${project._id.toString()}/board`}
      className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-white transition hover:border-white/30 hover:bg-white/10"
      style={{
        borderColor: `${accent}33`,
        background: `linear-gradient(135deg, ${accent}0d, transparent)`,
      }}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <p className="text-base font-semibold text-white line-clamp-1">
              {project.title}
            </p>
            <p className="text-xs text-white/60 line-clamp-2">
              {project.description || 'No description yet.'}
            </p>
          </div>
          <Badge
            style={{ color: accent, borderColor: `${accent}55` }}
            className="shrink-0 bg-transparent text-[0.65rem]"
          >
            {statusInfo?.label || '—'}
          </Badge>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60">
            {stat ? `${stat.completedTasks}/${stat.totalTasks} tasks` : 'No tasks yet'}
          </span>
          <span className="font-medium text-white">{completion}%</span>
        </div>
        <Progress value={completion} className="h-1.5" />
      </div>
    </Link>
  );
}

function ActivityRow({ activity }: { activity: ActivityLog }) {
  const meta = activityMeta[activity.type] || activityMeta.task_created;
  const timestamp = activity.createdAt
    ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
    : '';

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white/80">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${meta.accent}22`, color: meta.accent }}
      >
        <meta.icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-white line-clamp-1">{activity.description}</p>
        <p className="text-[0.65rem] text-white/50">{timestamp}</p>
      </div>
    </div>
  );
}

function FocusTaskRow({
  task,
  projectTitle,
  onLaunch,
}: {
  task: TaskType;
  projectTitle?: string;
  onLaunch: () => void;
}) {
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const priorityColor = priorityColors[task.priority] || '#8c6ff7';

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/80">
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{task.title}</p>
        <div className="flex flex-wrap gap-3 text-xs text-white/60">
          <span>{projectTitle || 'Untitled project'}</span>
          {dueDate && <span>Due {dueDate.toLocaleDateString()}</span>}
          <span style={{ color: priorityColor }}>Priority: {task.priority}</span>
        </div>
      </div>
      <Button onClick={onLaunch}>
        <FocusIcon className="mr-2 h-4 w-4" />
        Enter vibe
      </Button>
    </div>
  );
}

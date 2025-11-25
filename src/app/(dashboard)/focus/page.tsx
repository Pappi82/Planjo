'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Focus as FocusIcon,
  CheckCircle2,
  Cloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects } from '@/hooks/useProjects';
import { useFocusTasks } from '@/hooks/useFocusTasks';
import { useColumns } from '@/hooks/useTasks';
import { usePlanjoSound } from '@/components/providers/PlanjoExperienceProvider';
import { Project, Task as TaskType } from '@/types';
import TaskDetail from '@/components/tasks/TaskDetail';

const priorityColors: Record<string, string> = {
  urgent: '#ff5c87',
  high: '#f9a826',
  medium: '#6f9eff',
  low: '#38f8c7',
};

export default function FocusPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { play } = usePlanjoSound();
  const { tasks: focusTasks, mutate: refreshFocus } = useFocusTasks(20);
  const { projects } = useProjects();

  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Find the selected task and get its project's columns
  const selectedTask = selectedTaskId
    ? focusTasks.find((t) => t._id.toString() === selectedTaskId) || null
    : null;

  const selectedTaskProjectId = selectedTask?.projectId?.toString();
  const { columns } = useColumns(selectedTaskProjectId);

  const projectLookup = projects.reduce((acc, project) => {
    acc[project._id.toString()] = project;
    return acc;
  }, {} as Record<string, Project>);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedProjectId) return;

    setIsSubmitting(true);
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          title: newTaskTitle,
          priority: 'urgent',
          status: 'To Do',
        }),
      });

      play('success');
      setNewTaskTitle('');
      setSelectedProjectId('');
      setAddTaskOpen(false);
      refreshFocus();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkDone = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedAt: new Date().toISOString() }),
      });

      play('success');
      refreshFocus();
    } catch (error) {
      console.error('Failed to mark task as done:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, data: any) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      refreshFocus();
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      refreshFocus();
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const handleAddSubtask = async (parentId: string, title: string) => {
    try {
      await fetch(`/api/tasks/${parentId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      refreshFocus();
    } catch (error) {
      console.error('Failed to add subtask:', error);
      throw error;
    }
  };

  const activeProjects = projects.filter((p) => !p.archivedAt);
  const urgentTasks = focusTasks.filter((task) => task.priority === 'urgent');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05060f] via-[#0a0d1f] to-[#05060f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff5c87]/30 bg-[#ff5c87]/10">
              <FocusIcon className="h-6 w-6 text-[#ff5c87]" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/60">Focus capsule</p>
              <h1 className="text-3xl font-bold">Channel your next flow session</h1>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <Button
            onClick={() => {
              play('action');
              setAddTaskOpen(true);
            }}
            className="h-12 rounded-full border border-[#ff5c87]/40 bg-[#ff5c87]/10 px-6 text-white/90 hover:border-[#ff5c87]/60 hover:bg-[#ff5c87]/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add urgent task
          </Button>
        </div>

        {/* Tasks Grid */}
        {urgentTasks.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/20 bg-white/[0.02] p-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/12 bg-white/5 mb-4">
              <FocusIcon className="h-10 w-10 text-white/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No urgent tasks</h3>
            <p className="text-white/60">
              Add an urgent task to focus your flow session.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentTasks.map((task) => {
              const projectId =
                typeof task.projectId === 'string'
                  ? task.projectId
                  : task.projectId?.toString?.();
              const project = projectId ? projectLookup[projectId] : undefined;

              return (
                <FocusTaskChip
                  key={task._id.toString()}
                  task={task}
                  project={project}
                  onMarkDone={() => handleMarkDone(task._id.toString())}
                  onRefresh={refreshFocus}
                  onClick={() => setSelectedTaskId(task._id.toString())}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={addTaskOpen} onOpenChange={setAddTaskOpen}>
        <DialogContent className="rounded-[28px] border-white/12 bg-slate-950/95">
          <DialogHeader>
            <DialogTitle>Add Urgent Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs urgent attention?"
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="task-project">Project *</Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger id="task-project" className="mt-1">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {activeProjects.map((project) => (
                    <SelectItem key={project._id.toString()} value={project._id.toString()}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddTaskOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim() || !selectedProjectId || isSubmitting}
                className="bg-[#ff5c87] hover:bg-[#ff5c87]/90"
              >
                {isSubmitting ? 'Adding...' : 'Add Task'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TaskDetail
        task={selectedTask as any}
        open={!!selectedTask}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onAddSubtask={handleAddSubtask}
        columns={columns}
      />
    </div>
  );
}

function FocusTaskChip({
  task,
  project,
  onMarkDone,
  onRefresh,
  onClick,
}: {
  task: TaskType;
  project?: Project;
  onMarkDone?: () => void;
  onRefresh?: () => void;
  onClick?: () => void;
}) {
  const [isCloudTask, setIsCloudTask] = useState(task.isCloudTask || false);
  const [isTogglingCloud, setIsTogglingCloud] = useState(false);
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const priorityColor = priorityColors[task.priority] || '#6f9eff';
  const projectColor = project?.colorTheme || '#6f9eff';
  const { play } = usePlanjoSound();

  const handleCloudToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTogglingCloud) return;

    setIsTogglingCloud(true);
    try {
      const response = await fetch(`/api/tasks/${task._id.toString()}/cloud`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCloudTask: !isCloudTask }),
      });

      if (response.ok) {
        setIsCloudTask(!isCloudTask);
        play('action');
        onRefresh?.();
      }
    } catch (error) {
      console.error('Failed to toggle cloud status:', error);
    } finally {
      setIsTogglingCloud(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.03] p-4 transition hover:-translate-y-[2px] hover:border-white/40 hover:bg-white/[0.08] cursor-pointer"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(135deg, ${priorityColor}22 0%, transparent 70%)` }}
      />
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{task.title}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            <span style={{ color: projectColor }} className="font-medium">
              {project?.title || 'Untitled project'}
            </span>
            {dueDate && <span className="text-white/60">Due {dueDate.toLocaleDateString()}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCloudToggle}
            variant="ghost"
            size="sm"
            disabled={isTogglingCloud}
            className={`h-8 w-8 rounded-full border p-0 transition-all ${
              isCloudTask
                ? 'border-[#4ecbff]/60 bg-[#4ecbff]/20 hover:border-[#4ecbff]/80 hover:bg-[#4ecbff]/30'
                : 'border-white/20 bg-white/5 hover:border-[#4ecbff]/40 hover:bg-[#4ecbff]/10'
            }`}
            title={isCloudTask ? "Remove from Quick Wins" : "Mark as Quick Win"}
          >
            <Cloud className={`h-3.5 w-3.5 ${isCloudTask ? 'text-[#4ecbff]' : 'text-white/60'}`} />
          </Button>
          {onMarkDone && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                play('success');
                onMarkDone();
              }}
              variant="ghost"
              size="sm"
              className="rounded-full border border-[#38f8c7]/40 bg-[#38f8c7]/10 px-4 text-xs text-white/75 hover:border-[#38f8c7]/60 hover:bg-[#38f8c7]/20 hover:text-white"
            >
              <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


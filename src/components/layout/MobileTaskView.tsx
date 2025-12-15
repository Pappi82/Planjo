'use client';

import { useState } from 'react';
import { Plus, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { TASK_PRIORITIES } from '@/lib/constants';

type ViewState = 'button' | 'form' | 'confirmation';

export function MobileTaskView() {
  const { projects, isLoading: projectsLoading } = useProjects();
  const [viewState, setViewState] = useState<ViewState>('button');
  const [taskForm, setTaskForm] = useState({ title: '', projectId: '', priority: 'medium' });
  const [isSaving, setIsSaving] = useState(false);
  const [createdTaskTitle, setCreatedTaskTitle] = useState('');

  const handleCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!taskForm.title.trim() || !taskForm.projectId) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: taskForm.projectId,
          title: taskForm.title,
          priority: taskForm.priority,
          status: 'To Do',
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      setCreatedTaskTitle(taskForm.title);
      setTaskForm({ title: '', projectId: '', priority: 'medium' });
      setViewState('confirmation');
    } catch (error) {
      console.error(error);
      alert('Unable to create task right now.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAnother = () => {
    setCreatedTaskTitle('');
    setViewState('form');
  };

  if (viewState === 'button') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#02030a] px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[rgba(108,111,247,0.18)] blur-[160px]" />
          <div className="absolute -bottom-32 right-8 h-[360px] w-[360px] rounded-full bg-[rgba(56,248,199,0.16)] blur-[160px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#38f8c7]" />
            <p className="text-sm uppercase tracking-[0.35em] text-white/60">Planjo</p>
          </div>
          <Button
            onClick={() => setViewState('form')}
            className="h-16 w-64 rounded-2xl bg-[#f9a826] text-lg font-semibold text-black hover:bg-[#f9a826]/90"
          >
            <Plus className="mr-2 h-6 w-6" />
            New Task
          </Button>
        </div>
      </div>
    );
  }

  if (viewState === 'confirmation') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#02030a] px-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[rgba(56,248,199,0.25)] blur-[160px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#38f8c7]/20">
            <CheckCircle className="h-10 w-10 text-[#38f8c7]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">Task Created!</h2>
            <p className="text-white/60">&ldquo;{createdTaskTitle}&rdquo;</p>
            <p className="text-sm text-white/40">Added to To Do column</p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              onClick={handleAddAnother}
              className="h-14 rounded-xl bg-[#f9a826] text-base font-semibold text-black hover:bg-[#f9a826]/90"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Another Task
            </Button>
            <Button
              onClick={() => setViewState('button')}
              variant="outline"
              className="h-14 rounded-xl border-white/20 bg-white/5 text-base text-white/80 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="relative flex min-h-screen flex-col bg-[#02030a] px-6 py-8 overflow-visible">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-28 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[rgba(108,111,247,0.18)] blur-[160px]" />
      </div>
      <div className="relative z-10 flex flex-col gap-6 overflow-visible">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setViewState('button')}
            variant="ghost"
            size="icon"
            className="rounded-full border border-white/20 bg-white/5 text-white/80 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Planjo</p>
            <h1 className="text-xl font-semibold text-white">New Task</h1>
          </div>
        </div>

        <form onSubmit={handleCreateTask} className="space-y-5 overflow-visible">
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-white/80">Title *</Label>
            <Input
              id="task-title"
              value={taskForm.title}
              onChange={(e) => setTaskForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="What needs to be done?"
              className="h-14 rounded-xl border-white/20 bg-white/5 text-white placeholder:text-white/40"
              required
            />
          </div>

          <div className="space-y-2 overflow-visible">
            <Label className="text-white/80">Project *</Label>
            <Select
              value={taskForm.projectId}
              onValueChange={(value) => setTaskForm((prev) => ({ ...prev, projectId: value }))}
            >
              <SelectTrigger className="h-14 w-full rounded-xl border-white/20 bg-white/5 text-white">
                <SelectValue placeholder={projectsLoading ? 'Loading...' : 'Select project'} />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[100]">
                {projects.map((project) => (
                  <SelectItem key={project._id.toString()} value={project._id.toString()}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 overflow-visible">
            <Label className="text-white/80">Priority</Label>
            <Select
              value={taskForm.priority}
              onValueChange={(value) => setTaskForm((prev) => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="h-14 w-full rounded-xl border-white/20 bg-white/5 text-white">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="z-[100]">
                {TASK_PRIORITIES.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSaving || !taskForm.projectId}
              className="h-14 rounded-xl bg-[#f9a826] text-base font-semibold text-black hover:bg-[#f9a826]/90 disabled:opacity-50"
            >
              {isSaving ? 'Creating...' : 'Create Task'}
            </Button>
            <Button
              type="button"
              onClick={() => setViewState('button')}
              variant="outline"
              disabled={isSaving}
              className="h-14 rounded-xl border-white/20 bg-white/5 text-base text-white/80 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


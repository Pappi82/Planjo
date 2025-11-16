'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTasks, useColumns } from '@/hooks/useTasks';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import TaskDetail from '@/components/tasks/TaskDetail';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ITask } from '@/types';
import { FileText, Shield } from 'lucide-react';
import { PageHero } from '@/components/layout/PageHero';
import { SectionSurface } from '@/components/layout/SectionSurface';
import { useProjects } from '@/hooks/useProjects';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { ProjectStatus } from '@/lib/constants';

export default function BoardPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { tasks, mutate: mutateTasks } = useTasks(projectId);
  const { columns, mutate: mutateColumns } = useColumns(projectId);
  const { projects, mutate: mutateProjects } = useProjects();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createColumnName, setCreateColumnName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Find the selected task from the tasks array
  const selectedTask = selectedTaskId
    ? tasks.find((t) => t._id.toString() === selectedTaskId) || null
    : null;

  const handleTaskMove = async (taskId: string, newStatus: string, newPosition: number) => {
    // Optimistic update: immediately update the UI
    mutateTasks(
      async (currentData: { tasks: ITask[] } | undefined) => {
        if (!currentData?.tasks) return currentData;

        // Find the task being moved
        const taskIndex = currentData.tasks.findIndex((t: ITask) => t._id.toString() === taskId);
        if (taskIndex === -1) return currentData;

        // Create a new array with the updated task
        const updatedTasks = [...currentData.tasks];
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          status: newStatus,
          position: newPosition,
        } as ITask;

        return { ...currentData, tasks: updatedTasks };
      },
      {
        // Don't revalidate immediately - we'll do it after the API call
        revalidate: false,
      }
    );

    // Make the API call in the background
    try {
      const response = await fetch('/api/tasks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, newStatus, newPosition }),
      });

      if (!response.ok) {
        throw new Error('Failed to move task');
      }

      // Revalidate to ensure we're in sync with the server
      mutateTasks();
    } catch (error) {
      console.error('Error moving task:', error);
      // Revert the optimistic update by revalidating
      mutateTasks();
    }
  };

  const handleTaskCreate = (columnName: string) => {
    setCreateColumnName(columnName);
    setCreateDialogOpen(true);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        title: newTaskTitle,
        status: createColumnName,
      }),
    });

    setNewTaskTitle('');
    setCreateDialogOpen(false);
    mutateTasks();
  };

  const handleUpdateTask = async (taskId: string, data: any) => {
    try {
      console.log('Updating task:', taskId, 'with data:', data);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update task failed:', errorData);
        throw new Error(errorData.error || 'Failed to update task');
      }

      await mutateTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete task');
      }

      await mutateTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  const handleAddSubtask = async (parentId: string, title: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          title,
          parentTaskId: parentId,
          status: 'To Do',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add subtask');
      }

      await mutateTasks();
    } catch (error) {
      console.error('Error adding subtask:', error);
      throw error;
    }
  };

  const handleColumnRename = async (columnId: string, newName: string) => {
    try {
      const response = await fetch(`/api/columns/${columnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename column');
      }

      // Refresh both columns and tasks since task statuses are updated
      await Promise.all([mutateColumns(), mutateTasks()]);
    } catch (error) {
      console.error('Error renaming column:', error);
      throw error;
    }
  };

  const project = projects.find((p) => p._id.toString() === projectId);
  const taskCount = tasks.length;
  const activeColumn = columns.length;

  return (
    <div className="flex h-full flex-col space-y-10">
      <PageHero
        label="Flow board"
        title={project?.title || 'Active tasks'}
        description={
          project?.description ||
          'Drag tickets, drop momentum, and keep work states visible.'
        }
        highlight={
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {project && (
              <ProjectStatusBadge
                projectId={projectId}
                currentStatus={project.status as ProjectStatus}
                onStatusChange={mutateProjects}
              />
            )}
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 uppercase tracking-[0.35em] text-white/60">
              {activeColumn} columns
            </span>
            <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 uppercase tracking-[0.35em] text-white/60">
              {taskCount} tasks
            </span>
          </div>
        }
        actions={
          <div className="flex flex-wrap gap-3">
            <Button
              className="rounded-full"
              disabled={!columns.length}
              onClick={() => columns.length && handleTaskCreate(columns[0].name)}
            >
              New task
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/25 bg-white/5 text-white/80 hover:text-white">
              <Link href={`/projects/${projectId}/docs`}>
                <FileText className="mr-2 h-4 w-4" />
                Docs
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/25 bg-white/5 text-white/80 hover:text-white">
              <Link href={`/projects/${projectId}/vault`}>
                <Shield className="mr-2 h-4 w-4" />
                Vault
              </Link>
            </Button>
          </div>
        }
      />

      <SectionSurface bleed>
        <div className="h-[80vh] min-h-[600px]">
          <KanbanBoard
            columns={columns}
            tasks={tasks}
            onTaskMove={handleTaskMove}
            onTaskClick={(task) => setSelectedTaskId(task._id.toString())}
            onTaskCreate={handleTaskCreate}
            onColumnRename={handleColumnRename}
          />
        </div>
      </SectionSurface>

      <TaskDetail
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onAddSubtask={handleAddSubtask}
      />

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-xl rounded-[26px] border-white/12 bg-slate-950/90">
          <DialogHeader>
            <DialogTitle>Create task in {createColumnName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateTask();
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>Create task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

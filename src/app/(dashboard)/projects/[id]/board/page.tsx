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
import { FolderKanban, FileText, Shield } from 'lucide-react';

export default function BoardPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { tasks, mutate: mutateTasks } = useTasks(projectId);
  const { columns } = useColumns(projectId);

  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createColumnName, setCreateColumnName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

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
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    mutateTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    mutateTasks();
  };

  const handleAddSubtask = async (parentId: string, title: string) => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        title,
        parentTaskId: parentId,
        status: 'To Do',
      }),
    });
    mutateTasks();
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="planjo-panel flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <FolderKanban className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="planjo-pill text-white/70">Flow board</p>
            <h1 className="text-2xl font-semibold text-white">Active tasks</h1>
            <p className="text-sm text-white/60">
              Drag tickets, drop momentum, and keep work states visible.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            disabled={!columns.length}
            onClick={() => columns.length && handleTaskCreate(columns[0].name)}
          >
            New task
          </Button>
          <Button asChild variant="outline">
            <Link href={`/projects/${projectId}/docs`}>
              <FileText className="mr-2 h-4 w-4" />
              Docs
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/projects/${projectId}/vault`}>
              <Shield className="mr-2 h-4 w-4" />
              Vault
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/0 p-4 flex-1 min-h-0">
        <KanbanBoard
          columns={columns}
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onTaskClick={setSelectedTask}
          onTaskCreate={handleTaskCreate}
        />
      </div>

      <TaskDetail
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onAddSubtask={handleAddSubtask}
      />

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task in {createColumnName}</DialogTitle>
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
            <div className="flex gap-2">
              <Button onClick={handleCreateTask}>Create</Button>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

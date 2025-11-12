'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ITask } from '@/types';
import { TASK_PRIORITIES } from '@/lib/constants';
import SubtaskList from './SubtaskList';
import { Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TaskDetailProps {
  task: ITask | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, data: any) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onAddSubtask: (parentId: string, title: string) => Promise<void>;
}

export default function TaskDetail({
  task,
  open,
  onClose,
  onUpdate,
  onDelete,
  onAddSubtask,
}: TaskDetailProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const handleEdit = () => {
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatedHours: task.estimatedHours || '',
      actualHours: task.actualHours || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(task._id.toString(), formData);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      try {
        await onDelete(task._id.toString());
        onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkComplete = async () => {
    await onUpdate(task._id.toString(), {
      completedAt: task.completedAt ? null : new Date(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Edit Task' : 'Task Details'}
          </DialogTitle>
        </DialogHeader>

        {!editing ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
              {task.description && (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Priority</Label>
                <Badge variant="secondary" className="mt-1">
                  {task.priority}
                </Badge>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <Badge variant="secondary" className="mt-1">
                  {task.status}
                </Badge>
              </div>
              {task.dueDate && (
                <div>
                  <Label className="text-sm text-muted-foreground">Due Date</Label>
                  <p className="mt-1">{formatDate(task.dueDate)}</p>
                </div>
              )}
              {task.estimatedHours && (
                <div>
                  <Label className="text-sm text-muted-foreground">Estimated</Label>
                  <p className="mt-1">{task.estimatedHours} hours</p>
                </div>
              )}
            </div>

            {(task as any).subtasks && (task as any).subtasks.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground mb-2">Subtasks</Label>
                <SubtaskList
                  subtasks={(task as any).subtasks}
                  onUpdate={(subtaskId, data) => onUpdate(subtaskId, data)}
                  onDelete={(subtaskId) => onDelete(subtaskId)}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleEdit}>Edit</Button>
              <Button
                variant={task.completedAt ? 'secondary' : 'default'}
                onClick={handleMarkComplete}
              >
                {task.completedAt ? 'Mark Incomplete' : 'Mark Complete'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => onAddSubtask(task._id.toString(), 'New subtask')}
              >
                Add Subtask
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                className="ml-auto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualHours">Actual Hours</Label>
                <Input
                  id="actualHours"
                  type="number"
                  value={formData.actualHours}
                  onChange={(e) =>
                    setFormData({ ...formData, actualHours: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

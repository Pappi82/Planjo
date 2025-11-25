'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ITask, IKanbanColumn } from '@/types';
import { TASK_PRIORITIES } from '@/lib/constants';
import SubtaskList from './SubtaskList';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface TaskDetailProps {
  task: ITask | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, data: any) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onAddSubtask: (parentId: string, title: string) => Promise<void>;
  columns: IKanbanColumn[];
}

export default function TaskDetail({
  task,
  open,
  onClose,
  onUpdate,
  onDelete,
  onAddSubtask,
  columns,
}: TaskDetailProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Initialize form data when task changes or dialog opens
  useEffect(() => {
    if (task && open) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
      setHasChanges(false);
    }
  }, [task?._id, open]); // Only reset when task ID changes or dialog opens

  if (!task) return null;

  const handleFieldChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    setHasChanges(true);

    // For priority and date, save immediately
    if (field === 'priority' || field === 'dueDate') {
      handleSave({ [field]: value });
    }
  };

  const handleSave = async (customData?: any) => {
    setLoading(true);
    try {
      const dataToSave = customData || {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
      };

      // Don't save if title is empty
      if (dataToSave.title !== undefined && !dataToSave.title.trim()) {
        return;
      }

      // Handle empty date fields
      if (dataToSave.dueDate === '') {
        dataToSave.dueDate = null;
      }

      await onUpdate(task._id.toString(), dataToSave);
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(task._id.toString());
      setConfirmDeleteOpen(false);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      // Sort columns by order to find the last column
      const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
      const lastColumn = sortedColumns[sortedColumns.length - 1];
      const inProgressColumn = sortedColumns.find(col => col.name === 'In Progress') || sortedColumns[1];

      const isCurrentlyComplete = !!task.completedAt;

      if (isCurrentlyComplete) {
        // Unmarking as complete - clear completedAt and move to In Progress
        await onUpdate(task._id.toString(), {
          completedAt: null,
          status: inProgressColumn?.name || task.status,
        });
      } else {
        // Marking as complete - set completedAt and move to last column
        await onUpdate(task._id.toString(), {
          completedAt: new Date().toISOString(),
          status: lastColumn?.name || task.status,
        });
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!task) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-[28px] border-white/12 bg-slate-950/85">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>

          {/* Completion Status */}
          <div className="flex items-center gap-3 pt-3 pb-2">
            <Checkbox
              id="task-complete"
              checked={!!task.completedAt}
              onCheckedChange={handleToggleComplete}
              disabled={loading}
            />
            <Label
              htmlFor="task-complete"
              className={`text-sm font-medium cursor-pointer select-none transition-colors ${
                task.completedAt ? 'text-green-400' : 'text-white/70'
              }`}
            >
              {task.completedAt ? 'Completed' : 'Mark as complete'}
            </Label>
            {task.completedAt && (
              <span className="text-xs text-white/40">
                {new Date(task.completedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              disabled={loading}
              className="text-xl font-semibold"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              disabled={loading}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleFieldChange('priority', value)}
                disabled={loading}
              >
                <SelectTrigger id="priority">
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
              <Label htmlFor="dueDate" className="text-sm font-medium">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Subtasks Section */}
          {(task as any).subtasks && (task as any).subtasks.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Subtasks</Label>
              <SubtaskList
                subtasks={(task as any).subtasks}
                onUpdate={(subtaskId, data) => onUpdate(subtaskId, data)}
                onDelete={(subtaskId) => onDelete(subtaskId)}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => onAddSubtask(task._id.toString(), 'New subtask')}
              disabled={loading}
            >
              Add Subtask
            </Button>
            {hasChanges && (
              <Button
                onClick={() => handleSave()}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setConfirmDeleteOpen(true)}
              className={!hasChanges ? 'ml-auto' : ''}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={(open) => setConfirmDeleteOpen(open)}
        title="Delete task"
        description={`Delete "${task.title}"? All subtasks will be removed as well.`}
        confirmLabel="Delete"
        cancelLabel="Keep task"
        tone="danger"
        onConfirm={handleDelete}
      />
    </Dialog>
  );
}

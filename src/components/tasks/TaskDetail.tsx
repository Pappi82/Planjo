'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ITask } from '@/types';
import { TASK_PRIORITIES } from '@/lib/constants';
import SubtaskList from './SubtaskList';
import { Trash2, Focus } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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

  const handleEnterVibeMode = () => {
    router.push(`/vibe/${task._id.toString()}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>

          {/* Enter Vibe Mode Button - Centered */}
          <div className="flex justify-center pt-2 pb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnterVibeMode}
              className="gap-2"
            >
              <Focus className="h-4 w-4" />
              Enter Vibe Mode
            </Button>
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
              onClick={handleDelete}
              className={!hasChanges ? 'ml-auto' : ''}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

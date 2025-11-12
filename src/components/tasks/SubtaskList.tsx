'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ITask } from '@/types';
import { Trash2 } from 'lucide-react';

interface SubtaskListProps {
  subtasks: ITask[];
  onUpdate: (subtaskId: string, data: any) => void;
  onDelete: (subtaskId: string) => void;
}

export default function SubtaskList({ subtasks, onUpdate, onDelete }: SubtaskListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleToggle = (subtask: ITask) => {
    onUpdate(subtask._id.toString(), {
      completedAt: subtask.completedAt ? null : new Date().toISOString(),
    });
  };

  const handleStartEdit = (subtask: ITask) => {
    setEditingId(subtask._id.toString());
    setEditingTitle(subtask.title);
  };

  const handleSaveEdit = async (subtaskId: string) => {
    if (editingTitle.trim()) {
      await onUpdate(subtaskId, { title: editingTitle.trim() });
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, subtaskId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(subtaskId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-2">
      {subtasks.map((subtask) => (
        <div
          key={subtask._id.toString()}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white/80"
        >
          <Checkbox
            checked={!!subtask.completedAt}
            onCheckedChange={() => handleToggle(subtask)}
          />
          {editingId === subtask._id.toString() ? (
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => handleSaveEdit(subtask._id.toString())}
              onKeyDown={(e) => handleKeyDown(e, subtask._id.toString())}
              autoFocus
              className="flex-1 h-8 bg-white/10 border-white/20"
            />
          ) : (
            <span
              className={`flex-1 cursor-pointer ${
                subtask.completedAt ? 'line-through text-muted-foreground' : ''
              }`}
              onClick={() => handleStartEdit(subtask)}
            >
              {subtask.title}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(subtask._id.toString())}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

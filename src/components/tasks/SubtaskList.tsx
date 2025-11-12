'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ITask } from '@/types';
import { Trash2 } from 'lucide-react';

interface SubtaskListProps {
  subtasks: ITask[];
  onUpdate: (subtaskId: string, data: any) => void;
  onDelete: (subtaskId: string) => void;
}

export default function SubtaskList({ subtasks, onUpdate, onDelete }: SubtaskListProps) {
  const handleToggle = (subtask: ITask) => {
    onUpdate(subtask._id.toString(), {
      completedAt: subtask.completedAt ? null : new Date(),
    });
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
          <span
            className={`flex-1 ${
              subtask.completedAt ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {subtask.title}
          </span>
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

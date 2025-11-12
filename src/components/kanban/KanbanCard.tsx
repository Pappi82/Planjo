'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ITask } from '@/types';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TASK_PRIORITIES } from '@/lib/constants';

interface KanbanCardProps {
  task: ITask;
  onClick?: () => void;
  isDragging?: boolean;
  accentColor?: string;
}

export default function KanbanCard({ task, onClick, isDragging, accentColor }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task._id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColor = TASK_PRIORITIES.find((p) => p.value === task.priority)?.color;
  const subtaskCount = (task as any).subtasks?.length || 0;
  const completedSubtasks =
    (task as any).subtasks?.filter((s: ITask) => s.completedAt).length || 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white line-clamp-2">{task.title}</h4>
            {task.description && (
              <p className="mt-1 text-xs text-white/60 line-clamp-2">{task.description}</p>
            )}
          </div>
          <div
            className="h-8 w-1.5 rounded-full"
            style={{ background: `linear-gradient(180deg, ${priorityColor}, ${accentColor || '#38f8c7'})` }}
          />
        </div>

        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.slice(0, 2).map((label) => (
              <Badge key={label} variant="outline" className="text-[0.65rem] text-white/70">
                {label}
              </Badge>
            ))}
            {task.labels.length > 2 && (
              <Badge variant="outline" className="text-[0.65rem] text-white/70">
                +{task.labels.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/55">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </div>
          )}
          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {task.estimatedHours}h
            </div>
          )}
          {subtaskCount > 0 && (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {completedSubtasks}/{subtaskCount}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

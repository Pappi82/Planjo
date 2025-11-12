'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ITask } from '@/types';
import { Calendar, Clock, CheckCircle2, Focus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { TASK_PRIORITIES } from '@/lib/constants';

interface KanbanCardProps {
  task: ITask;
  onClick?: () => void;
  isDragging?: boolean;
  accentColor?: string;
}

export default function KanbanCard({ task, onClick, isDragging, accentColor }: KanbanCardProps) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: task._id.toString(),
  });

  const isBeingDragged = isDragging || isSortableDragging;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isBeingDragged ? 0.5 : 1,
    cursor: isBeingDragged ? 'grabbing' : 'grab',
  };

  const priorityColor = TASK_PRIORITIES.find((p) => p.value === task.priority)?.color;
  const subtaskCount = (task as any).subtasks?.length || 0;
  const completedSubtasks =
    (task as any).subtasks?.filter((s: ITask) => s.completedAt).length || 0;

  const handleVibeMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/vibe/${task._id.toString()}`);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-white/30 hover:bg-white/10 ${
        isBeingDragged ? 'scale-105 shadow-2xl ring-2 ring-white/20' : 'cursor-grab active:cursor-grabbing'
      }`}
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white line-clamp-2">{task.title}</h4>
            {task.description && (
              <p className="mt-1 text-xs text-white/60 line-clamp-2">{task.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
              onClick={handleVibeMode}
              title="Enter Vibe Mode"
            >
              <Focus className="h-3.5 w-3.5 text-[#38f8c7]" />
            </Button>
            <div
              className="h-8 w-1.5 rounded-full"
              style={{ background: `linear-gradient(180deg, ${priorityColor}, ${accentColor || '#38f8c7'})` }}
            />
          </div>
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

'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

  const baseAccent = accentColor || '#6f9eff';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[22px] border border-white/12 bg-white/[0.06] p-4 text-white shadow-[0_18px_36px_rgba(5,8,26,0.45)] transition-all duration-200 ${
        isBeingDragged ? 'scale-[1.02] ring-2 ring-white/20' : 'cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:border-white/35 hover:bg-white/[0.1]'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div
          className="absolute -top-14 right-6 h-28 w-28 rounded-full blur-[90px]"
          style={{ backgroundColor: `${baseAccent}33` }}
        />
      </div>
      <div className="relative z-10 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold leading-snug text-white line-clamp-2">{task.title}</h4>
            {task.description ? (
              <p className="mt-1 text-xs leading-normal text-white/65 line-clamp-2">{task.description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full border border-white/15 bg-white/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              onClick={handleVibeMode}
              title="Enter Vibe Mode"
            >
              <Focus className="h-3.5 w-3.5 text-[#38f8c7]" />
            </Button>
            <div
              className="h-8 w-1.5 rounded-full"
              style={{
                background: `linear-gradient(180deg, ${priorityColor}, ${baseAccent})`,
              }}
            />
          </div>
        </div>

        {task.labels.length > 0 ? (
          <div className="flex flex-wrap gap-1 text-[0.65rem] text-white/70">
            {task.labels.slice(0, 2).map((label) => (
              <Badge key={label} variant="outline" className="rounded-full border-white/20 bg-white/5 px-2 py-0.5">
                {label}
              </Badge>
            ))}
            {task.labels.length > 2 ? (
              <Badge variant="outline" className="rounded-full border-white/20 bg-white/5 px-2 py-0.5">
                +{task.labels.length - 2}
              </Badge>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/55">
          {task.dueDate ? (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </div>
          ) : null}
          {task.estimatedHours ? (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {task.estimatedHours}h
            </div>
          ) : null}
          {subtaskCount > 0 ? (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              {completedSubtasks}/{subtaskCount}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

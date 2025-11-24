'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { ITask } from '@/types';
import { Calendar, Clock, CheckCircle2, Cloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { TASK_PRIORITIES } from '@/lib/constants';
import { useState } from 'react';

interface KanbanCardProps {
  task: ITask;
  onClick?: () => void;
  isDragging?: boolean;
  accentColor?: string;
}

export default function KanbanCard({ task, onClick, isDragging, accentColor }: KanbanCardProps) {
  const router = useRouter();
  const [isCloudTask, setIsCloudTask] = useState(task.isCloudTask || false);
  const [isTogglingCloud, setIsTogglingCloud] = useState(false);

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

  const handleCloudToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTogglingCloud) return;

    setIsTogglingCloud(true);
    try {
      const response = await fetch(`/api/tasks/${task._id.toString()}/cloud`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCloudTask: !isCloudTask }),
      });

      if (response.ok) {
        setIsCloudTask(!isCloudTask);
      }
    } catch (error) {
      console.error('Failed to toggle cloud status:', error);
    } finally {
      setIsTogglingCloud(false);
    }
  };

  const baseAccent = accentColor || '#6f9eff';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group relative flex-shrink-0 overflow-hidden rounded-[22px] border border-white/12 bg-white/[0.06] p-4 text-white shadow-[0_18px_36px_rgba(5,8,26,0.45)] transition-all duration-300 ${
        isBeingDragged ? 'ring-2 ring-white/20' : 'cursor-grab active:cursor-grabbing hover:border-white/40 hover:bg-white/[0.1] hover:shadow-[0_20px_50px_rgba(5,8,26,0.6),0_0_30px_rgba(111,158,255,0.15)]'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-70">
        <div
          className="absolute -top-14 right-6 h-28 w-28 rounded-full blur-[90px] transition-all duration-300 group-hover:blur-[100px]"
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
              className={`h-7 w-7 rounded-full border transition-all duration-300 ${
                isCloudTask
                  ? 'border-[#4ecbff]/50 bg-[#4ecbff]/20 opacity-100 hover:bg-[#4ecbff]/30 hover:border-[#4ecbff]/70 hover:shadow-[0_0_20px_rgba(78,203,255,0.5)]'
                  : 'border-white/15 bg-white/10 opacity-0 group-hover:opacity-100 hover:bg-white/20 hover:border-white/30 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]'
              }`}
              onClick={handleCloudToggle}
              title={isCloudTask ? "Remove from Quick Wins" : "Mark as Quick Win"}
              disabled={isTogglingCloud}
            >
              <Cloud className={`h-3.5 w-3.5 transition-all duration-300 ${isCloudTask ? 'text-[#4ecbff] hover:drop-shadow-[0_0_6px_rgba(78,203,255,0.9)]' : 'text-white/70 hover:text-white hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]'}`} />
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

'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ITask, IKanbanColumn } from '@/types';
import KanbanCard from './KanbanCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  column: IKanbanColumn;
  tasks: ITask[];
  onTaskClick: (task: ITask) => void;
  onTaskCreate: () => void;
}

export default function KanbanColumn({
  column,
  tasks,
  onTaskClick,
  onTaskCreate,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id: column._id.toString() });

  return (
    <div className="flex w-80 flex-shrink-0 flex-col">
      <div className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-white">{column.name}</h3>
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">{tasks.length} tasks</p>
          </div>
          <button
            onClick={onTaskCreate}
            className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70 transition hover:border-white/40 hover:text-white"
          >
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>

        <div ref={setNodeRef} className="mt-4 flex max-h-[70vh] flex-col gap-3 overflow-y-auto pr-1">
          <SortableContext
            items={tasks.map((t) => t._id.toString())}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <KanbanCard
                key={task._id.toString()}
                task={task}
                onClick={() => onTaskClick(task)}
                accentColor={column.color}
              />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ITask, IKanbanColumn } from '@/types';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';
import { usePlanjoSound } from '@/components/providers/PlanjoExperienceProvider';

interface KanbanBoardProps {
  columns: IKanbanColumn[];
  tasks: ITask[];
  onTaskMove: (taskId: string, newStatus: string, newPosition: number) => void;
  onTaskClick: (task: ITask) => void;
  onTaskCreate: (columnName: string) => void;
}

export default function KanbanBoard({
  columns,
  tasks,
  onTaskMove,
  onTaskClick,
  onTaskCreate,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<ITask | null>(null);
  const { play } = usePlanjoSound();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id.toString() === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    const overColumn = columns.find((col) => col._id.toString() === overId);

    if (overColumn) {
      const tasksInColumn = tasks.filter((t) => t.status === overColumn.name);
      const newPosition = tasksInColumn.length;
      onTaskMove(taskId, overColumn.name, newPosition);
      play('success');
    }

    setActiveTask(null);
  };

  const getTasksForColumn = (columnName: string) => tasks.filter((task) => task.status === columnName);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column._id.toString()}
            column={column}
            tasks={getTasksForColumn(column.name)}
            onTaskClick={onTaskClick}
            onTaskCreate={() => {
              play('action');
              onTaskCreate(column.name);
            }}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} isDragging accentColor="#8c6ff7" /> : null}
      </DragOverlay>
    </DndContext>
  );
}

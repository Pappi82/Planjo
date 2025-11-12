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
  defaultDropAnimationSideEffects,
  type DropAnimation,
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

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
    duration: 250,
    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t._id.toString() === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const overId = over.id as string;
    const overColumn = columns.find((col) => col._id.toString() === overId);

    if (overColumn && activeTask) {
      const tasksInColumn = tasks.filter((t) => t.status === overColumn.name);
      const newPosition = tasksInColumn.length;

      // Update the active task with the new status so the drop animation goes to the new column
      setActiveTask({
        ...activeTask,
        status: overColumn.name,
        position: newPosition,
      } as ITask);

      // Trigger the move
      onTaskMove(taskId, overColumn.name, newPosition);
      play('success');

      // Clear the active task after the drop animation completes
      setTimeout(() => {
        setActiveTask(null);
      }, 250);
    } else {
      setActiveTask(null);
    }
  };

  const getTasksForColumn = (columnName: string) => tasks.filter((task) => task.status === columnName);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6 h-full">
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

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? <KanbanCard task={activeTask} isDragging accentColor="#8c6ff7" /> : null}
      </DragOverlay>
    </DndContext>
  );
}

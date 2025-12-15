'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragMoveEvent,
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
  onColumnRename?: (columnId: string, newName: string) => Promise<void>;
}

export default function KanbanBoard({
  columns,
  tasks,
  onTaskMove,
  onTaskClick,
  onTaskCreate,
  onColumnRename,
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

  const handleDragMove = (event: DragMoveEvent) => {
    const { over, activatorEvent } = event;

    if (!over || !activatorEvent) return;

    // Check if activatorEvent is a mouse or pointer event
    if (!('clientY' in activatorEvent)) return;

    // Find the column element that's being hovered over
    const columnElement = document.querySelector(`[data-column-id="${over.id}"]`);
    if (!columnElement) return;

    // Find the scrollable container within the column
    const scrollContainer = columnElement.querySelector('[data-scrollable="true"]');
    if (!scrollContainer) return;

    // Get the bounding rectangles
    const rect = scrollContainer.getBoundingClientRect();
    const scrollThreshold = 100; // pixels from edge to trigger scroll
    const scrollSpeed = 10; // pixels per frame

    // Get mouse position relative to the scroll container
    const mouseY = (activatorEvent as MouseEvent | PointerEvent).clientY;

    // Auto-scroll when near the top or bottom
    if (mouseY < rect.top + scrollThreshold) {
      // Near top - scroll up
      scrollContainer.scrollTop = Math.max(0, scrollContainer.scrollTop - scrollSpeed);
    } else if (mouseY > rect.bottom - scrollThreshold) {
      // Near bottom - scroll down
      scrollContainer.scrollTop = Math.min(
        scrollContainer.scrollHeight - scrollContainer.clientHeight,
        scrollContainer.scrollTop + scrollSpeed
      );
    }
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

  const getTasksForColumn = (columnName: string) => {
    const priorityOrder: Record<string, number> = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    return tasks
      .filter((task) => task.status === columnName)
      .sort((a, b) => {
        // Sort by priority first (highest priority first)
        const aPriority = priorityOrder[a.priority] ?? 0;
        const bPriority = priorityOrder[b.priority] ?? 0;
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Descending order (urgent first)
        }
        // Then by position (ascending order)
        return a.position - b.position;
      });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 pb-4 h-full w-full">
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
            onColumnRename={onColumnRename}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? <KanbanCard task={activeTask} isDragging accentColor="#8c6ff7" /> : null}
      </DragOverlay>
    </DndContext>
  );
}

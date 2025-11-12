'use client';

import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ITask, IKanbanColumn } from '@/types';
import KanbanCard from './KanbanCard';
import { Plus, Pencil, Check, X } from 'lucide-react';

interface KanbanColumnProps {
  column: IKanbanColumn;
  tasks: ITask[];
  onTaskClick: (task: ITask) => void;
  onTaskCreate: () => void;
  onColumnRename?: (columnId: string, newName: string) => Promise<void>;
}

export default function KanbanColumn({
  column,
  tasks,
  onTaskClick,
  onTaskCreate,
  onColumnRename,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column._id.toString() });
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(column.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditedName(column.name);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedName(column.name);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const trimmedName = editedName.trim();

    if (!trimmedName) {
      handleCancelEdit();
      return;
    }

    if (trimmedName === column.name) {
      setIsEditing(false);
      return;
    }

    if (onColumnRename) {
      setIsRenaming(true);
      try {
        await onColumnRename(column._id.toString(), trimmedName);
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to rename column:', error);
        setEditedName(column.name);
      } finally {
        setIsRenaming(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="flex w-80 flex-shrink-0 flex-col h-full">
      <div className={`flex flex-col rounded-3xl border p-5 backdrop-blur-xl h-full transition-all duration-200 ${
        isOver
          ? 'border-white/40 bg-white/10 shadow-lg'
          : 'border-white/10 bg-white/5'
      }`}>
        <div className="flex items-start justify-between gap-2 flex-shrink-0">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveEdit}
                  disabled={isRenaming}
                  className="text-lg font-semibold text-white bg-white/10 border border-white/20 rounded-lg px-2 py-1 w-full focus:outline-none focus:border-white/40 disabled:opacity-50"
                  maxLength={50}
                />
                <button
                  onClick={handleSaveEdit}
                  disabled={isRenaming}
                  className="p-1 text-green-400 hover:text-green-300 transition disabled:opacity-50"
                  title="Save"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isRenaming}
                  className="p-1 text-red-400 hover:text-red-300 transition disabled:opacity-50"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h3 className="text-lg font-semibold text-white">{column.name}</h3>
                {onColumnRename && (
                  <button
                    onClick={handleStartEdit}
                    className="opacity-0 group-hover:opacity-100 p-1 text-white/40 hover:text-white/70 transition"
                    title="Rename column"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
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

        <div ref={setNodeRef} className="mt-4 flex flex-1 flex-col gap-3 overflow-y-auto pr-1 min-h-0">
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

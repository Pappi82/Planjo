# Solo Dev Project Manager - Complete Implementation Guide (Part 2)
## Phases 5-12: Task Management, Parking Lot, Vault, Docs, Journal, Vibe Mode, Analytics & Deployment

This is the continuation of the implementation guide. Refer to Part 1 for Phases 1-4.

---

# PHASE 5: Task Management & Kanban Board

## Step 5.1: Install SWR for Data Fetching

```bash
npm install swr
```

## Step 5.2: Create Tasks API Routes

Create `src/app/api/tasks/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import ActivityLog from '@/models/ActivityLog';

// GET all tasks for a project
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const tasks = await Task.find({
      projectId,
      userId: session.user.id,
      parentTaskId: null, // Only get parent tasks
    }).sort({ position: 1 });

    // Get subtasks for each task
    const tasksWithSubtasks = await Promise.all(
      tasks.map(async (task) => {
        const subtasks = await Task.find({
          parentTaskId: task._id,
          userId: session.user.id,
        }).sort({ position: 1 });
        
        return {
          ...task.toObject(),
          subtasks,
        };
      })
    );

    return NextResponse.json({ tasks: tasksWithSubtasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      projectId,
      title,
      description,
      status,
      priority,
      labels,
      dueDate,
      estimatedHours,
      parentTaskId,
    } = body;

    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'Project ID and title are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get the highest position number for this status
    const lastTask = await Task.findOne({
      projectId,
      status: status || 'To Do',
      parentTaskId: parentTaskId || null,
    }).sort({ position: -1 });

    const position = lastTask ? lastTask.position + 1 : 0;

    // Create task
    const task = await Task.create({
      userId: session.user.id,
      projectId,
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'medium',
      labels: labels || [],
      dueDate,
      estimatedHours,
      parentTaskId,
      position,
    });

    // Log activity
    await ActivityLog.create({
      userId: session.user.id,
      date: new Date(),
      actionType: 'task_created',
      projectId,
      taskId: task._id,
      metadata: { taskTitle: title },
      timestamp: new Date(),
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/tasks/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import ActivityLog from '@/models/ActivityLog';

// GET single task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const task = await Task.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get subtasks if this is a parent task
    const subtasks = await Task.find({
      parentTaskId: task._id,
      userId: session.user.id,
    }).sort({ position: 1 });

    return NextResponse.json({
      task: { ...task.toObject(), subtasks },
    });
  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status: newStatus, completedAt } = body;

    await dbConnect();

    const oldTask = await Task.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!oldTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // If status changed, log activity
    if (newStatus && newStatus !== oldTask.status) {
      await ActivityLog.create({
        userId: session.user.id,
        date: new Date(),
        actionType: 'task_moved',
        projectId: oldTask.projectId,
        taskId: oldTask._id,
        metadata: {
          from: oldTask.status,
          to: newStatus,
        },
        timestamp: new Date(),
      });
    }

    // If task completed, log activity
    if (completedAt && !oldTask.completedAt) {
      await ActivityLog.create({
        userId: session.user.id,
        date: new Date(),
        actionType: 'task_completed',
        projectId: oldTask.projectId,
        taskId: oldTask._id,
        metadata: { taskTitle: oldTask.title },
        timestamp: new Date(),
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Delete subtasks first
    await Task.deleteMany({
      parentTaskId: params.id,
      userId: session.user.id,
    });

    // Delete the main task
    const task = await Task.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/tasks/reorder/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';

// POST reorder tasks (for drag & drop)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, newStatus, newPosition } = await request.json();

    await dbConnect();

    const task = await Task.findOne({
      _id: taskId,
      userId: session.user.id,
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task status and position
    task.status = newStatus;
    task.position = newPosition;
    await task.save();

    // Reorder other tasks in the same status
    const tasksInColumn = await Task.find({
      projectId: task.projectId,
      status: newStatus,
      _id: { $ne: taskId },
      parentTaskId: task.parentTaskId,
    }).sort({ position: 1 });

    let position = 0;
    for (const t of tasksInColumn) {
      if (position === newPosition) {
        position++;
      }
      if (t.position !== position) {
        t.position = position;
        await t.save();
      }
      position++;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Step 5.3: Create Columns API Routes

Create `src/app/api/columns/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import KanbanColumn from '@/models/KanbanColumn';

// GET columns for a project
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const columns = await KanbanColumn.find({ projectId }).sort({ position: 1 });

    return NextResponse.json({ columns });
  } catch (error) {
    console.error('Get columns error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new column
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, name, color } = await request.json();

    if (!projectId || !name) {
      return NextResponse.json(
        { error: 'Project ID and name are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get the highest position number
    const lastColumn = await KanbanColumn.findOne({ projectId }).sort({ position: -1 });
    const position = lastColumn ? lastColumn.position + 1 : 0;

    const column = await KanbanColumn.create({
      projectId,
      name,
      color: color || '#6B7280',
      position,
    });

    return NextResponse.json({ column }, { status: 201 });
  } catch (error) {
    console.error('Create column error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/columns/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import KanbanColumn from '@/models/KanbanColumn';
import Task from '@/models/Task';

// PUT update column
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    await dbConnect();

    const oldColumn = await KanbanColumn.findById(params.id);
    if (!oldColumn) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 });
    }

    // If name changed, update all tasks with old column name
    if (body.name && body.name !== oldColumn.name) {
      await Task.updateMany(
        { status: oldColumn.name },
        { $set: { status: body.name } }
      );
    }

    const column = await KanbanColumn.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ column });
  } catch (error) {
    console.error('Update column error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE column
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const column = await KanbanColumn.findById(params.id);
    if (!column) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 });
    }

    // Check if column has tasks
    const tasksCount = await Task.countDocuments({ status: column.name });
    if (tasksCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete column with tasks' },
        { status: 400 }
      );
    }

    await KanbanColumn.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete column error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Step 5.4: Create Task Hook

Create `src/hooks/useTasks.ts`:

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTasks(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `/api/tasks?projectId=${projectId}` : null,
    fetcher
  );

  return {
    tasks: data?.tasks || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useTask(taskId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    taskId ? `/api/tasks/${taskId}` : null,
    fetcher
  );

  return {
    task: data?.task,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useColumns(projectId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    projectId ? `/api/columns?projectId=${projectId}` : null,
    fetcher
  );

  return {
    columns: data?.columns || [],
    isLoading,
    isError: error,
    mutate,
  };
}
```

## Step 5.5: Create Kanban Components

Create `src/components/kanban/KanbanBoard.tsx`:

```typescript
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
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

    // Check if dropped on a column
    const overColumn = columns.find((col) => col._id.toString() === overId);
    
    if (overColumn) {
      const tasksInColumn = tasks.filter((t) => t.status === overColumn.name);
      const newPosition = tasksInColumn.length;
      onTaskMove(taskId, overColumn.name, newPosition);
    }

    setActiveTask(null);
  };

  const getTasksForColumn = (columnName: string) => {
    return tasks.filter((task) => task.status === columnName);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {columns.map((column) => (
          <KanbanColumn
            key={column._id.toString()}
            column={column}
            tasks={getTasksForColumn(column.name)}
            onTaskClick={onTaskClick}
            onTaskCreate={() => onTaskCreate(column.name)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <KanbanCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

Create `src/components/kanban/KanbanColumn.tsx`:

```typescript
'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const { setNodeRef } = useDroppable({
    id: column._id.toString(),
  });

  return (
    <div className="flex-shrink-0 w-80">
      <Card className="h-full flex flex-col">
        <div
          className="p-4 border-b"
          style={{ borderTop: `3px solid ${column.color}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{column.name}</h3>
            <span className="text-sm text-muted-foreground">
              {tasks.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={onTaskCreate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add task
          </Button>
        </div>

        <div
          ref={setNodeRef}
          className="flex-1 p-4 space-y-2 overflow-y-auto"
        >
          <SortableContext
            items={tasks.map((t) => t._id.toString())}
            strategy={verticalListSortingStrategy}
          >
            {tasks.map((task) => (
              <KanbanCard
                key={task._id.toString()}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </SortableContext>
        </div>
      </Card>
    </div>
  );
}
```

Create `src/components/kanban/KanbanCard.tsx`:

```typescript
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
}

export default function KanbanCard({ task, onClick, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task._id.toString() });

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
      className="p-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium line-clamp-2">{task.title}</h4>
          <div
            className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: priorityColor }}
          />
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.slice(0, 2).map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
            {task.labels.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{task.labels.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
```

## Step 5.6: Create Task Components

Create `src/components/tasks/TaskDetail.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ITask } from '@/types';
import { TASK_PRIORITIES } from '@/lib/constants';
import SubtaskList from './SubtaskList';
import { Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TaskDetailProps {
  task: ITask | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, data: any) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onAddSubtask: (parentId: string, title: string) => Promise<void>;
}

export default function TaskDetail({
  task,
  open,
  onClose,
  onUpdate,
  onDelete,
  onAddSubtask,
}: TaskDetailProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const handleEdit = () => {
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatedHours: task.estimatedHours || '',
      actualHours: task.actualHours || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(task._id.toString(), formData);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      try {
        await onDelete(task._id.toString());
        onClose();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkComplete = async () => {
    await onUpdate(task._id.toString(), {
      completedAt: task.completedAt ? null : new Date(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Edit Task' : 'Task Details'}
          </DialogTitle>
        </DialogHeader>

        {!editing ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{task.title}</h2>
              {task.description && (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Priority</Label>
                <Badge variant="secondary" className="mt-1">
                  {task.priority}
                </Badge>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <Badge variant="secondary" className="mt-1">
                  {task.status}
                </Badge>
              </div>
              {task.dueDate && (
                <div>
                  <Label className="text-sm text-muted-foreground">Due Date</Label>
                  <p className="mt-1">{formatDate(task.dueDate)}</p>
                </div>
              )}
              {task.estimatedHours && (
                <div>
                  <Label className="text-sm text-muted-foreground">Estimated</Label>
                  <p className="mt-1">{task.estimatedHours} hours</p>
                </div>
              )}
            </div>

            {(task as any).subtasks && (task as any).subtasks.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground mb-2">Subtasks</Label>
                <SubtaskList
                  subtasks={(task as any).subtasks}
                  onUpdate={(subtaskId, data) => onUpdate(subtaskId, data)}
                  onDelete={(subtaskId) => onDelete(subtaskId)}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleEdit}>Edit</Button>
              <Button
                variant={task.completedAt ? 'secondary' : 'default'}
                onClick={handleMarkComplete}
              >
                {task.completedAt ? 'Mark Incomplete' : 'Mark Complete'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => onAddSubtask(task._id.toString(), 'New subtask')}
              >
                Add Subtask
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                className="ml-auto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actualHours">Actual Hours</Label>
                <Input
                  id="actualHours"
                  type="number"
                  value={formData.actualHours}
                  onChange={(e) =>
                    setFormData({ ...formData, actualHours: parseFloat(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

Create `src/components/tasks/SubtaskList.tsx`:

```typescript
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
          className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
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
```

## Step 5.7: Create Kanban Board Page

Create `src/app/(dashboard)/projects/[id]/board/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTasks, useColumns } from '@/hooks/useTasks';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import TaskDetail from '@/components/tasks/TaskDetail';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ITask } from '@/types';

export default function BoardPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const { tasks, mutate: mutateTasks } = useTasks(projectId);
  const { columns } = useColumns(projectId);
  
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createColumnName, setCreateColumnName] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleTaskMove = async (taskId: string, newStatus: string, newPosition: number) => {
    await fetch('/api/tasks/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, newStatus, newPosition }),
    });
    mutateTasks();
  };

  const handleTaskCreate = (columnName: string) => {
    setCreateColumnName(columnName);
    setCreateDialogOpen(true);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        title: newTaskTitle,
        status: createColumnName,
      }),
    });

    setNewTaskTitle('');
    setCreateDialogOpen(false);
    mutateTasks();
  };

  const handleUpdateTask = async (taskId: string, data: any) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    mutateTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    mutateTasks();
  };

  const handleAddSubtask = async (parentId: string, title: string) => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId,
        title,
        parentTaskId: parentId,
        status: 'To Do',
      }),
    });
    mutateTasks();
  };

  return (
    <div className="h-full p-6">
      <div className="h-full">
        <KanbanBoard
          columns={columns}
          tasks={tasks}
          onTaskMove={handleTaskMove}
          onTaskClick={setSelectedTask}
          onTaskCreate={handleTaskCreate}
        />
      </div>

      <TaskDetail
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onAddSubtask={handleAddSubtask}
      />

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task in {createColumnName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateTask();
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateTask}>Create</Button>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

# PHASE 6: Parking Lot (Idea Backlog)

## Step 6.1: Create Parking Lot API Routes

Create `src/app/api/parking-lot/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ParkingLotItem from '@/models/ParkingLotItem';

// GET all parking lot items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const items = await ParkingLotItem.find({
      userId: session.user.id,
      convertedToTaskId: null,
    })
      .populate('relatedProjectIds', 'title colorTheme')
      .sort({ createdAt: -1 });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get parking lot items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new parking lot item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, relatedProjectIds, tags, priority } =
      await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const item = await ParkingLotItem.create({
      userId: session.user.id,
      title,
      description,
      relatedProjectIds: relatedProjectIds || [],
      tags: tags || [],
      priority: priority || 'medium',
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Create parking lot item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/parking-lot/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ParkingLotItem from '@/models/ParkingLotItem';

// PUT update parking lot item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    await dbConnect();

    const item = await ParkingLotItem.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Update parking lot item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE parking lot item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const item = await ParkingLotItem.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete parking lot item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/parking-lot/[id]/convert/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ParkingLotItem from '@/models/ParkingLotItem';
import Task from '@/models/Task';

// POST convert parking lot item to task
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, status, priority } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const item = await ParkingLotItem.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Get last task position
    const lastTask = await Task.findOne({
      projectId,
      status: status || 'To Do',
    }).sort({ position: -1 });

    const position = lastTask ? lastTask.position + 1 : 0;

    // Create task
    const task = await Task.create({
      userId: session.user.id,
      projectId,
      title: item.title,
      description: item.description,
      status: status || 'To Do',
      priority: priority || item.priority,
      position,
    });

    // Mark item as converted
    item.convertedToTaskId = task._id;
    await item.save();

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Convert parking lot item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Step 6.2: Create Parking Lot Components

Create `src/components/parking-lot/IdeaCard.tsx`:

```typescript
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IParkingLotItem } from '@/types';
import { ArrowRight, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface IdeaCardProps {
  item: IParkingLotItem & { relatedProjectIds: any[] };
  onEdit: (item: IParkingLotItem) => void;
  onDelete: (id: string) => void;
  onConvert: (item: IParkingLotItem) => void;
}

export default function IdeaCard({ item, onEdit, onDelete, onConvert }: IdeaCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription className="mt-1">
              {formatDate(item.createdAt)}
            </CardDescription>
          </div>
          <Badge variant="secondary">{item.priority}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {item.relatedProjectIds.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.relatedProjectIds.map((project: any) => (
                <Badge
                  key={project._id}
                  variant="secondary"
                  className="text-xs"
                  style={{ borderLeft: `3px solid ${project.colorTheme}` }}
                >
                  {project.title}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => onConvert(item)}
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              Convert to Task
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(item._id.toString())}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

Create `src/components/parking-lot/ConvertToTaskDialog.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IParkingLotItem } from '@/types';
import { useProjects } from '@/hooks/useProjects';
import { TASK_PRIORITIES } from '@/lib/constants';

interface ConvertToTaskDialogProps {
  item: IParkingLotItem | null;
  open: boolean;
  onClose: () => void;
  onConvert: (itemId: string, projectId: string, data: any) => Promise<void>;
}

export default function ConvertToTaskDialog({
  item,
  open,
  onClose,
  onConvert,
}: ConvertToTaskDialogProps) {
  const { projects } = useProjects();
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleConvert = async () => {
    if (!projectId) return;

    setLoading(true);
    try {
      await onConvert(item._id.toString(), projectId, { priority });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert to Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{item.title}</h3>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Select Project *</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project._id.toString()} value={project._id.toString()}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={!projectId || loading}>
              {loading ? 'Converting...' : 'Convert to Task'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## Step 6.3: Create Parking Lot Page

Create `src/app/(dashboard)/parking-lot/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import IdeaCard from '@/components/parking-lot/IdeaCard';
import ConvertToTaskDialog from '@/components/parking-lot/ConvertToTaskDialog';
import { IParkingLotItem } from '@/types';
import { Plus, Lightbulb } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ParkingLotPage() {
  const { data, mutate } = useSWR('/api/parking-lot', fetcher);
  const items = data?.items || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [convertItem, setConvertItem] = useState<IParkingLotItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
  });

  const handleCreate = async () => {
    if (!formData.title.trim()) return;

    await fetch('/api/parking-lot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      }),
    });

    setFormData({ title: '', description: '', tags: '' });
    setDialogOpen(false);
    mutate();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return;

    await fetch(`/api/parking-lot/${id}`, { method: 'DELETE' });
    mutate();
  };

  const handleConvert = async (itemId: string, projectId: string, data: any) => {
    await fetch(`/api/parking-lot/${itemId}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, ...data }),
    });
    mutate();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Lightbulb className="h-8 w-8" />
            Parking Lot
          </h1>
          <p className="text-muted-foreground">Capture ideas that aren't ready to be tasks yet</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Idea
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Capture New Idea</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Idea Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What's your idea?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add more details..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="feature, bug, enhancement"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate}>Capture Idea</Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <Lightbulb className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No ideas yet. Start capturing your thoughts!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any) => (
            <IdeaCard
              key={item._id}
              item={item}
              onEdit={() => {}}
              onDelete={handleDelete}
              onConvert={() => setConvertItem(item)}
            />
          ))}
        </div>
      )}

      <ConvertToTaskDialog
        item={convertItem}
        open={!!convertItem}
        onClose={() => setConvertItem(null)}
        onConvert={handleConvert}
      />
    </div>
  );
}
```

---

Due to length constraints, I need to split this into a third file. Would you like me to continue with:
- Phase 7: Secure Vault
- Phase 8: Documentation System
- Phase 9: Code Journal
- Phase 10: Vibe Mode
- Phase 11: Momentum Tracker
- Phase 12: Polish & Deployment

I'll create the final part now with all remaining phases.

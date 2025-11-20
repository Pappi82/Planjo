import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import KanbanColumn from '@/models/KanbanColumn';
import ActivityLog from '@/models/ActivityLog';

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
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Find the new column and update columnId
    const newColumn = await KanbanColumn.findOne({
      projectId: task.projectId,
      name: newStatus,
    });

    if (!newColumn) {
      return NextResponse.json(
        { error: `Column "${newStatus}" not found` },
        { status: 400 }
      );
    }

    // Get all columns for this project to determine the last column
    const allColumns = await KanbanColumn.find({ projectId: task.projectId }).sort({ order: 1 });
    const lastColumn = allColumns[allColumns.length - 1];

    const oldStatus = task.status;
    const isMovingToLastColumn = lastColumn && newColumn._id.toString() === lastColumn._id.toString();
    const isMovingFromLastColumn = lastColumn && task.columnId?.toString() === lastColumn._id.toString();

    // Update task status, columnId, and position
    task.status = newStatus;
    task.columnId = newColumn._id;
    task.position = newPosition;

    // Handle completion status based on column
    if (isMovingToLastColumn && !task.completedAt) {
      // Moving to last column - mark as complete
      task.completedAt = new Date();

      // Log completion activity
      await ActivityLog.create({
        userId: session.user.id,
        type: 'task_completed',
        description: `Completed task: ${task.title}`,
        projectId: task.projectId,
        metadata: {
          taskId: task._id.toString(),
          taskTitle: task.title
        },
      });
    } else if (isMovingFromLastColumn && !isMovingToLastColumn && task.completedAt) {
      // Moving away from last column - mark as incomplete
      task.completedAt = undefined;
    }

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

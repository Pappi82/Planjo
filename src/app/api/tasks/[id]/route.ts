import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import ActivityLog from '@/models/ActivityLog';
import KanbanColumn from '@/models/KanbanColumn';

// GET single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const task = await Task.findOne({
      _id: id,
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get subtasks if this is a parent task
    const subtasks = await Task.find({
      parentTaskId: task._id,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status: newStatus, completedAt } = body;

    await dbConnect();

    const oldTask = await Task.findOne({
      _id: id,
    });

    if (!oldTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // If status changed, update columnId as well
    if (newStatus && newStatus !== oldTask.status) {
      const newColumn = await KanbanColumn.findOne({
        projectId: oldTask.projectId,
        name: newStatus,
      });

      if (!newColumn) {
        return NextResponse.json(
          { error: `Column "${newStatus}" not found for this project` },
          { status: 400 }
        );
      }

      body.columnId = newColumn._id;

      // Log activity
      await ActivityLog.create({
        userId: session.user.id,
        type: 'task_moved',
        description: `Moved task "${oldTask.title}" from ${oldTask.status} to ${newStatus}`,
        projectId: oldTask.projectId,
        metadata: {
          taskId: oldTask._id.toString(),
          from: oldTask.status,
          to: newStatus,
        },
      });
    }

    // If task completed, log activity
    if (completedAt && !oldTask.completedAt) {
      await ActivityLog.create({
        userId: session.user.id,
        type: 'task_completed',
        description: `Completed task: ${oldTask.title}`,
        projectId: oldTask.projectId,
        metadata: {
          taskId: oldTask._id.toString(),
          taskTitle: oldTask.title
        },
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: id },
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error('Update task error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    // Delete subtasks first
    await Task.deleteMany({
      parentTaskId: id,
    });

    // Delete the main task
    const task = await Task.findOneAndDelete({
      _id: id,
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

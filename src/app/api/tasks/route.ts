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

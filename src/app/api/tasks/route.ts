import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import ActivityLog from '@/models/ActivityLog';
import KanbanColumn from '@/models/KanbanColumn';

// GET all tasks for a project or filtered tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const priorityParam = searchParams.get('priority');
    const isCloudTaskParam = searchParams.get('isCloudTask');
    const completedAfter = searchParams.get('completedAfter');
    const completedBefore = searchParams.get('completedBefore');
    const limitParam = searchParams.get('limit');

    await dbConnect();

    // Build query based on parameters
    const query: any = {
      userId: session.user.id,
      archivedAt: null,
    };

    // If projectId is provided, use the original project-specific logic
    if (projectId) {
      console.log('Fetching tasks with:', { projectId, userId: session.user.id });

      // First, let's see all tasks for this project regardless of userId
      const allProjectTasks = await Task.find({ projectId });
      console.log(`Total tasks in project: ${allProjectTasks.length}`);
      if (allProjectTasks.length > 0) {
        console.log('Sample task from DB:', {
          _id: allProjectTasks[0]._id.toString(),
          userId: allProjectTasks[0].userId?.toString(),
          projectId: allProjectTasks[0].projectId?.toString(),
          parentTaskId: allProjectTasks[0].parentTaskId?.toString(),
          title: allProjectTasks[0].title,
        });
      }

      // Query for tasks - exclude archived tasks
      const tasks = await Task.find({
        projectId,
        archivedAt: null,
        $or: [
          { parentTaskId: null },
          { parentTaskId: { $exists: false } }
        ]
      }).sort({ position: 1 });

      console.log(`Query returned ${tasks.length} tasks`);

      // Get subtasks for each task (excluding archived subtasks)
      const tasksWithSubtasks = await Promise.all(
        tasks.map(async (task) => {
          const subtasks = await Task.find({
            parentTaskId: task._id,
            archivedAt: null,
          }).sort({ position: 1 });

          return {
            ...task.toObject(),
            subtasks,
          };
        })
      );

      console.log(`Found ${tasksWithSubtasks.length} tasks for project ${projectId}`);
      if (tasksWithSubtasks.length > 0) {
        console.log('Sample task:', JSON.stringify(tasksWithSubtasks[0], null, 2));
      }

      return NextResponse.json({ tasks: tasksWithSubtasks });
    }

    // Otherwise, use filtered query
    query.$or = [
      { parentTaskId: null },
      { parentTaskId: { $exists: false } }
    ];

    // Filter by priority
    if (priorityParam) {
      const priorities = priorityParam.split(',').map(p => p.trim());
      query.priority = { $in: priorities };
    }

    // Filter by cloud task
    if (isCloudTaskParam === 'true') {
      query.isCloudTask = true;
    }

    // Filter by completion date range
    if (completedAfter || completedBefore) {
      query.completedAt = {};
      if (completedAfter) {
        query.completedAt.$gte = new Date(completedAfter);
      }
      if (completedBefore) {
        query.completedAt.$lt = new Date(completedBefore);
      }
    }

    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    let tasksQuery = Task.find(query).sort({ createdAt: -1 });

    if (limit) {
      tasksQuery = tasksQuery.limit(limit);
    }

    const tasks = await tasksQuery.populate('projectId', 'title colorTheme');

    // Transform to include project data
    const tasksWithProjects = tasks.map(task => ({
      ...task.toObject(),
      project: task.projectId,
    }));

    return NextResponse.json({ tasks: tasksWithProjects });
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

    // Find the column by name and projectId
    const columnName = status || 'To Do';
    const column = await KanbanColumn.findOne({
      projectId,
      name: columnName,
    });

    if (!column) {
      return NextResponse.json(
        { error: `Column "${columnName}" not found for this project` },
        { status: 400 }
      );
    }

    // Get the highest position number for this status
    const lastTask = await Task.findOne({
      projectId,
      columnId: column._id,
      parentTaskId: parentTaskId || null,
    }).sort({ position: -1 });

    const position = lastTask ? lastTask.position + 1 : 0;

    // Create task
    console.log('Creating task with:', {
      userId: session.user.id,
      projectId,
      columnId: column._id.toString(),
      title,
      status: columnName,
    });

    const task = await Task.create({
      userId: session.user.id,
      projectId,
      columnId: column._id,
      title,
      description,
      status: columnName,
      priority: priority || 'medium',
      labels: labels || [],
      dueDate,
      estimatedHours,
      parentTaskId,
      position,
    });

    console.log('Task created successfully:', task._id.toString());

    // Log activity
    await ActivityLog.create({
      userId: session.user.id,
      type: 'task_created',
      description: `Created task: ${title}`,
      projectId,
      metadata: { taskId: task._id.toString(), taskTitle: title },
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

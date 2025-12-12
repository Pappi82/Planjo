import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import KanbanColumn from '@/models/KanbanColumn';
import ActivityLog from '@/models/ActivityLog';
import Task from '@/models/Task';
import { DEFAULT_KANBAN_COLUMNS } from '@/lib/constants';
import { createProjectSchema, validateRequest } from '@/lib/validations';

// GET /api/projects - Get all projects for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const archived = searchParams.get('archived') === 'true';
    const includeStats = searchParams.get('withStats') === 'true';

    const query: any = { userId: session.user.id };
    if (archived) {
      query.archivedAt = { $ne: null };
    } else {
      query.archivedAt = null;
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });

    let stats: any[] | undefined;

    if (includeStats && projects.length > 0) {
      const projectIds = projects.map((project) => project._id);
      const now = new Date();

      const tasks = await Task.find({
        projectId: { $in: projectIds },
        userId: session.user.id,
      }).select('projectId completedAt dueDate');

      const statsMap = new Map<
        string,
        {
          totalTasks: number;
          completedTasks: number;
          upcomingTasks: number;
          overdueTasks: number;
          nextDueDate: Date | null;
        }
      >();

      tasks.forEach((task) => {
        const key = task.projectId.toString();
        if (!statsMap.has(key)) {
          statsMap.set(key, {
            totalTasks: 0,
            completedTasks: 0,
            upcomingTasks: 0,
            overdueTasks: 0,
            nextDueDate: null,
          });
        }

        const entry = statsMap.get(key)!;
        entry.totalTasks += 1;

        if (task.completedAt) {
          entry.completedTasks += 1;
          return;
        }

        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          if (!entry.nextDueDate || dueDate < entry.nextDueDate) {
            entry.nextDueDate = dueDate;
          }

          if (dueDate < now) {
            entry.overdueTasks += 1;
          } else if ((dueDate.getTime() - now.getTime()) / 86400000 <= 7) {
            entry.upcomingTasks += 1;
          }
        }
      });

      stats = projects.map((project) => {
        const key = project._id.toString();
        const entry =
          statsMap.get(key) || {
            totalTasks: 0,
            completedTasks: 0,
            upcomingTasks: 0,
            overdueTasks: 0,
            nextDueDate: null,
          };

        const completionRate =
          entry.totalTasks > 0 ? entry.completedTasks / entry.totalTasks : 0;

        let daysToTarget: number | null = null;
        let scheduleDelta: number | null = null;

        if (project.targetDate) {
          const targetDate = new Date(project.targetDate);
          daysToTarget = Math.ceil(
            (targetDate.getTime() - now.getTime()) / 86400000
          );
        }

        if (project.startDate && project.targetDate) {
          const started = new Date(project.startDate).getTime();
          const target = new Date(project.targetDate).getTime();
          const duration = target - started;
          if (duration > 0) {
            const elapsed = now.getTime() - started;
            const scheduleProgress = Math.min(
              1,
              Math.max(0, elapsed / duration)
            );
            scheduleDelta = completionRate - scheduleProgress;
          }
        }

        return {
          projectId: key,
          totalTasks: entry.totalTasks,
          completedTasks: entry.completedTasks,
          upcomingTasks: entry.upcomingTasks,
          overdueTasks: entry.overdueTasks,
          completionRate,
          daysToTarget,
          nextDueDate: entry.nextDueDate,
          scheduleDelta,
        };
      });
    }

    return NextResponse.json(
      stats ? { projects, stats } : { projects },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validation with Zod
    const validation = validateRequest(createProjectSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { title, description, status, colorTheme, techStack, repoUrl, startDate, targetDate } = validation.data;

    await dbConnect();

    // Create project
    const project = await Project.create({
      userId: session.user.id,
      title,
      description,
      status: status || 'planning',
      colorTheme: colorTheme || '#8B5CF6',
      techStack: techStack || [],
      repoUrl,
      startDate,
      targetDate,
    });

    // Create default Kanban columns for the project
    const columnPromises = DEFAULT_KANBAN_COLUMNS.map((col) =>
      KanbanColumn.create({
        projectId: project._id,
        name: col.name,
        order: col.order,
        color: '#6B7280',
      })
    );

    await Promise.all(columnPromises);

    // Log activity
    await ActivityLog.create({
      userId: session.user.id,
      projectId: project._id,
      type: 'project_created',
      description: `Created project: ${title}`,
      metadata: { projectId: project._id.toString(), projectTitle: title },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

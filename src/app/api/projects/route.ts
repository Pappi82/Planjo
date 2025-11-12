import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import KanbanColumn from '@/models/KanbanColumn';
import ActivityLog from '@/models/ActivityLog';
import { DEFAULT_KANBAN_COLUMNS } from '@/lib/constants';

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

    const query: any = { userId: session.user.id };
    if (archived) {
      query.archivedAt = { $ne: null };
    } else {
      query.archivedAt = null;
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ projects }, { status: 200 });
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
    const { title, description, status, colorTheme, techStack, repoUrl, startDate, targetDate } = body;

    if (!title) {
      return NextResponse.json({ error: 'Project title is required' }, { status: 400 });
    }

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
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    );
  }
}


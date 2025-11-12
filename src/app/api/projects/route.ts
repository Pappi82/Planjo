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

    const projects = await Project.find({
      userId: session.user.id,
      archived,
    }).sort({ createdAt: -1 });

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
    const { name, description, status, color, techStack, startDate, endDate } = body;

    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    await dbConnect();

    // Create project
    const project = await Project.create({
      userId: session.user.id,
      name,
      description,
      status: status || 'planning',
      color: color || '#3b82f6',
      techStack: techStack || [],
      startDate,
      endDate,
      archived: false,
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
      description: `Created project: ${name}`,
      metadata: { projectId: project._id.toString(), projectName: name },
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


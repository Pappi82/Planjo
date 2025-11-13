import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import Task from '@/models/Task';

// GET /api/projects/[id] - Get a single project
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const project = await Project.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error: any) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, status, colorTheme, techStack, repoUrl, startDate, targetDate, archivedAt } = body;

    await dbConnect();

    const project = await Project.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(colorTheme !== undefined && { colorTheme }),
        ...(techStack !== undefined && { techStack }),
        ...(repoUrl !== undefined && { repoUrl }),
        ...(startDate !== undefined && { startDate }),
        ...(targetDate !== undefined && { targetDate }),
        ...(archivedAt !== undefined && { archivedAt }),
      },
      { new: true, runValidators: true }
    );

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Archive a project (soft delete)
export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const project = await Project.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { archivedAt: new Date() },
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Archive all tasks belonging to this project
    const archiveDate = new Date();
    await Task.updateMany(
      { projectId: params.id },
      { archivedAt: archiveDate }
    );

    return NextResponse.json({ message: 'Project archived successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Archive project error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to archive project' },
      { status: 500 }
    );
  }
}


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

    // Get the highest order number
    const lastColumn = await KanbanColumn.findOne({ projectId }).sort({ order: -1 });
    const order = lastColumn ? lastColumn.order + 1 : 0;

    const column = await KanbanColumn.create({
      projectId,
      name,
      color: color || '#6B7280',
      order,
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

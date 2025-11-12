import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import KanbanColumn from '@/models/KanbanColumn';
import Task from '@/models/Task';

// PUT update column
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

    await dbConnect();

    const oldColumn = await KanbanColumn.findById(id);
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
      id,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const column = await KanbanColumn.findById(id);
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

    await KanbanColumn.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete column error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

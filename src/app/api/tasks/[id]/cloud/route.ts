import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';

// PATCH toggle cloud status
export async function PATCH(
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
    const { isCloudTask } = body;

    if (typeof isCloudTask !== 'boolean') {
      return NextResponse.json(
        { error: 'isCloudTask must be a boolean' },
        { status: 400 }
      );
    }

    await dbConnect();

    const task = await Task.findOneAndUpdate(
      { _id: id },
      { $set: { isCloudTask } },
      { new: true, runValidators: true }
    );

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error: any) {
    console.error('Toggle cloud task error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

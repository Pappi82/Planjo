import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ParkingLotItem from '@/models/ParkingLotItem';
import Task from '@/models/Task';

// POST convert parking lot item to task
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { projectId, status, priority } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const item = await ParkingLotItem.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Get last task position
    const lastTask = await Task.findOne({
      projectId,
      status: status || 'To Do',
    }).sort({ position: -1 });

    const position = lastTask ? lastTask.position + 1 : 0;

    // Create task
    const task = await Task.create({
      userId: session.user.id,
      projectId,
      title: item.title,
      description: item.description,
      status: status || 'To Do',
      priority: priority || item.priority,
      position,
    });

    // Mark item as converted
    item.convertedToTaskId = task._id;
    await item.save();

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Convert parking lot item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

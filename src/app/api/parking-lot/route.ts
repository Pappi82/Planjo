import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ParkingLotItem from '@/models/ParkingLotItem';

// GET all parking lot items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const items = await ParkingLotItem.find({
      userId: session.user.id,
      convertedToTaskId: null,
    })
      .populate('relatedProjectIds', 'title colorTheme')
      .sort({ createdAt: -1 });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get parking lot items error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new parking lot item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, relatedProjectIds, tags, priority } =
      await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const item = await ParkingLotItem.create({
      userId: session.user.id,
      title,
      description,
      relatedProjectIds: relatedProjectIds || [],
      tags: tags || [],
      priority: priority || 'medium',
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Create parking lot item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

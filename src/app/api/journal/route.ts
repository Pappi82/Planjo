import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import JournalEntry from '@/models/JournalEntry';
import ActivityLog from '@/models/ActivityLog';

// GET journal entries
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await dbConnect();

    let query: any = { userId: session.user.id };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const entries = await JournalEntry.find(query).sort({ date: -1 });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Get journal entries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create or update journal entry (upsert)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date, content, mood, relatedProjectIds, relatedTaskIds } =
      await request.json();

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Upsert: update if exists, create if not
    const entry = await JournalEntry.findOneAndUpdate(
      {
        userId: session.user.id,
        date: new Date(date),
      },
      {
        $set: {
          content: content || '',
          mood,
          relatedProjectIds: relatedProjectIds || [],
          relatedTaskIds: relatedTaskIds || [],
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Log activity
    await ActivityLog.create({
      userId: session.user.id,
      type: 'journal_entry',
      description: `Journal entry for ${new Date(date).toLocaleDateString()}`,
      metadata: {
        entryId: entry._id.toString(),
        date: new Date(date).toLocaleDateString()
      },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Create/update journal entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

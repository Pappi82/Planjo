import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '6', 10), 25);
    const dateParam = searchParams.get('date');

    await dbConnect();

    // Build query
    const query: any = {
      userId: session.user.id,
    };

    // If date is provided, filter for activities on that day
    if (dateParam) {
      const startDate = new Date(dateParam);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const activities = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(dateParam ? 1000 : limit) // No limit when filtering by date
      .lean();

    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    console.error('Get activity error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

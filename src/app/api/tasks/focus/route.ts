import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import Project from '@/models/Project';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '5', 10), 12);

    await dbConnect();

    // Get all non-archived projects for this user
    const activeProjects = await Project.find({
      userId: session.user.id,
      archivedAt: null,
    }).select('_id').lean();

    const activeProjectIds = activeProjects.map((p) => p._id);

    // Get tasks that:
    // 1. Belong to the user
    // 2. Are not completed
    // 3. Are not archived
    // 4. Belong to active (non-archived) projects
    // 5. Are not subtasks (parentTaskId is null or doesn't exist)
    const tasks = await Task.find({
      userId: session.user.id,
      completedAt: null,
      archivedAt: null,
      projectId: { $in: activeProjectIds },
      $or: [{ parentTaskId: null }, { parentTaskId: { $exists: false } }],
    })
      .select('title priority dueDate projectId _id')
      .lean();

    const sorted = tasks
      .sort((a: any, b: any) => {
        const priorityOrder: Record<string, number> = {
          urgent: 3,
          high: 2,
          medium: 1,
          low: 0,
        };
        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        if (aDue !== bDue) {
          return aDue - bDue;
        }
        const aPriority = priorityOrder[a.priority] ?? 0;
        const bPriority = priorityOrder[b.priority] ?? 0;
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        return 0;
      })
      .slice(0, limit);

    return NextResponse.json({ tasks: sorted }, { status: 200 });
  } catch (error) {
    console.error('Get focus tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import KanbanColumn from '@/models/KanbanColumn';

// POST - Add "Version 2" column to all projects that don't have it
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all projects for the user
    const projects = await Project.find({ userId: session.user.id });

    let addedCount = 0;
    let skippedCount = 0;

    for (const project of projects) {
      // Check if "Version 2" column already exists for this project
      const existingColumn = await KanbanColumn.findOne({
        projectId: project._id,
        name: 'Version 2',
      });

      if (existingColumn) {
        skippedCount++;
        continue;
      }

      // Get the highest order number for this project's columns
      const lastColumn = await KanbanColumn.findOne({ projectId: project._id }).sort({ order: -1 });
      const newOrder = lastColumn ? lastColumn.order + 1 : 4;

      // Create the "Version 2" column
      await KanbanColumn.create({
        projectId: project._id,
        name: 'Version 2',
        order: newOrder,
        color: '#6B7280',
      });

      addedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Added "Version 2" column to ${addedCount} projects. Skipped ${skippedCount} projects (already had the column).`,
      addedCount,
      skippedCount,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Document from '@/models/Document';
import ActivityLog from '@/models/ActivityLog';

// GET all documents for a project
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    let query: any = {
      projectId,
      userId: session.user.id,
    };

    // Full-text search if search query provided
    if (search) {
      query.$text = { $search: search };
    }

    const documents = await Document.find(query).sort({ updatedAt: -1 });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new document
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, title, content, category, tags } = await request.json();

    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    await dbConnect();

    const document = await Document.create({
      userId: session.user.id,
      projectId,
      title,
      content: content || '',
      category,
      tags: tags || [],
    });

    // Log activity
    await ActivityLog.create({
      userId: session.user.id,
      projectId,
      type: 'doc_created',
      description: `Created document: ${title}`,
      metadata: {
        documentId: document._id.toString(),
        title
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Create document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

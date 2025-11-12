import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Credential from '@/models/Credential';

// GET all credentials for a project
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

    const credentials = await Credential.find({
      projectId,
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ credentials });
  } catch (error) {
    console.error('Get credentials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new credential
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, category, label, encryptedValue, url, notes } =
      await request.json();

    if (!projectId || !label || !encryptedValue || !category) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    await dbConnect();

    const credential = await Credential.create({
      userId: session.user.id,
      projectId,
      category,
      label,
      encryptedValue, // Already encrypted on client-side
      url,
      notes,
    });

    return NextResponse.json({ credential }, { status: 201 });
  } catch (error) {
    console.error('Create credential error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import VaultFile from '@/models/VaultFile';
import { encrypt } from '@/lib/encryption';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT update vault file
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { filename, content, mimeType, notes } = await request.json();

    if (!filename || !content) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Encrypt the content
    const encryptedContent = encrypt(content);
    const size = new Blob([content]).size;

    const file = await VaultFile.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        filename,
        encryptedContent,
        mimeType,
        size,
        notes,
      },
      { new: true }
    );

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ file });
  } catch (error) {
    console.error('Update vault file error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE vault file
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();

    const file = await VaultFile.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete vault file error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

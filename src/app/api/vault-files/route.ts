import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import VaultFile from '@/models/VaultFile';
import { encrypt, decrypt } from '@/lib/encryption';
import { createVaultFileSchema, validateRequest } from '@/lib/validations';

// GET all vault files for a project
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

    const files = await VaultFile.find({
      projectId,
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    // Decrypt content on the server before sending to client
    const decryptedFiles = files.map((file) => ({
      ...file.toObject(),
      decryptedContent: decrypt(file.encryptedContent),
    }));

    return NextResponse.json({ files: decryptedFiles });
  } catch (error) {
    console.error('Get vault files error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new vault file
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validation with Zod
    const validation = validateRequest(createVaultFileSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { projectId, filename, content, mimeType, notes } = validation.data;

    await dbConnect();

    // Encrypt the content on the server-side
    const encryptedContent = encrypt(content);
    const size = new Blob([content]).size;

    const file = await VaultFile.create({
      userId: session.user.id,
      projectId,
      filename,
      encryptedContent,
      mimeType,
      size,
      notes,
    });

    return NextResponse.json({ file }, { status: 201 });
  } catch (error) {
    console.error('Create vault file error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

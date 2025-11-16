import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Credential from '@/models/Credential';
import { encrypt, decrypt } from '@/lib/encryption';

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

    // Decrypt values on the server before sending to client
    const decryptedCredentials = credentials.map((cred) => ({
      ...cred.toObject(),
      decryptedValue: decrypt(cred.encryptedValue),
    }));

    return NextResponse.json({ credentials: decryptedCredentials });
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

    const { projectId, category, label, value, url, notes, filename, mimeType, size } =
      await request.json();

    if (!projectId || !label || !value || !category) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Encrypt the value on the server-side
    const encryptedValue = encrypt(value);

    const credentialData: any = {
      userId: session.user.id,
      projectId,
      category,
      label,
      encryptedValue,
      notes,
    };

    // Add category-specific fields
    if (category === 'files') {
      credentialData.filename = filename;
      credentialData.mimeType = mimeType;
      credentialData.size = size;
    } else {
      credentialData.url = url;
    }

    const credential = await Credential.create(credentialData);

    return NextResponse.json({ credential }, { status: 201 });
  } catch (error) {
    console.error('Create credential error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Prompt from '@/models/Prompt';

// GET all prompts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const prompts = await Prompt.find({
      userId: session.user.id,
    }).sort({ isFavorite: -1, createdAt: -1 });

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Get prompts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new prompt
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, category, tags, isFavorite } =
      await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const prompt = await Prompt.create({
      userId: session.user.id,
      title,
      content,
      category: category || '',
      tags: tags || [],
      isFavorite: isFavorite || false,
    });

    return NextResponse.json({ prompt }, { status: 201 });
  } catch (error) {
    console.error('Create prompt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

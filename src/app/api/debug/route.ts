import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envVars: {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'not set',
      MONGODB_URI: !!process.env.MONGODB_URI,
      ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
    },
    session: null as any,
    error: null as any,
  };

  try {
    const session = await getServerSession(authOptions);
    diagnostics.session = session ? {
      hasUser: !!session.user,
      userEmail: session.user?.email || 'no email',
    } : 'No session';
  } catch (error) {
    diagnostics.error = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack',
    };
  }

  return NextResponse.json(diagnostics, { status: 200 });
}


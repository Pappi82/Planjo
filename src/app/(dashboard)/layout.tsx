import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Check if required env vars are present
    if (!process.env.NEXTAUTH_SECRET) {
      console.error('[DashboardLayout] NEXTAUTH_SECRET is missing');
      throw new Error('NEXTAUTH_SECRET environment variable is not set');
    }

    if (!process.env.MONGODB_URI) {
      console.error('[DashboardLayout] MONGODB_URI is missing');
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('[DashboardLayout] Environment variables present');
    console.log('[DashboardLayout] Attempting to get session');

    const session = await getServerSession(authOptions);

    console.log('[DashboardLayout] Session result:', session ? 'Found' : 'Not found');

    if (!session) {
      console.log('[DashboardLayout] No session, redirecting to login');
      redirect('/login');
    }

    console.log('[DashboardLayout] Rendering dashboard for user:', session.user?.email);

    return (
      <div className="planjo-shell">
        <aside className="w-[320px] flex-shrink-0">
          <Sidebar />
        </aside>
        <main className="relative flex-1">
          <div className="planjo-grid" aria-hidden />
          <div className="relative z-10 flex h-screen flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error('[DashboardLayout] Error occurred:', error);
    console.error('[DashboardLayout] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[DashboardLayout] Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('[DashboardLayout] Error stack:', error instanceof Error ? error.stack : 'No stack');

    // Re-throw to let Next.js handle it
    throw error;
  }
}

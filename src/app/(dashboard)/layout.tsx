import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;

  try {
    console.log('[DashboardLayout] Starting layout render');
    console.log('[DashboardLayout] Getting server session');
    session = await getServerSession(authOptions);
    console.log('[DashboardLayout] Session retrieved:', !!session);
  } catch (error) {
    console.error('[DashboardLayout] Error getting session:', error);
    console.error('[DashboardLayout] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    // If there's an error getting the session, redirect to login
    redirect('/login');
  }

  if (!session) {
    console.log('[DashboardLayout] No session, redirecting to login');
    redirect('/login');
  }

  console.log('[DashboardLayout] Rendering dashboard layout');
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
}

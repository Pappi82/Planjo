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
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

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

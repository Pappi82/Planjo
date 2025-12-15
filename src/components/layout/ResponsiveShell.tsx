'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { MobileTaskView } from '@/components/layout/MobileTaskView';

interface ResponsiveShellProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function ResponsiveShell({ sidebar, children }: ResponsiveShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile view - only show MobileTaskView */}
      <div className="lg:hidden">
        <MobileTaskView />
      </div>

      {/* Desktop view - show full dashboard */}
      <div className="hidden lg:block relative min-h-screen bg-[#02030a] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[rgba(108,111,247,0.18)] blur-[160px]" />
          <div className="absolute -bottom-32 right-8 h-[360px] w-[360px] rounded-full bg-[rgba(56,248,199,0.16)] blur-[160px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,255,0.08),_transparent_65%)] opacity-70" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-row">
          <aside className="flex w-[320px] flex-shrink-0">
            {sidebar}
          </aside>

          <main className="relative flex-1">
            <div className="planjo-grid" aria-hidden />
            <div className="relative z-10 min-h-screen px-8">
              {children}
            </div>
          </main>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="left"
            title="Navigation"
            className="w-[300px] border-white/10 bg-[#05060f]/95 p-0 text-white"
          >
            <div className="border-b border-white/10 px-6 py-5">
              <Link href="/" className="flex items-center gap-3 text-white" onClick={() => setOpen(false)}>
                <div className="h-8 w-8 rounded-full border border-white/20 bg-white/10" />
                <span className="text-lg font-semibold">Planjo</span>
              </Link>
            </div>
            <div className="px-4 py-4" onClick={() => setOpen(false)}>
              {sidebar}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}


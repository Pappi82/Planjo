'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  FolderKanban,
  Lightbulb,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePlanjoSound } from '@/components/providers/PlanjoExperienceProvider';

const navigation = [
  { name: 'Command Deck', href: '/', icon: LayoutDashboard, hint: 'Overview' },
  { name: 'Projects', href: '/projects', icon: FolderKanban, hint: 'Boards & docs' },
  { name: 'Parking Lot', href: '/parking-lot', icon: Lightbulb, hint: 'Idea stash' },
  { name: 'Journal', href: '/journal', icon: BookOpen, hint: 'Daily log' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, hint: 'Momentum' },
];

const bottomNavigation = [{ name: 'Settings', href: '/settings', icon: Settings }];

export function Sidebar() {
  const pathname = usePathname();
  const { play } = usePlanjoSound();

  const handleSignOut = () => {
    play('action');
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="planjo-panel m-4 flex h-[calc(100vh-2rem)] flex-col border border-white/10 bg-sidebar/80 px-0 py-0 backdrop-blur-2xl">
      <div className="border-b border-white/5 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="planjo-pill text-[0.6rem] text-white/70">Planjo</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Flow Console</h1>
            <p className="text-sm text-white/50">Stay in an addictive shipping loop</p>
          </div>
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
            <SparklesIcon />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-white/60">
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
            <p className="uppercase tracking-[0.3em] text-[0.55rem] text-white/50">Streak</p>
            <p className="mt-2 text-2xl font-semibold text-white">04</p>
            <p className="text-[0.7rem] text-white/50">days alive</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
            <p className="uppercase tracking-[0.3em] text-[0.55rem] text-white/50">Energy</p>
            <p className="mt-2 text-2xl font-semibold text-[#38f8c7]">Calm</p>
            <p className="text-[0.7rem] text-white/50">no overload</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/40">Navigation</p>
        <div className="mt-3 space-y-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => play('nav')}
                className={cn(
                  'group flex items-center justify-between rounded-2xl border px-4 py-3 transition-all',
                  isActive
                    ? 'border-white/30 bg-white/10 text-white shadow-[0_12px_30px_rgba(0,0,0,0.4)]'
                    : 'border-white/5 bg-white/0 text-white/60 hover:border-white/20 hover:bg-white/5 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-[#8c6ff7]' : 'text-white/60 group-hover:text-white'
                    )}
                  />
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <span className="text-xs text-white/40">{item.hint}</span>
                  </div>
                </div>
                <div
                  className={cn(
                    'h-2 w-2 rounded-full transition',
                    isActive ? 'bg-[#38f8c7]' : 'bg-white/20 group-hover:bg-white/40'
                  )}
                />
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/5 px-4 py-4">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => play('nav')}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                isActive
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/5 text-white/60 hover:border-white/20 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
        <Button variant="ghost" className="mt-3 w-full justify-center text-white" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 2l1.45 4.45L18 8l-4.55 1.55L12 14l-1.45-4.45L6 8l4.55-1.55L12 2z" />
      <path
        d="M6 15l.8 2.2L9 18l-2.2.8L6 21l-.8-2.2L3 18l2.2-.8L6 15z"
        opacity={0.7}
      />
      <path
        d="M17 14l.6 1.6L19 16l-1.4.5L17 18l-.6-1.5L15 16l1.4-.4L17 14z"
        opacity={0.5}
      />
    </svg>
  );
}

'use client';

import { useId } from 'react';
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
  Wrench,
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
  { name: 'Tools', href: '/tools', icon: Wrench, hint: 'Vibe stack' },
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
        <div className="flex items-center justify-center">
          <PlanjoLogo />
        </div>
        <p className="mt-4 text-center text-xs uppercase tracking-[0.25em] text-white/40">
          Flow OS
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-2">
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
                  <p className="text-sm font-semibold">{item.name}</p>
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

function PlanjoLogo() {
  const gradientId = `${useId()}-planjo`;
  const orbitId = `${gradientId}-orbit`;

  return (
    <Link href="/" className="group/logo flex items-center gap-3 text-white" aria-label="Back to dashboard">
      <div className="relative">
        <svg className="h-16 w-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id={gradientId} cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#38f8c7" />
              <stop offset="50%" stopColor="#6f9eff" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </radialGradient>
            <linearGradient id={orbitId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff5c87" />
              <stop offset="100%" stopColor="#38f8c7" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="26" fill={`url(#${gradientId})`} opacity="0.2" />
          <path
            d="M14 34C18 20 30 14 42 18C53 22 53 34 46 42C39 50 26 52 18 44"
            stroke={`url(#${gradientId})`}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M18 22C24 16 34 15 42 21C49 27 49 37 44 43"
            stroke={`url(#${orbitId})`}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />
          <circle cx="45" cy="20" r="3" fill="#ff5c87" />
          <circle cx="20" cy="44" r="2.5" fill="#38f8c7" />
        </svg>
        <span className="absolute inset-0 animate-ping rounded-full bg-white/5 opacity-0 transition group-hover/logo:opacity-100" aria-hidden />
      </div>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">Planjo</h1>
        <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
          Momentum ops
        </p>
      </div>
    </Link>
  );
}

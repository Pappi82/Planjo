'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FolderKanban,
  Lightbulb,
  BookOpen,
  BarChart3,
  Plus,
  Focus,
  Activity,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useProjects } from '@/hooks/useProjects';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { usePlanjoSound } from '@/components/providers/PlanjoExperienceProvider';

export default function DashboardPage() {
  console.log('[DashboardPage] Rendering dashboard page');

  const { data: session } = useSession();
  const { projects, isLoading } = useProjects();
  const { play } = usePlanjoSound();

  console.log('[DashboardPage] Session:', !!session, 'Projects:', projects?.length, 'Loading:', isLoading);

  const activeProjects = projects.filter((p) => p.status === 'active');
  const focusScore = Math.min(
    100,
    Math.round(((activeProjects.length || 1) / Math.max(projects.length, 1)) * 82)
  );

  const quickActions = [
    { label: 'Create project', href: '/projects', icon: FolderKanban },
    { label: 'Add idea', href: '/parking-lot', icon: Lightbulb },
    { label: 'Log journal', href: '/journal', icon: BookOpen },
    { label: 'Momentum', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      <section className="planjo-panel relative overflow-hidden p-8">
        <div className="absolute inset-0 opacity-30">
          <div className="planjo-grid" />
        </div>
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="planjo-pill inline-flex items-center gap-2 text-white/70">
              <Activity className="h-4 w-4" />
              Pulse briefing
            </p>
            <div>
              <h1 className="text-4xl font-semibold text-white">
                Welcome back, {session?.user?.name || 'maker'}
              </h1>
              <p className="mt-2 text-white/60">
                Here&rsquo;s the current Planjo rhythm. Tap a lever and keep the loop alive.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/projects" onClick={() => play('action')}>
                  <Plus className="h-4 w-4" />
                  Launch project
                </Link>
              </Button>
              <Button variant="outline" disabled className="cursor-not-allowed opacity-60">
                <Focus className="h-4 w-4" />
                Vibe mode
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Projects</p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {isLoading ? '—' : projects.length.toString().padStart(2, '0')}
                </p>
                <p className="text-sm text-white/50">Total initiatives</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Active</p>
                <p className="mt-3 text-3xl font-semibold text-[#38f8c7]">
                  {isLoading ? '—' : activeProjects.length.toString().padStart(2, '0')}
                </p>
                <p className="text-sm text-white/50">In motion</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Focus score</p>
                <p className="mt-3 text-3xl font-semibold text-[#8c6ff7]">
                  {focusScore}%
                </p>
                <p className="text-sm text-white/50">Context clarity</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Flow fuel</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Momentum dial</h3>
              </div>
              <Badge variant="secondary" className="text-[0.6rem]">
                Stable
              </Badge>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Weekly cadence</span>
                  <span>72%</span>
                </div>
                <Progress value={72} className="mt-2" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Focus retention</span>
                  <span>{focusScore}%</span>
                </div>
                <Progress value={focusScore} className="mt-2" />
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-white/70">
                Your streak is ready to extend. Start with a kinetic win—ship a ticket or log an insight.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-0">
          <CardHeader className="px-6 pt-6">
            <CardTitle className="flex items-center gap-2 text-white">
              <FolderKanban className="h-5 w-5 text-[#8c6ff7]" />
              Quick actions
            </CardTitle>
            <CardDescription className="text-white/60">
              Jump into the scenes you care about
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid gap-3 lg:grid-cols-2">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} onClick={() => play('action')}>
                  <div className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white">
                    <div className="flex items-center gap-3">
                      <action.icon className="h-4 w-4" />
                      <span className="font-semibold">{action.label}</span>
                    </div>
                    <Plus className="h-4 w-4 opacity-60 group-hover:opacity-100" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="p-0">
          <CardHeader className="px-6 pt-6">
            <CardTitle className="flex items-center gap-2 text-white">
              <Flame className="h-5 w-5 text-[#ff5c87]" />
              Recent activity
            </CardTitle>
            <CardDescription className="text-white/60">
              Signals from the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center text-white/60">
              Activity will populate as you start creating tasks, logging notes, and pushing work across Planjo.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

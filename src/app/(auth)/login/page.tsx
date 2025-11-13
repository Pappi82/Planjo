'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02030a] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[rgba(108,111,247,0.25)] blur-[180px]" />
        <div className="absolute -bottom-40 -left-32 h-[460px] w-[460px] rounded-full bg-[rgba(56,248,199,0.18)] blur-[200px]" />
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-[rgba(255,92,135,0.25)] blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,255,0.12),_transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_55%),repeating-linear-gradient(0deg,rgba(255,255,255,0.015)_0px,rgba(255,255,255,0.015)_2px,transparent_2px,transparent_4px)] opacity-40" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <div className="flex flex-1 flex-col justify-between gap-10 px-8 py-10 lg:px-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/60">
              <span>Planjo</span>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <span>Flow OS</span>
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Reboot your day inside a neon mission control.
              </h1>
              <p className="max-w-xl text-sm text-white/65 md:text-base">
                Planjo unifies projects, focus rituals, journals, and analytics into one luminous cockpit.
                Power through deep work sessions with streaks, vibes, and velocity at your fingertips.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: 'Momentum heatmaps', subtitle: 'See your output pulse in real time.' },
                { title: 'Idea backlog', subtitle: 'Capture sparks & orbit them into tasks.' },
                { title: 'Encrypted vault', subtitle: 'Keep credentials secure yet close.' },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[20px] border border-white/12 bg-white/5 px-4 py-3 shadow-[0_18px_40px_rgba(2,6,23,0.35)]"
                >
                  <p className="text-xs uppercase tracking-[0.35em] text-white/50">{feature.title}</p>
                  <p className="mt-2 text-sm text-white/70">{feature.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#38f8c7]" />
              <span>Encrypted sync</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#8c6ff7]" />
              <span>Built for solo makers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ff5c87]" />
              <span>No browser noise, just flow</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md space-y-6 rounded-[28px] border border-white/12 bg-slate-950/80 p-8 shadow-[0_30px_80px_rgba(2,6,23,0.65)] backdrop-blur-3xl">
            <header className="space-y-3 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Welcome back</p>
              <h2 className="text-2xl font-semibold">Sign in to continue</h2>
              <p className="text-sm text-white/60">
                Access your mission dashboard, streaks, and idea constellation.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error ? (
                <div className="rounded-[18px] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="rounded-xl border-white/15 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-[#59caff]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="rounded-xl border-white/15 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-[#59caff]"
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full bg-gradient-to-r from-[#8c6ff7] via-[#6f9eff] to-[#38f8c7] text-black shadow-[0_18px_36px_rgba(93,112,255,0.45)]"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Enter mission control'}
              </Button>
            </form>

            <div className="space-y-4 text-sm text-white/60">
              <p className="text-center">
                Need an account?{' '}
                <Link href="/register" className="text-white hover:underline">
                  Request access
                </Link>
              </p>
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
                <span>Support</span>
                <span>•</span>
                <span>Privacy</span>
                <span>•</span>
                <span>Status</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

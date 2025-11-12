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
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1fr,520px]">
      <div className="hidden bg-gradient-to-br from-[#120b35] via-[#05060f] to-[#021016] lg:flex lg:flex-col lg:justify-between p-10 text-white">
        <div>
          <p className="planjo-pill text-white/70">Planjo</p>
          <h1 className="mt-6 text-4xl font-semibold">Build in an addictive flow state.</h1>
          <p className="mt-4 text-white/70">
            Planjo keeps your projects, journal, ideas, and analytics in sync so you can keep shipping.
          </p>
        </div>
        <div className="text-sm text-white/60">Encrypted. Flexible. Built for solo makers.</div>
      </div>

      <div className="flex items-center justify-center bg-[#05060f] p-8">
        <Card className="w-full max-w-md border-white/10 bg-white/5 text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
            <CardDescription className="text-white/60">
              Enter your credentials to access Planjo
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
              <p className="text-sm text-center text-white/60">
                Need an account?{' '}
                <Link href="/register" className="text-white">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

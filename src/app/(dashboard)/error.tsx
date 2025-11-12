'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error Boundary] Error caught:', error);
    console.error('[Dashboard Error Boundary] Error message:', error.message);
    console.error('[Dashboard Error Boundary] Error stack:', error.stack);
    console.error('[Dashboard Error Boundary] Error digest:', error.digest);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#02030a] text-white">
      <div className="max-w-md space-y-4 text-center">
        <h2 className="text-2xl font-bold">Dashboard Error</h2>
        <p className="text-white/60">{error.message}</p>
        {error.digest && (
          <p className="text-sm text-white/40">Error ID: {error.digest}</p>
        )}
        <div className="space-x-2">
          <button
            onClick={reset}
            className="rounded-lg bg-purple-600 px-4 py-2 hover:bg-purple-700"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-block rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}


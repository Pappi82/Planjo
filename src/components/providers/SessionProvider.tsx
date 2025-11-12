'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  console.log('[SessionProvider] Rendering session provider');
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}


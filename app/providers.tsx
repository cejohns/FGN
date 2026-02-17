'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../src/lib/auth';

export default function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

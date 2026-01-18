'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useThemeMode } from '../settings/ThemeRegistry';

export default function ClerkThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedMode } = useThemeMode();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedMode === 'dark' ? dark : undefined,
      }}
    >
      {children}
    </ClerkProvider>
  );
}

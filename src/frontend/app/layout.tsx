import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeRegistry } from '@/components/settings';
import { ClerkThemeProvider } from '@/components/auth';
import { InstallPrompt } from '@/components/pwa';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bookmark Manager',
  description: 'Organize and manage your bookmarks efficiently',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icons/icon-192x192.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bookmarks',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeRegistry>
            <ClerkThemeProvider>
              {children}
              <InstallPrompt />
            </ClerkThemeProvider>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

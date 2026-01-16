import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import ThemeRegistry from '@/components/ThemeRegistry';
import ClerkThemeProvider from '@/components/ClerkThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bookmark Manager',
  description: 'Organize and manage your bookmarks efficiently',
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
            <ClerkThemeProvider>{children}</ClerkThemeProvider>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

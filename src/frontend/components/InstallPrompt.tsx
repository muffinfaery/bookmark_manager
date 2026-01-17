'use client';

import { useState, useEffect, useCallback } from 'react';
import { Snackbar, Button, IconButton } from '@mui/material';
import { Close, GetApp } from '@mui/icons-material';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION_DAYS = 7;

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already dismissed recently
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < DISMISS_DURATION_DAYS) {
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay to not interrupt initial load
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
  }, []);

  if (!showPrompt) return null;

  return (
    <>
      {/* Desktop: top right */}
      <Snackbar
        open={showPrompt}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        message="Install Bookmarks for quick access"
        action={
          <>
            <Button
              size="small"
              startIcon={<GetApp />}
              onClick={handleInstall}
              sx={{ fontWeight: 600, color: 'white' }}
            >
              Install
            </Button>
            <IconButton size="small" color="inherit" onClick={handleDismiss}>
              <Close fontSize="small" />
            </IconButton>
          </>
        }
        sx={{
          display: { xs: 'none', md: 'flex' },
          '&.MuiSnackbar-root': {
            top: 80,
          },
          '& .MuiSnackbarContent-root': {
            flexWrap: 'nowrap',
            bgcolor: 'secondary.main',
            color: 'white',
          },
        }}
      />
      {/* Mobile: bottom above nav bar */}
      <Snackbar
        open={showPrompt}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="Install Bookmarks for quick access"
        action={
          <>
            <Button
              size="small"
              startIcon={<GetApp />}
              onClick={handleInstall}
              sx={{ fontWeight: 600, color: 'white' }}
            >
              Install
            </Button>
            <IconButton size="small" color="inherit" onClick={handleDismiss}>
              <Close fontSize="small" />
            </IconButton>
          </>
        }
        sx={{
          display: { xs: 'flex', md: 'none' },
          '&.MuiSnackbar-root': {
            bottom: 80,
          },
          '& .MuiSnackbarContent-root': {
            flexWrap: 'nowrap',
            bgcolor: 'secondary.main',
            color: 'white',
          },
        }}
      />
    </>
  );
}

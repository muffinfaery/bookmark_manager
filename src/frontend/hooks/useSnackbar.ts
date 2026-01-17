'use client';

/**
 * Hook for managing snackbar/toast notification state
 * Reusable across components
 */

import { useState, useCallback } from 'react';

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export interface UseSnackbarReturn {
  snackbar: SnackbarState;
  showSnackbar: (message: string, severity?: SnackbarState['severity']) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  hideSnackbar: () => void;
}

const initialState: SnackbarState = {
  open: false,
  message: '',
  severity: 'success',
};

/**
 * Hook for managing snackbar notifications
 */
export function useSnackbar(): UseSnackbarReturn {
  const [snackbar, setSnackbar] = useState<SnackbarState>(initialState);

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState['severity'] = 'success') => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const showSuccess = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
  }, []);

  const showError = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  }, []);

  const showWarning = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: 'warning' });
  }, []);

  const showInfo = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: 'info' });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    snackbar,
    showSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideSnackbar,
  };
}

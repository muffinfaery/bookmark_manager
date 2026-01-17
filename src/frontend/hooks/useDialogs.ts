'use client';

/**
 * Hook for managing dialog open/close state
 * Reduces boilerplate for multiple dialogs in a component
 */

import { useState, useCallback } from 'react';

export interface DialogState {
  addBookmark: boolean;
  import: boolean;
  export: boolean;
  settings: boolean;
  userProfile: boolean;
  signIn: boolean;
  migration: boolean;
}

export interface UseDialogsReturn {
  dialogs: DialogState;
  openDialog: (dialog: keyof DialogState) => void;
  closeDialog: (dialog: keyof DialogState) => void;
  toggleDialog: (dialog: keyof DialogState) => void;
  closeAll: () => void;
}

const initialState: DialogState = {
  addBookmark: false,
  import: false,
  export: false,
  settings: false,
  userProfile: false,
  signIn: false,
  migration: false,
};

/**
 * Hook for managing multiple dialog states
 */
export function useDialogs(): UseDialogsReturn {
  const [dialogs, setDialogs] = useState<DialogState>(initialState);

  const openDialog = useCallback((dialog: keyof DialogState) => {
    setDialogs((prev) => ({ ...prev, [dialog]: true }));
  }, []);

  const closeDialog = useCallback((dialog: keyof DialogState) => {
    setDialogs((prev) => ({ ...prev, [dialog]: false }));
  }, []);

  const toggleDialog = useCallback((dialog: keyof DialogState) => {
    setDialogs((prev) => ({ ...prev, [dialog]: !prev[dialog] }));
  }, []);

  const closeAll = useCallback(() => {
    setDialogs(initialState);
  }, []);

  return {
    dialogs,
    openDialog,
    closeDialog,
    toggleDialog,
    closeAll,
  };
}

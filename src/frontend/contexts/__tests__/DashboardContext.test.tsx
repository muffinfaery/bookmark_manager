import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DashboardProvider, useDashboard } from '../DashboardContext';

// Mock dependencies
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ isSignedIn: false, getToken: vi.fn() }),
}));

vi.mock('@/components/ThemeRegistry', () => ({
  useThemeMode: () => ({ mode: 'system' as const, setThemeMode: vi.fn() }),
}));

vi.mock('@/hooks/useBookmarks', () => ({
  useBookmarks: () => ({
    bookmarks: [],
    folders: [],
    tags: [],
    loading: false,
    error: null,
    viewMode: 'grid',
    setViewMode: vi.fn(),
    filterType: 'all',
    setFilterType: vi.fn(),
    selectedFolderId: null,
    setSelectedFolderId: vi.fn(),
    selectedTagId: null,
    setSelectedTagId: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    showSyncPrompt: false,
    setShowSyncPrompt: vi.fn(),
    filteredBookmarks: [],
    createBookmark: vi.fn(),
    updateBookmark: vi.fn(),
    deleteBookmark: vi.fn(),
    toggleFavorite: vi.fn(),
    trackClick: vi.fn(),
    createFolder: vi.fn().mockResolvedValue({ id: 'new-folder', name: 'Test' }),
    deleteFolder: vi.fn(),
    deleteTag: vi.fn(),
    exportData: vi.fn().mockResolvedValue({ bookmarks: [], folders: [] }),
    importData: vi.fn(),
    refreshData: vi.fn(),
    reorderBookmarks: vi.fn(),
  }),
}));

vi.mock('@/lib/localStorage', () => ({
  localDataApi: {
    export: () => ({ bookmarks: [], folders: [] }),
    clear: vi.fn(),
  },
}));

describe('DashboardContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DashboardProvider>{children}</DashboardProvider>
  );

  describe('useDashboard hook', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useDashboard());
      }).toThrow('useDashboard must be used within a DashboardProvider');

      consoleSpy.mockRestore();
    });

    it('provides context values when used within provider', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current.bookmarks).toEqual([]);
      expect(result.current.folders).toEqual([]);
      expect(result.current.tags).toEqual([]);
    });
  });

  describe('dialog state management', () => {
    it('opens and closes add dialog', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      expect(result.current.dialogs.addDialogOpen).toBe(false);

      act(() => {
        result.current.openAddDialog();
      });

      expect(result.current.dialogs.addDialogOpen).toBe(true);

      act(() => {
        result.current.closeAddDialog();
      });

      expect(result.current.dialogs.addDialogOpen).toBe(false);
    });

    it('opens and closes import dialog', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      expect(result.current.dialogs.importDialogOpen).toBe(false);

      act(() => {
        result.current.openImportDialog();
      });

      expect(result.current.dialogs.importDialogOpen).toBe(true);

      act(() => {
        result.current.closeImportDialog();
      });

      expect(result.current.dialogs.importDialogOpen).toBe(false);
    });

    it('opens and closes export dialog', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      expect(result.current.dialogs.exportDialogOpen).toBe(false);

      act(() => {
        result.current.openExportDialog();
      });

      expect(result.current.dialogs.exportDialogOpen).toBe(true);

      act(() => {
        result.current.closeExportDialog();
      });

      expect(result.current.dialogs.exportDialogOpen).toBe(false);
    });

    it('opens and closes settings drawer', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      expect(result.current.dialogs.settingsDrawerOpen).toBe(false);

      act(() => {
        result.current.openSettingsDrawer();
      });

      expect(result.current.dialogs.settingsDrawerOpen).toBe(true);

      act(() => {
        result.current.closeSettingsDrawer();
      });

      expect(result.current.dialogs.settingsDrawerOpen).toBe(false);
    });

    it('opens and closes user profile dialog', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      expect(result.current.dialogs.userProfileOpen).toBe(false);

      act(() => {
        result.current.openUserProfile();
      });

      expect(result.current.dialogs.userProfileOpen).toBe(true);

      act(() => {
        result.current.closeUserProfile();
      });

      expect(result.current.dialogs.userProfileOpen).toBe(false);
    });

    it('opens and closes sign in dialog', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      expect(result.current.dialogs.signInDialogOpen).toBe(false);

      act(() => {
        result.current.openSignInDialog();
      });

      expect(result.current.dialogs.signInDialogOpen).toBe(true);

      act(() => {
        result.current.closeSignInDialog();
      });

      expect(result.current.dialogs.signInDialogOpen).toBe(false);
    });
  });

  describe('snackbar state management', () => {
    it('shows success snackbar', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      expect(result.current.snackbar.open).toBe(false);

      act(() => {
        result.current.showSnackbar('Success message', 'success');
      });

      expect(result.current.snackbar.open).toBe(true);
      expect(result.current.snackbar.message).toBe('Success message');
      expect(result.current.snackbar.severity).toBe('success');
    });

    it('shows error snackbar', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      act(() => {
        result.current.showSnackbar('Error message', 'error');
      });

      expect(result.current.snackbar.open).toBe(true);
      expect(result.current.snackbar.message).toBe('Error message');
      expect(result.current.snackbar.severity).toBe('error');
    });

    it('closes snackbar', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      act(() => {
        result.current.showSnackbar('Message', 'success');
      });

      expect(result.current.snackbar.open).toBe(true);

      act(() => {
        result.current.closeSnackbar();
      });

      expect(result.current.snackbar.open).toBe(false);
    });
  });

  describe('sidebar state management', () => {
    it('toggles sidebar collapsed state', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      expect(result.current.sidebarCollapsed).toBe(false);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarCollapsed).toBe(true);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarCollapsed).toBe(false);
    });
  });

  describe('editing state management', () => {
    it('clears editing bookmark when opening add dialog', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      const mockBookmark = {
        id: '1',
        url: 'https://example.com',
        title: 'Test',
        isFavorite: false,
        clickCount: 0,
        sortOrder: 0,
        tags: [],
        createdAt: '',
        updatedAt: '',
      };

      act(() => {
        result.current.setEditingBookmark(mockBookmark);
      });

      expect(result.current.editingBookmark).toEqual(mockBookmark);

      act(() => {
        result.current.openAddDialog();
      });

      expect(result.current.editingBookmark).toBeNull();
      expect(result.current.dialogs.addDialogOpen).toBe(true);
    });

    it('clears editing bookmark when closing add dialog', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      const mockBookmark = {
        id: '1',
        url: 'https://example.com',
        title: 'Test',
        isFavorite: false,
        clickCount: 0,
        sortOrder: 0,
        tags: [],
        createdAt: '',
        updatedAt: '',
      };

      act(() => {
        result.current.setEditingBookmark(mockBookmark);
        result.current.openAddDialog();
      });

      // openAddDialog clears editingBookmark
      expect(result.current.editingBookmark).toBeNull();

      // Set it again and close
      act(() => {
        result.current.setEditingBookmark(mockBookmark);
      });

      act(() => {
        result.current.closeAddDialog();
      });

      expect(result.current.editingBookmark).toBeNull();
      expect(result.current.dialogs.addDialogOpen).toBe(false);
    });
  });

  describe('page title', () => {
    it('returns "All Bookmarks" for default filter', () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      expect(result.current.pageTitle).toBe('All Bookmarks');
    });
  });

  describe('search handler', () => {
    it('handles search input change', async () => {
      const { result } = renderHook(() => useDashboard(), { wrapper });

      const mockEvent = {
        target: { value: 'test query' },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleSearch(mockEvent);
      });

      // The handler should call setSearchQuery and setFilterType from useBookmarks
      // These are mocked, so we just verify no errors occur
    });
  });

  describe('handler functions are memoized', () => {
    it('maintains stable references for handlers with no external dependencies', () => {
      const { result, rerender } = renderHook(() => useDashboard(), { wrapper });

      // These handlers have no external dependencies (only use local state setters)
      // and should maintain stable references across renders
      const firstRenderHandlers = {
        openAddDialog: result.current.openAddDialog,
        closeAddDialog: result.current.closeAddDialog,
        showSnackbar: result.current.showSnackbar,
        toggleSidebar: result.current.toggleSidebar,
        openImportDialog: result.current.openImportDialog,
        closeImportDialog: result.current.closeImportDialog,
        openExportDialog: result.current.openExportDialog,
        closeExportDialog: result.current.closeExportDialog,
        openSettingsDrawer: result.current.openSettingsDrawer,
        closeSettingsDrawer: result.current.closeSettingsDrawer,
        openUserProfile: result.current.openUserProfile,
        closeUserProfile: result.current.closeUserProfile,
        openSignInDialog: result.current.openSignInDialog,
        closeSignInDialog: result.current.closeSignInDialog,
        closeSnackbar: result.current.closeSnackbar,
        closeMigrationDialog: result.current.closeMigrationDialog,
      };

      rerender();

      // Handlers with no external dependencies should maintain the same reference
      expect(result.current.openAddDialog).toBe(firstRenderHandlers.openAddDialog);
      expect(result.current.closeAddDialog).toBe(firstRenderHandlers.closeAddDialog);
      expect(result.current.showSnackbar).toBe(firstRenderHandlers.showSnackbar);
      expect(result.current.toggleSidebar).toBe(firstRenderHandlers.toggleSidebar);
      expect(result.current.openImportDialog).toBe(firstRenderHandlers.openImportDialog);
      expect(result.current.closeImportDialog).toBe(firstRenderHandlers.closeImportDialog);
      expect(result.current.openExportDialog).toBe(firstRenderHandlers.openExportDialog);
      expect(result.current.closeExportDialog).toBe(firstRenderHandlers.closeExportDialog);
      expect(result.current.openSettingsDrawer).toBe(firstRenderHandlers.openSettingsDrawer);
      expect(result.current.closeSettingsDrawer).toBe(firstRenderHandlers.closeSettingsDrawer);
      expect(result.current.openUserProfile).toBe(firstRenderHandlers.openUserProfile);
      expect(result.current.closeUserProfile).toBe(firstRenderHandlers.closeUserProfile);
      expect(result.current.openSignInDialog).toBe(firstRenderHandlers.openSignInDialog);
      expect(result.current.closeSignInDialog).toBe(firstRenderHandlers.closeSignInDialog);
      expect(result.current.closeSnackbar).toBe(firstRenderHandlers.closeSnackbar);
      expect(result.current.closeMigrationDialog).toBe(firstRenderHandlers.closeMigrationDialog);
    });
  });
});

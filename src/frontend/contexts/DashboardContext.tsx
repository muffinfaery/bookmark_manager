'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
} from 'react';
import { useAuth } from '@clerk/nextjs';
import { useThemeMode, ThemeMode } from '@/components/settings';
import { useBookmarks } from '@/hooks/useBookmarks';
import { localDataApi } from '@/lib/localStorage';
import { getPageTitle } from '@/lib/utils';
import {
  Bookmark,
  Folder,
  Tag,
  CreateBookmarkDto,
  UpdateBookmarkDto,
  FilterType,
  ViewMode,
} from '@/types';

// Types for snackbar state
export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

// Types for migration data
export interface MigrationData {
  bookmarks: any[];
  folders: any[];
}

// Dialog state interface
export interface DialogState {
  addDialogOpen: boolean;
  importDialogOpen: boolean;
  exportDialogOpen: boolean;
  settingsDrawerOpen: boolean;
  userProfileOpen: boolean;
  signInDialogOpen: boolean;
  migrationDialogOpen: boolean;
  deleteFolderDialogOpen: boolean;
  deleteTagDialogOpen: boolean;
}

// Context value interface
export interface DashboardContextValue {
  // Auth state
  isSignedIn: boolean | undefined;

  // Data from useBookmarks
  bookmarks: Bookmark[];
  folders: Folder[];
  tags: Tag[];
  loading: boolean;
  error: string | null;
  filteredBookmarks: Bookmark[];

  // View and filter state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  selectedTagId: string | null;
  setSelectedTagId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Theme
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;

  // Dialog state
  dialogs: DialogState;
  openAddDialog: () => void;
  closeAddDialog: () => void;
  openImportDialog: () => void;
  closeImportDialog: () => void;
  openExportDialog: () => void;
  closeExportDialog: () => void;
  openSettingsDrawer: () => void;
  closeSettingsDrawer: () => void;
  openUserProfile: () => void;
  closeUserProfile: () => void;
  openSignInDialog: () => void;
  closeSignInDialog: () => void;

  // Delete confirmation dialogs
  folderToDelete: Folder | null;
  tagToDelete: Tag | null;
  openDeleteFolderDialog: (folder: Folder) => void;
  closeDeleteFolderDialog: () => void;
  openDeleteTagDialog: (tag: Tag) => void;
  closeDeleteTagDialog: () => void;
  confirmDeleteFolder: (folderId: string, moveToFolderId: string | null | undefined) => Promise<void>;
  confirmDeleteTag: (tagId: string, replaceWithTagId: string | null | undefined) => Promise<void>;

  // Editing state
  editingBookmark: Bookmark | null;
  setEditingBookmark: (bookmark: Bookmark | null) => void;

  // Sidebar state
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Snackbar
  snackbar: SnackbarState;
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
  closeSnackbar: () => void;

  // Sync prompt
  showSyncPrompt: boolean;
  closeSyncPrompt: () => void;

  // Migration
  localDataForMigration: MigrationData | null;
  migrationDialogOpen: boolean;
  closeMigrationDialog: () => void;

  // Page title
  pageTitle: string;

  // Handlers
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveBookmark: (dto: CreateBookmarkDto | UpdateBookmarkDto) => Promise<void>;
  handleEditBookmark: (bookmark: Bookmark) => void;
  handleDeleteBookmark: (id: string) => Promise<void>;
  handleBookmarkClick: (bookmark: Bookmark) => Promise<void>;
  handleCreateFolder: (name: string) => Promise<Folder>;
  handleDeleteFolder: (id: string) => Promise<void>;
  handleDeleteTag: (id: string) => Promise<void>;
  handleExportData: () => Promise<{ bookmarks: Bookmark[]; folders: Folder[] }>;
  handleImportData: (data: { bookmarks: any[]; folders: any[] }) => Promise<void>;
  handleMigrate: () => Promise<void>;
  handleSkipMigration: () => void;

  // Data operations
  toggleFavorite: (id: string) => Promise<void>;
  reorderBookmarks: (items: { id: string; sortOrder: number }[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Create the context
const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

// Provider props
interface DashboardProviderProps {
  children: ReactNode;
}

// Provider component
export function DashboardProvider({ children }: DashboardProviderProps) {
  const { isSignedIn } = useAuth();
  const { mode: themeMode, setThemeMode } = useThemeMode();

  // Get all bookmark-related data and functions from useBookmarks
  const {
    bookmarks,
    folders,
    tags,
    loading,
    error,
    viewMode,
    setViewMode,
    filterType,
    setFilterType,
    selectedFolderId,
    setSelectedFolderId,
    selectedTagId,
    setSelectedTagId,
    searchQuery,
    setSearchQuery,
    showSyncPrompt,
    setShowSyncPrompt,
    filteredBookmarks,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    toggleFavorite,
    trackClick,
    createFolder,
    deleteFolder,
    deleteTag,
    exportData,
    importData,
    refreshData,
    reorderBookmarks,
  } = useBookmarks();

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const [deleteFolderDialogOpen, setDeleteFolderDialogOpen] = useState(false);
  const [deleteTagDialogOpen, setDeleteTagDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  // Editing state
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Migration state
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [localDataForMigration, setLocalDataForMigration] = useState<MigrationData | null>(null);
  const hasCheckedMigration = useRef(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Check for local data to migrate when user signs in
  useEffect(() => {
    if (isSignedIn && !hasCheckedMigration.current) {
      hasCheckedMigration.current = true;
      const localData = localDataApi.export();
      if (localData.bookmarks.length > 0 || localData.folders.length > 0) {
        setLocalDataForMigration(localData);
        setMigrationDialogOpen(true);
      }
    }
  }, [isSignedIn]);

  // Memoized dialog state object
  const dialogs = useMemo<DialogState>(
    () => ({
      addDialogOpen,
      importDialogOpen,
      exportDialogOpen,
      settingsDrawerOpen,
      userProfileOpen,
      signInDialogOpen,
      migrationDialogOpen,
      deleteFolderDialogOpen,
      deleteTagDialogOpen,
    }),
    [
      addDialogOpen,
      importDialogOpen,
      exportDialogOpen,
      settingsDrawerOpen,
      userProfileOpen,
      signInDialogOpen,
      migrationDialogOpen,
      deleteFolderDialogOpen,
      deleteTagDialogOpen,
    ]
  );

  // Dialog open/close handlers - memoized
  const openAddDialog = useCallback(() => {
    setEditingBookmark(null);
    setAddDialogOpen(true);
  }, []);

  const closeAddDialog = useCallback(() => {
    setAddDialogOpen(false);
    setEditingBookmark(null);
  }, []);

  const openImportDialog = useCallback(() => setImportDialogOpen(true), []);
  const closeImportDialog = useCallback(() => setImportDialogOpen(false), []);

  const openExportDialog = useCallback(() => setExportDialogOpen(true), []);
  const closeExportDialog = useCallback(() => setExportDialogOpen(false), []);

  const openSettingsDrawer = useCallback(() => setSettingsDrawerOpen(true), []);
  const closeSettingsDrawer = useCallback(() => setSettingsDrawerOpen(false), []);

  const openUserProfile = useCallback(() => setUserProfileOpen(true), []);
  const closeUserProfile = useCallback(() => setUserProfileOpen(false), []);

  const openSignInDialog = useCallback(() => setSignInDialogOpen(true), []);
  const closeSignInDialog = useCallback(() => setSignInDialogOpen(false), []);

  const closeMigrationDialog = useCallback(() => setMigrationDialogOpen(false), []);

  // Delete folder dialog handlers
  const openDeleteFolderDialog = useCallback((folder: Folder) => {
    setFolderToDelete(folder);
    setDeleteFolderDialogOpen(true);
  }, []);

  const closeDeleteFolderDialog = useCallback(() => {
    setDeleteFolderDialogOpen(false);
    setFolderToDelete(null);
  }, []);

  // Delete tag dialog handlers
  const openDeleteTagDialog = useCallback((tag: Tag) => {
    setTagToDelete(tag);
    setDeleteTagDialogOpen(true);
  }, []);

  const closeDeleteTagDialog = useCallback(() => {
    setDeleteTagDialogOpen(false);
    setTagToDelete(null);
  }, []);

  // Sidebar toggle - memoized
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // Snackbar handlers - memoized
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Close sync prompt - memoized
  const closeSyncPrompt = useCallback(() => {
    setShowSyncPrompt(false);
  }, [setShowSyncPrompt]);

  // Page title - memoized
  const pageTitle = useMemo(
    () =>
      getPageTitle(filterType, {
        folders,
        tags,
        selectedFolderId,
        selectedTagId,
      }),
    [filterType, folders, tags, selectedFolderId, selectedTagId]
  );

  // Search handler - memoized
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      if (query) {
        setFilterType('search');
      } else {
        setFilterType('all');
      }
    },
    [setSearchQuery, setFilterType]
  );

  // Save bookmark handler - memoized
  const handleSaveBookmark = useCallback(
    async (dto: CreateBookmarkDto | UpdateBookmarkDto) => {
      try {
        if (editingBookmark) {
          await updateBookmark(editingBookmark.id, dto as UpdateBookmarkDto);
          showSnackbar('Bookmark updated!', 'success');
        } else {
          await createBookmark(dto as CreateBookmarkDto);
          showSnackbar('Bookmark added!', 'success');
        }
        setEditingBookmark(null);
        await refreshData();
      } catch (err) {
        throw err;
      }
    },
    [editingBookmark, createBookmark, updateBookmark, refreshData, showSnackbar]
  );

  // Edit bookmark handler - memoized
  const handleEditBookmark = useCallback((bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setAddDialogOpen(true);
  }, []);

  // Delete bookmark handler - memoized
  const handleDeleteBookmark = useCallback(
    async (id: string) => {
      try {
        await deleteBookmark(id);
        showSnackbar('Bookmark deleted', 'success');
      } catch (err) {
        showSnackbar('Failed to delete bookmark', 'error');
      }
    },
    [deleteBookmark, showSnackbar]
  );

  // Bookmark click handler - memoized
  const handleBookmarkClick = useCallback(
    async (bookmark: Bookmark) => {
      await trackClick(bookmark.id);
      window.open(bookmark.url, '_blank', 'noopener,noreferrer');
    },
    [trackClick]
  );

  // Create folder handler - memoized
  const handleCreateFolder = useCallback(
    async (name: string): Promise<Folder> => {
      try {
        const folder = await createFolder({ name });
        showSnackbar('Folder created!', 'success');
        return folder;
      } catch (err) {
        showSnackbar('Failed to create folder', 'error');
        throw err;
      }
    },
    [createFolder, showSnackbar]
  );

  // Delete folder handler - opens confirmation dialog
  const handleDeleteFolder = useCallback(
    async (id: string) => {
      const folder = folders.find((f) => f.id === id);
      if (folder) {
        openDeleteFolderDialog(folder);
      }
    },
    [folders, openDeleteFolderDialog]
  );

  // Confirm delete folder with optional bookmark moving
  const confirmDeleteFolder = useCallback(
    async (folderId: string, moveToFolderId: string | null | undefined) => {
      try {
        // If moveToFolderId is provided (including null for uncategorized), move bookmarks first
        if (moveToFolderId !== undefined) {
          const bookmarksToMove = bookmarks.filter((b) => b.folderId === folderId);
          for (const bookmark of bookmarksToMove) {
            // Convert null to undefined for the API (null means uncategorized)
            await updateBookmark(bookmark.id, { folderId: moveToFolderId ?? undefined });
          }
        }

        await deleteFolder(folderId);
        if (selectedFolderId === folderId) {
          setFilterType('all');
          setSelectedFolderId(null);
        }
        closeDeleteFolderDialog();
        showSnackbar('Folder deleted', 'success');
      } catch (err) {
        showSnackbar('Failed to delete folder', 'error');
        throw err;
      }
    },
    [bookmarks, updateBookmark, deleteFolder, selectedFolderId, setFilterType, setSelectedFolderId, closeDeleteFolderDialog, showSnackbar]
  );

  // Delete tag handler - opens confirmation dialog
  const handleDeleteTag = useCallback(
    async (id: string) => {
      const tag = tags.find((t) => t.id === id);
      if (tag) {
        openDeleteTagDialog(tag);
      }
    },
    [tags, openDeleteTagDialog]
  );

  // Confirm delete tag with optional tag replacement
  const confirmDeleteTag = useCallback(
    async (tagId: string, replaceWithTagId: string | null | undefined) => {
      try {
        // If replaceWithTagId is provided, replace the tag on bookmarks first
        if (replaceWithTagId !== undefined && replaceWithTagId !== null) {
          const bookmarksWithTag = bookmarks.filter((b) => b.tags?.some((t) => t.id === tagId));
          for (const bookmark of bookmarksWithTag) {
            const currentTagIds = bookmark.tags?.map((t) => t.id) || [];
            // Remove the old tag and add the new one (if not already present)
            const newTags = currentTagIds
              .filter((id) => id !== tagId)
              .concat(currentTagIds.includes(replaceWithTagId) ? [] : [replaceWithTagId]);
            await updateBookmark(bookmark.id, { tags: newTags });
          }
        }

        await deleteTag(tagId);
        if (selectedTagId === tagId) {
          setFilterType('all');
          setSelectedTagId(null);
        }
        closeDeleteTagDialog();
        showSnackbar('Tag deleted', 'success');
      } catch (err) {
        showSnackbar('Failed to delete tag', 'error');
        throw err;
      }
    },
    [bookmarks, updateBookmark, deleteTag, selectedTagId, setFilterType, setSelectedTagId, closeDeleteTagDialog, showSnackbar]
  );

  // Export data handler - memoized
  const handleExportData = useCallback(async () => {
    const data = await exportData();
    showSnackbar('Bookmarks exported!', 'success');
    return data;
  }, [exportData, showSnackbar]);

  // Import data handler - memoized
  const handleImportData = useCallback(
    async (data: { bookmarks: any[]; folders: any[] }) => {
      try {
        await importData(data);
        showSnackbar(`Imported ${data.bookmarks.length} bookmarks!`, 'success');
        await refreshData();
      } catch (err) {
        throw err;
      }
    },
    [importData, refreshData, showSnackbar]
  );

  // Migration handlers - memoized
  const handleMigrate = useCallback(async () => {
    if (!localDataForMigration) return;

    await importData({
      bookmarks: localDataForMigration.bookmarks,
      folders: localDataForMigration.folders,
    });
    localDataApi.clear();
    const count = localDataForMigration.bookmarks.length;
    setLocalDataForMigration(null);
    await refreshData();
    showSnackbar(
      `Migrated ${count} bookmark${count !== 1 ? 's' : ''}!`,
      'success'
    );
  }, [localDataForMigration, importData, refreshData, showSnackbar]);

  const handleSkipMigration = useCallback(() => {
    localDataApi.clear();
    setLocalDataForMigration(null);
    showSnackbar('Demo data cleared', 'success');
  }, [showSnackbar]);

  // Memoize the entire context value
  const value = useMemo<DashboardContextValue>(
    () => ({
      // Auth
      isSignedIn,

      // Data
      bookmarks,
      folders,
      tags,
      loading,
      error,
      filteredBookmarks,

      // View and filter state
      viewMode,
      setViewMode,
      filterType,
      setFilterType,
      selectedFolderId,
      setSelectedFolderId,
      selectedTagId,
      setSelectedTagId,
      searchQuery,
      setSearchQuery,

      // Theme
      themeMode,
      setThemeMode,

      // Dialog state
      dialogs,
      openAddDialog,
      closeAddDialog,
      openImportDialog,
      closeImportDialog,
      openExportDialog,
      closeExportDialog,
      openSettingsDrawer,
      closeSettingsDrawer,
      openUserProfile,
      closeUserProfile,
      openSignInDialog,
      closeSignInDialog,

      // Delete confirmation dialogs
      folderToDelete,
      tagToDelete,
      openDeleteFolderDialog,
      closeDeleteFolderDialog,
      openDeleteTagDialog,
      closeDeleteTagDialog,
      confirmDeleteFolder,
      confirmDeleteTag,

      // Editing
      editingBookmark,
      setEditingBookmark,

      // Sidebar
      sidebarCollapsed,
      toggleSidebar,

      // Snackbar
      snackbar,
      showSnackbar,
      closeSnackbar,

      // Sync prompt
      showSyncPrompt,
      closeSyncPrompt,

      // Migration
      localDataForMigration,
      migrationDialogOpen,
      closeMigrationDialog,

      // Page title
      pageTitle,

      // Handlers
      handleSearch,
      handleSaveBookmark,
      handleEditBookmark,
      handleDeleteBookmark,
      handleBookmarkClick,
      handleCreateFolder,
      handleDeleteFolder,
      handleDeleteTag,
      handleExportData,
      handleImportData,
      handleMigrate,
      handleSkipMigration,

      // Data operations
      toggleFavorite,
      reorderBookmarks,
      refreshData,
    }),
    [
      isSignedIn,
      bookmarks,
      folders,
      tags,
      loading,
      error,
      filteredBookmarks,
      viewMode,
      setViewMode,
      filterType,
      setFilterType,
      selectedFolderId,
      setSelectedFolderId,
      selectedTagId,
      setSelectedTagId,
      searchQuery,
      setSearchQuery,
      themeMode,
      setThemeMode,
      dialogs,
      openAddDialog,
      closeAddDialog,
      openImportDialog,
      closeImportDialog,
      openExportDialog,
      closeExportDialog,
      openSettingsDrawer,
      closeSettingsDrawer,
      openUserProfile,
      closeUserProfile,
      openSignInDialog,
      closeSignInDialog,
      folderToDelete,
      tagToDelete,
      openDeleteFolderDialog,
      closeDeleteFolderDialog,
      openDeleteTagDialog,
      closeDeleteTagDialog,
      confirmDeleteFolder,
      confirmDeleteTag,
      editingBookmark,
      sidebarCollapsed,
      toggleSidebar,
      snackbar,
      showSnackbar,
      closeSnackbar,
      showSyncPrompt,
      closeSyncPrompt,
      localDataForMigration,
      migrationDialogOpen,
      closeMigrationDialog,
      pageTitle,
      handleSearch,
      handleSaveBookmark,
      handleEditBookmark,
      handleDeleteBookmark,
      handleBookmarkClick,
      handleCreateFolder,
      handleDeleteFolder,
      handleDeleteTag,
      handleExportData,
      handleImportData,
      handleMigrate,
      handleSkipMigration,
      toggleFavorite,
      reorderBookmarks,
      refreshData,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

// Custom hook to use the dashboard context
export function useDashboard(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

// Export the context for testing purposes
export { DashboardContext };

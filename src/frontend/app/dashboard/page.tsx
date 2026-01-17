'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme,
  Skeleton,
} from '@mui/material';
import {
  Search,
  Add,
  AccountCircle,
} from '@mui/icons-material';
import { useThemeMode } from '@/components/ThemeRegistry';
import { useBookmarks } from '@/hooks/useBookmarks';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import SortableBookmarkGrid from '@/components/SortableBookmarkGrid';
import AddBookmarkDialog from '@/components/AddBookmarkDialog';
import ImportDialog from '@/components/ImportDialog';
import ExportDialog from '@/components/ExportDialog';
import SyncPromptDialog from '@/components/SyncPromptDialog';
import SettingsDrawer from '@/components/SettingsDrawer';
import UserProfileDialog from '@/components/UserProfileDialog';
import SignInDialog from '@/components/SignInDialog';
import MigrationDialog from '@/components/MigrationDialog';
import { localDataApi } from '@/lib/localStorage';
import { Bookmark, CreateBookmarkDto, UpdateBookmarkDto } from '@/types';

export default function DashboardPage() {
  const { isSignedIn } = useAuth();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { mode, setThemeMode } = useThemeMode();
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

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [signInDialogOpen, setSignInDialogOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [localDataForMigration, setLocalDataForMigration] = useState<{ bookmarks: any[]; folders: any[] } | null>(null);
  const hasCheckedMigration = useRef(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      setFilterType('search');
    } else {
      setFilterType('all');
    }
  };

  const handleSaveBookmark = useCallback(
    async (dto: CreateBookmarkDto | UpdateBookmarkDto) => {
      try {
        if (editingBookmark) {
          await updateBookmark(editingBookmark.id, dto as UpdateBookmarkDto);
          setSnackbar({ open: true, message: 'Bookmark updated!', severity: 'success' });
        } else {
          await createBookmark(dto as CreateBookmarkDto);
          setSnackbar({ open: true, message: 'Bookmark added!', severity: 'success' });
        }
        setEditingBookmark(null);
        await refreshData();
      } catch (err) {
        throw err;
      }
    },
    [editingBookmark, createBookmark, updateBookmark, refreshData]
  );

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setAddDialogOpen(true);
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      await deleteBookmark(id);
      setSnackbar({ open: true, message: 'Bookmark deleted', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete bookmark', severity: 'error' });
    }
  };

  const handleBookmarkClick = async (bookmark: Bookmark) => {
    await trackClick(bookmark.id);
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const folder = await createFolder({ name });
      setSnackbar({ open: true, message: 'Folder created!', severity: 'success' });
      return folder;
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to create folder', severity: 'error' });
      throw err;
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await deleteFolder(id);
      if (selectedFolderId === id) {
        setFilterType('all');
        setSelectedFolderId(null);
      }
      setSnackbar({ open: true, message: 'Folder deleted', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete folder', severity: 'error' });
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await deleteTag(id);
      if (selectedTagId === id) {
        setFilterType('all');
        setSelectedTagId(null);
      }
      setSnackbar({ open: true, message: 'Tag deleted', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete tag', severity: 'error' });
    }
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handleExportData = async () => {
    const data = await exportData();
    setSnackbar({ open: true, message: 'Bookmarks exported!', severity: 'success' });
    return data;
  };

  const handleImport = () => {
    setImportDialogOpen(true);
  };

  const handleImportData = async (data: { bookmarks: any[]; folders: any[] }) => {
    try {
      await importData(data);
      setSnackbar({ open: true, message: `Imported ${data.bookmarks.length} bookmarks!`, severity: 'success' });
      await refreshData();
    } catch (err) {
      throw err;
    }
  };

  const getPageTitle = () => {
    switch (filterType) {
      case 'favorites':
        return 'Favorites';
      case 'folder':
        if (selectedFolderId) {
          const folder = folders.find((f) => f.id === selectedFolderId);
          return folder?.name || 'Folder';
        }
        return 'Uncategorized';
      case 'tag':
        if (selectedTagId) {
          const tag = tags.find((t) => t.id === selectedTagId);
          return `Tag: ${tag?.name || ''}`;
        }
        return 'All Bookmarks';
      case 'search':
        return 'All Bookmarks';
      default:
        return 'All Bookmarks';
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar - Desktop only */}
      {!isMobile && (
        <Sidebar
          folders={folders}
          tags={tags}
          filterType={filterType}
          selectedFolderId={selectedFolderId}
          selectedTagId={selectedTagId}
          collapsed={sidebarCollapsed}
          onFilterChange={setFilterType}
          onFolderSelect={setSelectedFolderId}
          onTagSelect={setSelectedTagId}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
          onDeleteTag={handleDeleteTag}
          onOpenSettings={() => setSettingsDrawerOpen(true)}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile Header */}
        {isMobile && (
          <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
              <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                {getPageTitle()}
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* App Bar - Desktop only */}
        {!isMobile && (
          <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
              <TextField
                size="small"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={handleSearch}
                sx={{ flex: 1, mr: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingBookmark(null);
                  setAddDialogOpen(true);
                }}
              >
                Add Bookmark
              </Button>

              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ClerkLoading>
                  <Skeleton variant="circular" width={40} height={40} />
                </ClerkLoading>
                <ClerkLoaded>
                  {isSignedIn ? (
                    <IconButton onClick={() => setUserProfileOpen(true)} color="inherit">
                      <AccountCircle />
                    </IconButton>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<AccountCircle />}
                      onClick={() => setSignInDialogOpen(true)}
                    >
                      Sign In
                    </Button>
                  )}
                </ClerkLoaded>
              </Box>
            </Toolbar>
          </AppBar>
        )}

        {/* Content Area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: isMobile ? 2 : 3, pb: isMobile ? 12 : 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : filteredBookmarks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No bookmarks found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {filterType === 'search'
                  ? 'Try a different search term'
                  : 'Add your first bookmark to get started'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setEditingBookmark(null);
                  setAddDialogOpen(true);
                }}
              >
                Add Bookmark
              </Button>
            </Box>
          ) : (
            <SortableBookmarkGrid
              bookmarks={filteredBookmarks}
              viewMode={viewMode}
              onEdit={handleEditBookmark}
              onDelete={handleDeleteBookmark}
              onToggleFavorite={toggleFavorite}
              onClick={handleBookmarkClick}
              onReorder={reorderBookmarks}
            />
          )}
        </Box>
      </Box>

      {/* Dialogs */}
      <AddBookmarkDialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setEditingBookmark(null);
        }}
        onSave={handleSaveBookmark}
        folders={folders}
        tags={tags}
        editingBookmark={editingBookmark}
        onCreateFolder={handleCreateFolder}
      />

      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImportData}
        existingUrls={bookmarks.map((b) => b.url)}
      />

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExportData}
      />

      <SyncPromptDialog
        open={showSyncPrompt}
        onClose={() => setShowSyncPrompt(false)}
      />

      <SettingsDrawer
        open={settingsDrawerOpen}
        onClose={() => setSettingsDrawerOpen(false)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        themeMode={mode}
        onThemeModeChange={setThemeMode}
        onImport={handleImport}
        onExport={handleExport}
      />

      <UserProfileDialog
        open={userProfileOpen}
        onClose={() => setUserProfileOpen(false)}
      />

      <SignInDialog
        open={signInDialogOpen}
        onClose={() => setSignInDialogOpen(false)}
      />

      {localDataForMigration && (
        <MigrationDialog
          open={migrationDialogOpen}
          onClose={() => setMigrationDialogOpen(false)}
          localBookmarkCount={localDataForMigration.bookmarks.length}
          localFolderCount={localDataForMigration.folders.length}
          onMigrate={async () => {
            await importData({
              bookmarks: localDataForMigration.bookmarks,
              folders: localDataForMigration.folders,
            });
            localDataApi.clear();
            setLocalDataForMigration(null);
            await refreshData();
            setSnackbar({
              open: true,
              message: `Migrated ${localDataForMigration.bookmarks.length} bookmark${localDataForMigration.bookmarks.length !== 1 ? 's' : ''}!`,
              severity: 'success',
            });
          }}
          onSkip={() => {
            localDataApi.clear();
            setLocalDataForMigration(null);
            setSnackbar({
              open: true,
              message: 'Demo data cleared',
              severity: 'success',
            });
          }}
        />
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNav
          folders={folders}
          tags={tags}
          bookmarks={bookmarks}
          filterType={filterType}
          selectedFolderId={selectedFolderId}
          selectedTagId={selectedTagId}
          searchQuery={searchQuery}
          onFilterChange={setFilterType}
          onFolderSelect={setSelectedFolderId}
          onTagSelect={setSelectedTagId}
          onSearchChange={setSearchQuery}
          onAddBookmark={() => {
            setEditingBookmark(null);
            setAddDialogOpen(true);
          }}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
          onDeleteTag={handleDeleteTag}
          onBookmarkClick={handleBookmarkClick}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          themeMode={mode}
          onThemeModeChange={setThemeMode}
          onImport={handleImport}
          onExport={handleExport}
          onOpenUserProfile={() => setUserProfileOpen(true)}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}
        sx={{ mb: isMobile ? 8 : 0 }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

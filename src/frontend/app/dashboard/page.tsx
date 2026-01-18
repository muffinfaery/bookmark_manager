'use client';

import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
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
import { Search, Add, AccountCircle } from '@mui/icons-material';
import { useDashboard } from '@/contexts';
import { Sidebar, MobileBottomNav } from '@/components/navigation';
import { SortableBookmarkGrid, AddBookmarkDialog } from '@/components/bookmarks';
import {
  ImportDialog,
  ExportDialog,
  SyncPromptDialog,
  UserProfileDialog,
  SignInDialog,
  MigrationDialog,
  DeleteFolderDialog,
  DeleteTagDialog,
} from '@/components/dialogs';
import { SettingsDrawer } from '@/components/settings';

export default function DashboardPage() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const {
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
    closeImportDialog,
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
    closeDeleteFolderDialog,
    closeDeleteTagDialog,
    confirmDeleteFolder,
    confirmDeleteTag,

    // Editing
    editingBookmark,

    // Sidebar
    sidebarCollapsed,
    toggleSidebar,

    // Snackbar
    snackbar,
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
    openImportDialog,
    openExportDialog,

    // Data operations
    toggleFavorite,
    reorderBookmarks,
  } = useDashboard();

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
          onOpenSettings={openSettingsDrawer}
          onToggleCollapse={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile Header */}
        {isMobile && (
          <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
              <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                {pageTitle}
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

              <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
                Add Bookmark
              </Button>

              <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ClerkLoading>
                  <Skeleton variant="circular" width={40} height={40} />
                </ClerkLoading>
                <ClerkLoaded>
                  {isSignedIn ? (
                    <IconButton onClick={openUserProfile} color="inherit">
                      <AccountCircle />
                    </IconButton>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<AccountCircle />}
                      onClick={openSignInDialog}
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
              <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
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
        open={dialogs.addDialogOpen}
        onClose={closeAddDialog}
        onSave={handleSaveBookmark}
        folders={folders}
        tags={tags}
        editingBookmark={editingBookmark}
        onCreateFolder={handleCreateFolder}
      />

      <ImportDialog
        open={dialogs.importDialogOpen}
        onClose={closeImportDialog}
        onImport={handleImportData}
        existingUrls={bookmarks.map((b) => b.url)}
      />

      <ExportDialog
        open={dialogs.exportDialogOpen}
        onClose={closeExportDialog}
        onExport={handleExportData}
      />

      <SyncPromptDialog open={showSyncPrompt} onClose={closeSyncPrompt} />

      <SettingsDrawer
        open={dialogs.settingsDrawerOpen}
        onClose={closeSettingsDrawer}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        themeMode={themeMode}
        onThemeModeChange={setThemeMode}
        onImport={openImportDialog}
        onExport={openExportDialog}
      />

      <UserProfileDialog open={dialogs.userProfileOpen} onClose={closeUserProfile} />

      <SignInDialog open={dialogs.signInDialogOpen} onClose={closeSignInDialog} />

      {localDataForMigration && (
        <MigrationDialog
          open={migrationDialogOpen}
          onClose={closeMigrationDialog}
          localBookmarkCount={localDataForMigration.bookmarks.length}
          localFolderCount={localDataForMigration.folders.length}
          onMigrate={handleMigrate}
          onSkip={handleSkipMigration}
        />
      )}

      <DeleteFolderDialog
        open={dialogs.deleteFolderDialogOpen}
        folder={folderToDelete}
        folders={folders}
        bookmarks={bookmarks}
        onClose={closeDeleteFolderDialog}
        onConfirm={confirmDeleteFolder}
      />

      <DeleteTagDialog
        open={dialogs.deleteTagDialogOpen}
        tag={tagToDelete}
        tags={tags}
        bookmarks={bookmarks}
        onClose={closeDeleteTagDialog}
        onConfirm={confirmDeleteTag}
      />

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
          onAddBookmark={openAddDialog}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
          onDeleteTag={handleDeleteTag}
          onBookmarkClick={handleBookmarkClick}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          themeMode={themeMode}
          onThemeModeChange={setThemeMode}
          onImport={openImportDialog}
          onExport={openExportDialog}
          onOpenUserProfile={openUserProfile}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}
        sx={{ mb: isMobile ? 8 : 0 }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

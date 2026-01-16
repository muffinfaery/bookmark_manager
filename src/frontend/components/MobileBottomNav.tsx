'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  Skeleton,
} from '@mui/material';
import {
  Search,
  Add,
  Bookmarks,
  Close,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth, SignInButton, SignUpButton, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import ClerkButton from './ClerkButton';
import MobileDrawer from './MobileDrawer';
import { Folder, Tag, FilterType } from '@/types';

interface MobileBottomNavProps {
  folders: Folder[];
  tags: Tag[];
  filterType: FilterType;
  selectedFolderId: string | null;
  selectedTagId: string | null;
  searchQuery: string;
  onFilterChange: (type: FilterType) => void;
  onFolderSelect: (id: string | null) => void;
  onTagSelect: (id: string | null) => void;
  onSearchChange: (query: string) => void;
  onAddBookmark: () => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onDeleteTag: (id: string) => void;
  // Settings
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  themeMode: 'light' | 'dark' | 'system';
  onThemeModeChange: (mode: 'light' | 'dark' | 'system') => void;
  onImport: () => void;
  onExport: () => void;
  onOpenUserProfile?: () => void;
}

export default function MobileBottomNav({
  folders,
  tags,
  filterType,
  selectedFolderId,
  selectedTagId,
  searchQuery,
  onFilterChange,
  onFolderSelect,
  onTagSelect,
  onSearchChange,
  onAddBookmark,
  onCreateFolder,
  onDeleteFolder,
  onDeleteTag,
  viewMode,
  onViewModeChange,
  themeMode,
  onThemeModeChange,
  onImport,
  onExport,
  onOpenUserProfile,
}: MobileBottomNavProps) {
  const { isSignedIn } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const handleSearchClose = () => {
    setSearchOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          borderRadius: 0,
          borderTop: 1,
          borderColor: 'divider',
          pb: 'env(safe-area-inset-bottom)',
        }}
        elevation={8}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            height: 64,
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          {/* Bookmarks/Drawer Button */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <IconButton
              onClick={() => setDrawerOpen(true)}
              color="inherit"
              sx={{ p: 1 }}
            >
              <Bookmarks />
            </IconButton>
            <Typography variant="caption" sx={{ fontSize: '0.625rem', mt: -0.5 }}>
              Browse
            </Typography>
          </Box>

          {/* Search Button */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <IconButton
              onClick={() => setSearchOpen(true)}
              color="primary"
              sx={{ p: 1 }}
            >
              <Search />
            </IconButton>
            <Typography variant="caption" color="primary" sx={{ fontSize: '0.625rem', mt: -0.5 }}>
              Search
            </Typography>
          </Box>

          {/* Add Bookmark Button */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <IconButton
              onClick={onAddBookmark}
              color="inherit"
              sx={{ p: 1 }}
            >
              <Add />
            </IconButton>
            <Typography variant="caption" sx={{ fontSize: '0.625rem', mt: -0.5 }}>
              Add
            </Typography>
          </Box>

          {/* Account Button */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <ClerkLoading>
              <Skeleton variant="circular" width={32} height={32} sx={{ my: 0.5 }} />
              <Skeleton variant="text" width={40} height={12} />
            </ClerkLoading>
            <ClerkLoaded>
              {isSignedIn ? (
                <>
                  <IconButton
                    onClick={onOpenUserProfile}
                    color="inherit"
                    sx={{ p: 1 }}
                  >
                    <AccountCircle />
                  </IconButton>
                  <Typography variant="caption" sx={{ fontSize: '0.625rem', mt: -0.5 }}>
                    Account
                  </Typography>
                </>
              ) : (
                <>
                  <IconButton
                    onClick={() => setAccountMenuOpen(true)}
                    color="inherit"
                    sx={{ p: 1 }}
                  >
                    <AccountCircle />
                  </IconButton>
                  <Typography variant="caption" sx={{ fontSize: '0.625rem', mt: -0.5 }}>
                    Sign In
                  </Typography>
                </>
              )}
            </ClerkLoaded>
          </Box>
        </Box>
      </Paper>

      {/* Mobile Drawer for Folders/Tags/Settings */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        folders={folders}
        tags={tags}
        filterType={filterType}
        selectedFolderId={selectedFolderId}
        selectedTagId={selectedTagId}
        onFilterChange={(type) => {
          onFilterChange(type);
          setDrawerOpen(false);
        }}
        onFolderSelect={(id) => {
          onFolderSelect(id);
          setDrawerOpen(false);
        }}
        onTagSelect={(id) => {
          onTagSelect(id);
          setDrawerOpen(false);
        }}
        onCreateFolder={onCreateFolder}
        onDeleteFolder={onDeleteFolder}
        onDeleteTag={onDeleteTag}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        themeMode={themeMode}
        onThemeModeChange={onThemeModeChange}
        onImport={onImport}
        onExport={onExport}
      />

      {/* Search Dialog */}
      <Dialog
        open={searchOpen}
        onClose={handleSearchClose}
        fullScreen
        PaperProps={{
          sx: { bgcolor: 'background.default' },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
          <IconButton onClick={handleSearchClose} edge="start">
            <Close />
          </IconButton>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (e.target.value) {
                onFilterChange('search');
              } else {
                onFilterChange('all');
              }
            }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 1 }}
          />
        </DialogTitle>
        <DialogContent sx={{ p: 2, pt: 0 }}>
          {searchQuery ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Showing results for "{searchQuery}"
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Start typing to search your bookmarks
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Account Menu Dialog for non-signed-in users */}
      <Dialog
        open={accountMenuOpen && !isSignedIn}
        onClose={() => setAccountMenuOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Sign In to Sync</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create an account to sync your bookmarks across devices and access them from anywhere.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <ClerkLoaded>
              <SignUpButton mode="modal">
                <ClerkButton
                  variant="contained"
                  fullWidth
                  onClick={() => setAccountMenuOpen(false)}
                >
                  Create Account
                </ClerkButton>
              </SignUpButton>
              <SignInButton mode="modal">
                <ClerkButton
                  variant="outlined"
                  fullWidth
                  onClick={() => setAccountMenuOpen(false)}
                >
                  Sign In
                </ClerkButton>
              </SignInButton>
            </ClerkLoaded>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

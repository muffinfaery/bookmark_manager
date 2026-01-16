'use client';

import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
} from '@mui/material';
import {
  Settings,
  GridView,
  ViewList,
  LightMode,
  DarkMode,
  SettingsBrightness,
  FileUpload,
  FileDownload,
  Close,
} from '@mui/icons-material';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  themeMode: 'light' | 'dark' | 'system';
  onThemeModeChange: (mode: 'light' | 'dark' | 'system') => void;
  onImport: () => void;
  onExport: () => void;
}

export default function SettingsDrawer({
  open,
  onClose,
  viewMode,
  onViewModeChange,
  themeMode,
  onThemeModeChange,
  onImport,
  onExport,
}: SettingsDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings />
          <Typography variant="h6" fontWeight={600}>
            Settings
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Settings List */}
      <List sx={{ flex: 1 }}>
        {/* View Mode */}
        <ListItem sx={{ py: 2 }}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              View Mode
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && onViewModeChange(value)}
              size="small"
              fullWidth
            >
              <ToggleButton value="grid">
                <GridView sx={{ mr: 1 }} fontSize="small" />
                Grid
              </ToggleButton>
              <ToggleButton value="list">
                <ViewList sx={{ mr: 1 }} fontSize="small" />
                List
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </ListItem>

        {/* Theme */}
        <ListItem sx={{ py: 2 }}>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Theme
            </Typography>
            <ToggleButtonGroup
              value={themeMode}
              exclusive
              onChange={(_, value) => value && onThemeModeChange(value)}
              size="small"
              fullWidth
            >
              <ToggleButton value="light">
                <LightMode sx={{ mr: 0.5 }} fontSize="small" />
                Light
              </ToggleButton>
              <ToggleButton value="dark">
                <DarkMode sx={{ mr: 0.5 }} fontSize="small" />
                Dark
              </ToggleButton>
              <ToggleButton value="system">
                <SettingsBrightness sx={{ mr: 0.5 }} fontSize="small" />
                Auto
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </ListItem>

        <Divider sx={{ my: 1 }} />

        {/* Import */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              onImport();
              onClose();
            }}
          >
            <ListItemIcon>
              <FileUpload />
            </ListItemIcon>
            <ListItemText
              primary="Import Bookmarks"
              secondary="Import from JSON or Chrome HTML"
            />
          </ListItemButton>
        </ListItem>

        {/* Export */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              onExport();
              onClose();
            }}
          >
            <ListItemIcon>
              <FileDownload />
            </ListItemIcon>
            <ListItemText
              primary="Export Bookmarks"
              secondary="Download your bookmarks as JSON"
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}

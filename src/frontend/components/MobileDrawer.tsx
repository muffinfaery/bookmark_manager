'use client';

import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Divider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Bookmark,
  Star,
  Folder,
  FolderOpen,
  LocalOffer,
  ExpandMore,
  ExpandLess,
  Add,
  Delete,
  Settings,
  GridView,
  ViewList,
  LightMode,
  DarkMode,
  SettingsBrightness,
  FileUpload,
  FileDownload,
  Check,
} from '@mui/icons-material';
import { Folder as FolderType, Tag, FilterType } from '@/types';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  folders: FolderType[];
  tags: Tag[];
  filterType: FilterType;
  selectedFolderId: string | null;
  selectedTagId: string | null;
  onFilterChange: (type: FilterType) => void;
  onFolderSelect: (id: string | null) => void;
  onTagSelect: (id: string | null) => void;
  onCreateFolder: (name: string) => Promise<unknown>;
  onDeleteFolder: (id: string) => void;
  onDeleteTag: (id: string) => void;
  // Settings
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  themeMode: 'light' | 'dark' | 'system';
  onThemeModeChange: (mode: 'light' | 'dark' | 'system') => void;
  onImport: () => void;
  onExport: () => void;
}

type ThemeMode = 'light' | 'dark' | 'system';

const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'light', label: 'Light', icon: <LightMode fontSize="small" /> },
  { mode: 'dark', label: 'Dark', icon: <DarkMode fontSize="small" /> },
  { mode: 'system', label: 'System', icon: <SettingsBrightness fontSize="small" /> },
];

export default function MobileDrawer({
  open,
  onClose,
  folders,
  tags,
  filterType,
  selectedFolderId,
  selectedTagId,
  onFilterChange,
  onFolderSelect,
  onTagSelect,
  onCreateFolder,
  onDeleteFolder,
  onDeleteTag,
  viewMode,
  onViewModeChange,
  themeMode,
  onThemeModeChange,
  onImport,
  onExport,
}: MobileDrawerProps) {
  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);

  // Common styles for rounded list item buttons
  const listItemButtonSx = {
    borderRadius: 1,
    mx: 1.5,
    my: 0.25,
  };

  const nestedListItemButtonSx = {
    borderRadius: 1,
    mx: 1.5,
    my: 0.25,
    pl: 4,
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '80vh',
        },
      }}
    >
      {/* Handle bar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 48,
            height: 4,
            bgcolor: 'action.disabled',
            borderRadius: 2,
          }}
        />
      </Box>

      {/* Header */}
      <Box sx={{ px: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Bookmarks
        </Typography>
      </Box>

      <Divider />

      {/* Navigation List */}
      <List sx={{ overflow: 'auto', flex: 1, py: 1 }}>
        {/* All Bookmarks */}
        <ListItem disablePadding>
          <ListItemButton
            selected={filterType === 'all'}
            onClick={() => onFilterChange('all')}
            sx={listItemButtonSx}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Bookmark color={filterType === 'all' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="All Bookmarks" />
          </ListItemButton>
        </ListItem>

        {/* Favorites */}
        <ListItem disablePadding>
          <ListItemButton
            selected={filterType === 'favorites'}
            onClick={() => onFilterChange('favorites')}
            sx={listItemButtonSx}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Star color={filterType === 'favorites' ? 'warning' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Favorites" />
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1.5, mx: 1.5 }} />

        {/* Folders Section */}
        <ListItem
          disablePadding
          secondaryAction={
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setShowNewFolderInput(!showNewFolderInput);
              }}
              sx={{ mr: 1 }}
            >
              <Add fontSize="small" />
            </IconButton>
          }
        >
          <ListItemButton onClick={() => setFoldersExpanded(!foldersExpanded)} sx={listItemButtonSx}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              {foldersExpanded ? <FolderOpen /> : <Folder />}
            </ListItemIcon>
            <ListItemText primary="Folders" />
            {foldersExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={foldersExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* New Folder Input */}
            {showNewFolderInput && (
              <ListItem sx={{ pl: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder();
                    if (e.key === 'Escape') {
                      setShowNewFolderInput(false);
                      setNewFolderName('');
                    }
                  }}
                  autoFocus
                  InputProps={{
                    endAdornment: (
                      <IconButton size="small" onClick={handleCreateFolder}>
                        <Check fontSize="small" />
                      </IconButton>
                    ),
                  }}
                />
              </ListItem>
            )}

            {/* Uncategorized */}
            <ListItem disablePadding>
              <ListItemButton
                sx={nestedListItemButtonSx}
                selected={filterType === 'folder' && selectedFolderId === null}
                onClick={() => {
                  onFilterChange('folder');
                  onFolderSelect(null);
                }}
              >
                <ListItemText primary="Uncategorized" />
              </ListItemButton>
            </ListItem>

            {/* Folder Items */}
            {folders.map((folder) => (
              <ListItem
                key={folder.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder.id);
                    }}
                    sx={{ mr: 0.5 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  sx={nestedListItemButtonSx}
                  selected={filterType === 'folder' && selectedFolderId === folder.id}
                  onClick={() => {
                    onFilterChange('folder');
                    onFolderSelect(folder.id);
                  }}
                >
                  <ListItemText
                    primary={folder.name}
                    secondary={`${folder.bookmarkCount || 0} bookmarks`}
                  />
                </ListItemButton>
              </ListItem>
            ))}

            {folders.length === 0 && !showNewFolderInput && (
              <ListItem sx={{ pl: 5, py: 0.5 }}>
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  No folders yet
                </Typography>
              </ListItem>
            )}
          </List>
        </Collapse>

        <Divider sx={{ my: 1.5, mx: 1.5 }} />

        {/* Tags Section */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setTagsExpanded(!tagsExpanded)} sx={listItemButtonSx}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LocalOffer />
            </ListItemIcon>
            <ListItemText primary="Tags" />
            {tagsExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={tagsExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {tags.map((tag) => (
              <ListItem
                key={tag.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTag(tag.id);
                    }}
                    sx={{ mr: 0.5 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  sx={nestedListItemButtonSx}
                  selected={filterType === 'tag' && selectedTagId === tag.id}
                  onClick={() => {
                    onFilterChange('tag');
                    onTagSelect(tag.id);
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: tag.color || 'primary.main',
                      mr: 1.5,
                    }}
                  />
                  <ListItemText
                    primary={tag.name}
                    secondary={`${tag.bookmarkCount || 0} bookmarks`}
                  />
                </ListItemButton>
              </ListItem>
            ))}

            {tags.length === 0 && (
              <ListItem sx={{ pl: 5, py: 0.5 }}>
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  No tags yet
                </Typography>
              </ListItem>
            )}
          </List>
        </Collapse>

        <Divider sx={{ my: 1.5, mx: 1.5 }} />

        {/* Settings Section */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setSettingsExpanded(!settingsExpanded)} sx={listItemButtonSx}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
            {settingsExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={settingsExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* View Mode */}
            <ListItem sx={{ pl: 4, py: 2 }}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
            <ListItem sx={{ pl: 4, py: 1 }}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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

            <Divider sx={{ my: 1, mx: 2 }} />

            {/* Import */}
            <ListItem disablePadding>
              <ListItemButton
                sx={nestedListItemButtonSx}
                onClick={() => {
                  onImport();
                  onClose();
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FileUpload />
                </ListItemIcon>
                <ListItemText primary="Import Bookmarks" />
              </ListItemButton>
            </ListItem>

            {/* Export */}
            <ListItem disablePadding>
              <ListItemButton
                sx={nestedListItemButtonSx}
                onClick={() => {
                  onExport();
                  onClose();
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <FileDownload />
                </ListItemIcon>
                <ListItemText primary="Export Bookmarks" />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
}

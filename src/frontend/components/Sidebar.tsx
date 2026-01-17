'use client';

import { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Collapse,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Bookmark,
  Star,
  Folder,
  FolderOpen,
  LocalOffer,
  Add,
  ExpandLess,
  ExpandMore,
  Delete,
  Settings,
  ChevronLeft,
} from '@mui/icons-material';
import { Folder as FolderType, Tag, FilterType } from '@/types';

interface SidebarProps {
  folders: FolderType[];
  tags: Tag[];
  filterType: FilterType;
  selectedFolderId: string | null;
  selectedTagId: string | null;
  collapsed: boolean;
  onFilterChange: (type: FilterType) => void;
  onFolderSelect: (folderId: string | null) => void;
  onTagSelect: (tagId: string | null) => void;
  onCreateFolder: (name: string) => Promise<unknown>;
  onDeleteFolder: (id: string) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
  onOpenSettings: () => void;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  folders,
  tags,
  filterType,
  selectedFolderId,
  selectedTagId,
  collapsed,
  onFilterChange,
  onFolderSelect,
  onTagSelect,
  onCreateFolder,
  onDeleteFolder,
  onDeleteTag,
  onOpenSettings,
  onToggleCollapse,
}: SidebarProps) {
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Common styles for list item buttons with rounded corners and spacing
  const listItemButtonSx = {
    borderRadius: 1,
    mx: 1,
    my: 0.25,
    justifyContent: collapsed ? 'center' : 'flex-start',
  };

  const nestedListItemButtonSx = {
    borderRadius: 1,
    mx: 1,
    my: 0.25,
    pl: 4,
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setNewFolderDialogOpen(false);
    }
  };

  return (
    <Box
      sx={{
        width: collapsed ? 64 : 260,
        minWidth: collapsed ? 64 : 260,
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          px: collapsed ? 1 : 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          minHeight: 48,
          cursor: 'pointer',
        }}
        onClick={onToggleCollapse}
      >
        {!collapsed && (
          <Typography variant="h6" fontWeight={600} color="text.secondary">
            Browse
          </Typography>
        )}
        <IconButton
          size="small"
          sx={{
            color: 'text.secondary',
            borderRadius: 1,
            width: 40,
            height: 40,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ChevronLeft
            sx={{
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </IconButton>
      </Box>

      <List component="nav" dense sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            selected={filterType === 'all'}
            onClick={() => {
              onFilterChange('all');
              onFolderSelect(null);
              onTagSelect(null);
            }}
            sx={listItemButtonSx}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40 }}>
              <Bookmark />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="All Bookmarks" />}
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            selected={filterType === 'favorites'}
            onClick={() => {
              onFilterChange('favorites');
              onFolderSelect(null);
              onTagSelect(null);
            }}
            sx={listItemButtonSx}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40 }}>
              <Star />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Favorites" />}
          </ListItemButton>
        </ListItem>

        <Divider sx={{ my: 1.5, mx: 1 }} />

        {/* Folders */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => setFoldersOpen(!foldersOpen)}
            sx={listItemButtonSx}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40 }}>
              <Folder />
            </ListItemIcon>
            {!collapsed && (
              <>
                <ListItemText primary="Folders" />
                {foldersOpen ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>
          {!collapsed && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setNewFolderDialogOpen(true);
              }}
              sx={{ mr: 1.5 }}
            >
              <Add fontSize="small" />
            </IconButton>
          )}
        </ListItem>

        {!collapsed && (
          <Collapse in={foldersOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense>
              <ListItem disablePadding>
                <ListItemButton
                  sx={nestedListItemButtonSx}
                  selected={filterType === 'folder' && selectedFolderId === null}
                  onClick={() => {
                    onFilterChange('folder');
                    onFolderSelect(null);
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FolderOpen fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Uncategorized" />
                </ListItemButton>
              </ListItem>

              {folders.map((folder) => (
                <ListItem
                  key={folder.id}
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge="end"
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
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <FolderOpen fontSize="small" sx={{ color: folder.color || undefined }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={folder.name}
                      secondary={`${folder.bookmarkCount} items`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}

              {folders.length === 0 && (
                <ListItem sx={{ pl: 5, py: 0.5 }}>
                  <ListItemText
                    secondary="No folders yet"
                    sx={{ fontStyle: 'italic' }}
                  />
                </ListItem>
              )}
            </List>
          </Collapse>
        )}

        <Divider sx={{ my: 1.5, mx: 1 }} />

        {/* Tags */}
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => setTagsOpen(!tagsOpen)}
            sx={listItemButtonSx}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40 }}>
              <LocalOffer />
            </ListItemIcon>
            {!collapsed && (
              <>
                <ListItemText primary="Tags" />
                {tagsOpen ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {!collapsed && (
          <Collapse in={tagsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding dense>
              {tags.map((tag) => (
                <ListItem
                  key={tag.id}
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge="end"
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
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <LocalOffer fontSize="small" sx={{ color: tag.color || undefined }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={tag.name}
                      secondary={`${tag.bookmarkCount} items`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}

              {tags.length === 0 && (
                <ListItem sx={{ pl: 5, py: 0.5 }}>
                  <ListItemText
                    secondary="No tags yet"
                    sx={{ fontStyle: 'italic' }}
                  />
                </ListItem>
              )}
            </List>
          </Collapse>
        )}
      </List>

      {/* Settings Button */}
      <Divider sx={{ mx: 1 }} />
      <List component="nav" dense sx={{ py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={onOpenSettings}
            sx={listItemButtonSx}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 40 }}>
              <Settings />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Settings" />}
          </ListItemButton>
        </ListItem>
      </List>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onClose={() => setNewFolderDialogOpen(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateFolder();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFolderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateFolder} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

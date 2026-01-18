'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  TextField,
  Box,
  Alert,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { Folder, Bookmark } from '@/types';

interface DeleteFolderDialogProps {
  open: boolean;
  folder: Folder | null;
  folders: Folder[];
  bookmarks: Bookmark[];
  onClose: () => void;
  onConfirm: (folderId: string, moveToFolderId: string | null) => Promise<void>;
}

export default function DeleteFolderDialog({
  open,
  folder,
  folders,
  bookmarks,
  onClose,
  onConfirm,
}: DeleteFolderDialogProps) {
  const [moveBookmarks, setMoveBookmarks] = useState(true);
  const [targetFolder, setTargetFolder] = useState<Folder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get bookmarks in this folder
  const affectedBookmarks = useMemo(() => {
    if (!folder) return [];
    return bookmarks.filter((b) => b.folderId === folder.id);
  }, [folder, bookmarks]);

  // Get available folders (excluding the one being deleted)
  const availableFolders = useMemo(() => {
    if (!folder) return folders;
    return folders.filter((f) => f.id !== folder.id);
  }, [folder, folders]);

  const handleClose = () => {
    if (isDeleting) return;
    setMoveBookmarks(true);
    setTargetFolder(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!folder) return;

    setIsDeleting(true);
    try {
      // If moving bookmarks, pass the target folder ID (null means uncategorized)
      // If not moving, pass null to indicate bookmarks should become uncategorized
      const moveToFolderId = moveBookmarks ? (targetFolder?.id ?? null) : null;
      await onConfirm(folder.id, moveToFolderId);
      handleClose();
    } catch (error) {
      // Error handling is done by the parent
    } finally {
      setIsDeleting(false);
    }
  };

  if (!folder) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        Delete Folder
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete the folder <strong>"{folder.name}"</strong>?
        </Typography>

        {affectedBookmarks.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              This folder contains <strong>{affectedBookmarks.length}</strong> bookmark
              {affectedBookmarks.length !== 1 ? 's' : ''}.
            </Alert>

            <FormControlLabel
              control={
                <Checkbox
                  checked={moveBookmarks}
                  onChange={(e) => setMoveBookmarks(e.target.checked)}
                />
              }
              label="Move bookmarks to another folder"
            />

            {moveBookmarks && (
              <Autocomplete
                sx={{ mt: 2 }}
                options={availableFolders}
                getOptionLabel={(option) => option.name}
                value={targetFolder}
                onChange={(_, newValue) => setTargetFolder(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Move to folder"
                    placeholder="Select folder (leave empty for Uncategorized)"
                    size="small"
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            )}

            {moveBookmarks && !targetFolder && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Bookmarks will be moved to "Uncategorized" if no folder is selected.
              </Typography>
            )}

            {!moveBookmarks && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Bookmarks will remain but will become uncategorized.
              </Alert>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This folder is empty.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Folder'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

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
  Chip,
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { Tag, Bookmark } from '@/types';

interface DeleteTagDialogProps {
  open: boolean;
  tag: Tag | null;
  tags: Tag[];
  bookmarks: Bookmark[];
  onClose: () => void;
  onConfirm: (tagId: string, replaceWithTagId: string | null | undefined) => Promise<void>;
}

export default function DeleteTagDialog({
  open,
  tag,
  tags,
  bookmarks,
  onClose,
  onConfirm,
}: DeleteTagDialogProps) {
  const [replaceTag, setReplaceTag] = useState(false);
  const [targetTag, setTargetTag] = useState<Tag | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get bookmarks with this tag
  const affectedBookmarks = useMemo(() => {
    if (!tag) return [];
    return bookmarks.filter((b) => b.tags?.some((t) => t.id === tag.id));
  }, [tag, bookmarks]);

  // Get available tags (excluding the one being deleted)
  const availableTags = useMemo(() => {
    if (!tag) return tags;
    return tags.filter((t) => t.id !== tag.id);
  }, [tag, tags]);

  const handleClose = () => {
    if (isDeleting) return;
    setReplaceTag(false);
    setTargetTag(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!tag) return;

    setIsDeleting(true);
    try {
      // If replacing tag, pass the target tag ID
      const replaceWithTagId = replaceTag ? (targetTag?.id ?? null) : null;
      await onConfirm(tag.id, replaceTag ? replaceWithTagId : undefined);
      handleClose();
    } catch (error) {
      // Error handling is done by the parent
    } finally {
      setIsDeleting(false);
    }
  };

  if (!tag) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        Delete Tag
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" component="div" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
          Are you sure you want to delete the tag
          <Chip
            label={tag.name}
            size="small"
            sx={{
              backgroundColor: tag.color || undefined,
              color: tag.color ? '#fff' : undefined,
            }}
          />
          ?
        </Typography>

        {affectedBookmarks.length > 0 ? (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>{affectedBookmarks.length}</strong> bookmark
              {affectedBookmarks.length !== 1 ? 's' : ''} currently use
              {affectedBookmarks.length === 1 ? 's' : ''} this tag.
            </Alert>

            <FormControlLabel
              control={
                <Checkbox
                  checked={replaceTag}
                  onChange={(e) => setReplaceTag(e.target.checked)}
                />
              }
              label="Replace with another tag"
            />

            {replaceTag && (
              <Autocomplete
                sx={{ mt: 2 }}
                options={availableTags}
                getOptionLabel={(option) => option.name}
                value={targetTag}
                onChange={(_, newValue) => setTargetTag(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Replace with tag"
                    placeholder="Select a tag"
                    size="small"
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li key={key} {...otherProps}>
                      <Chip
                        label={option.name}
                        size="small"
                        sx={{
                          backgroundColor: option.color || undefined,
                          color: option.color ? '#fff' : undefined,
                        }}
                      />
                    </li>
                  );
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            )}

            {replaceTag && !targetTag && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Please select a tag to replace with, or uncheck to simply remove the tag.
              </Typography>
            )}

            {!replaceTag && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                The tag will be removed from all bookmarks.
              </Alert>
            )}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No bookmarks are using this tag.
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
          disabled={isDeleting || (replaceTag && !targetTag)}
        >
          {isDeleting ? 'Deleting...' : 'Delete Tag'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

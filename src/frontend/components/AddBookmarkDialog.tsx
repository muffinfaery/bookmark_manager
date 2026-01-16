'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Autocomplete,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Bookmark, Folder, Tag, CreateBookmarkDto, UpdateBookmarkDto } from '@/types';

interface AddBookmarkDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (dto: CreateBookmarkDto | UpdateBookmarkDto) => Promise<void>;
  folders: Folder[];
  tags: Tag[];
  editingBookmark?: Bookmark | null;
  onFetchMetadata?: (url: string) => Promise<{ title?: string; description?: string; favicon?: string }>;
  onCreateFolder?: (name: string) => Promise<void>;
}

const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function AddBookmarkDialog({
  open,
  onClose,
  onSave,
  folders,
  tags,
  editingBookmark,
  onFetchMetadata,
  onCreateFolder,
}: AddBookmarkDialogProps) {
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [favicon, setFavicon] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [error, setError] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);

  useEffect(() => {
    if (editingBookmark) {
      setUrl(editingBookmark.url);
      setTitle(editingBookmark.title);
      setDescription(editingBookmark.description || '');
      setFavicon(editingBookmark.favicon || '');
      setSelectedFolderId(editingBookmark.folderId || '');
      setSelectedTags(editingBookmark.tags.map((t) => t.name));
    } else {
      resetForm();
    }
  }, [editingBookmark, open]);

  const resetForm = () => {
    setUrl('');
    setUrlError('');
    setTitle('');
    setDescription('');
    setFavicon('');
    setSelectedFolderId('');
    setSelectedTags([]);
    setNewTag('');
    setError('');
    setShowNewFolderInput(false);
    setNewFolderName('');
  };

  const validateUrl = (value: string) => {
    if (!value.trim()) {
      setUrlError('');
      return;
    }
    if (!isValidUrl(value)) {
      setUrlError('Please enter a valid URL (e.g., https://example.com)');
    } else {
      setUrlError('');
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    validateUrl(value);
  };

  const handleUrlBlur = async () => {
    validateUrl(url);
    if (!url || title || !onFetchMetadata || !isValidUrl(url)) return;

    setFetchingMetadata(true);
    try {
      const metadata = await onFetchMetadata(url);
      if (metadata.title && !title) setTitle(metadata.title);
      if (metadata.description && !description) setDescription(metadata.description);
      if (metadata.favicon && !favicon) setFavicon(metadata.favicon);
    } catch (err) {
      // Silently fail - user can still enter details manually
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleSave = async () => {
    if (!url.trim()) {
      setError('URL is required');
      return;
    }
    if (!isValidUrl(url.trim())) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dto: CreateBookmarkDto | UpdateBookmarkDto = {
        url: url.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        favicon: favicon.trim() || undefined,
        folderId: selectedFolderId || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      };
      await onSave(dto);
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bookmark');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleTagsBlur = () => {
    if (newTag.trim()) {
      handleAddTag(newTag.trim());
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !onCreateFolder) return;

    setCreatingFolder(true);
    try {
      await onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderInput(false);
    } catch (err) {
      // Error handled by parent
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="URL"
            value={url}
            onChange={handleUrlChange}
            onBlur={handleUrlBlur}
            placeholder="https://example.com"
            fullWidth
            required
            disabled={!!editingBookmark}
            error={!!urlError}
            helperText={urlError}
            InputProps={{
              endAdornment: fetchingMetadata ? (
                <CircularProgress size={20} />
              ) : null,
            }}
          />

          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />

          {showNewFolderInput ? (
            <TextField
              label="New Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              fullWidth
              autoFocus
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim() || creatingFolder}
                    >
                      {creatingFolder ? <CircularProgress size={20} /> : 'Create'}
                    </Button>
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => {
                        setShowNewFolderInput(false);
                        setNewFolderName('');
                      }}
                    >
                      Cancel
                    </Button>
                  </InputAdornment>
                ),
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateFolder();
                }
                if (e.key === 'Escape') {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }
              }}
            />
          ) : (
            <FormControl fullWidth>
              <InputLabel>Folder</InputLabel>
              <Select
                value={selectedFolderId}
                label="Folder"
                onChange={(e) => setSelectedFolderId(e.target.value)}
                endAdornment={
                  onCreateFolder && (
                    <InputAdornment position="end" sx={{ mr: 2 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowNewFolderInput(true);
                        }}
                        title="Create new folder"
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              >
                <MenuItem value="">
                  <em>No folder</em>
                </MenuItem>
                {folders.map((folder) => (
                  <MenuItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Autocomplete
            multiple
            freeSolo
            options={tags.map((t) => t.name)}
            value={selectedTags}
            onChange={(_, newValue) => setSelectedTags(newValue)}
            inputValue={newTag}
            onInputChange={(_, newInputValue) => setNewTag(newInputValue)}
            onBlur={handleTagsBlur}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  onDelete={() => handleRemoveTag(option)}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Add tags..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTag.trim()) {
                    e.preventDefault();
                    handleAddTag(newTag.trim());
                  }
                }}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !!urlError}
        >
          {loading ? <CircularProgress size={24} /> : editingBookmark ? 'Save Changes' : 'Add Bookmark'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

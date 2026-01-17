'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Fuse from 'fuse.js';
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
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  createFilterOptions,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { Bookmark, Folder, Tag, CreateBookmarkDto, UpdateBookmarkDto } from '@/types';

interface FolderOption {
  id: string;
  name: string;
  inputValue?: string;
}

interface AddBookmarkDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (dto: CreateBookmarkDto | UpdateBookmarkDto) => Promise<void>;
  folders: Folder[];
  tags: Tag[];
  editingBookmark?: Bookmark | null;
  onFetchMetadata?: (url: string) => Promise<{ title?: string; description?: string; favicon?: string }>;
  onCreateFolder?: (name: string) => Promise<Folder>;
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
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderError, setFolderError] = useState('');
  const tagsInputRef = useRef<HTMLInputElement>(null);

  // Configure Fuse.js for fuzzy folder search
  const folderFuse = useMemo(() => {
    return new Fuse(folders, {
      keys: ['name'],
      threshold: 0.4,
      ignoreLocation: true,
    });
  }, [folders]);

  // Get selected folder object
  const selectedFolder = useMemo(() => {
    return folders.find((f) => f.id === selectedFolderId) || null;
  }, [folders, selectedFolderId]);

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
    setNewFolderName('');
    setFolderError('');
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

  const handleCreateFolder = async (name: string): Promise<Folder | null> => {
    if (!name.trim() || !onCreateFolder) return null;

    setCreatingFolder(true);
    setFolderError('');
    try {
      const newFolder = await onCreateFolder(name.trim());
      setSelectedFolderId(newFolder.id);
      setNewFolderName('');
      // Focus the tags input after successful folder creation
      setTimeout(() => {
        tagsInputRef.current?.focus();
      }, 100);
      return newFolder;
    } catch (err) {
      setFolderError('Failed to create folder. Please try again.');
      return null;
    } finally {
      setCreatingFolder(false);
    }
  };

  // Custom filter for folder autocomplete using Fuse.js
  const filterFolderOptions = (
    options: FolderOption[],
    state: { inputValue: string }
  ): FolderOption[] => {
    const { inputValue } = state;

    if (!inputValue.trim()) {
      return options;
    }

    const results = folderFuse.search(inputValue);
    const filtered = results.map((result) => result.item as FolderOption);

    // Add "Create new folder" option if no exact match exists
    const exactMatch = options.some(
      (opt) => opt.name.toLowerCase() === inputValue.toLowerCase()
    );
    if (!exactMatch && onCreateFolder) {
      filtered.push({
        id: '',
        name: `Create "${inputValue}"`,
        inputValue: inputValue,
      });
    }

    return filtered;
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

          <Autocomplete
            options={folders as FolderOption[]}
            value={selectedFolder}
            onChange={async (_, newValue) => {
              setFolderError(''); // Clear any previous error
              if (typeof newValue === 'string') {
                // User typed and pressed enter
                const existing = folders.find(
                  (f) => f.name.toLowerCase() === newValue.toLowerCase()
                );
                if (existing) {
                  setSelectedFolderId(existing.id);
                } else if (onCreateFolder) {
                  await handleCreateFolder(newValue);
                }
              } else if (newValue && newValue.inputValue) {
                // User selected "Create new folder" option
                await handleCreateFolder(newValue.inputValue);
              } else if (newValue) {
                // User selected existing folder
                setSelectedFolderId(newValue.id);
              } else {
                // User cleared selection
                setSelectedFolderId('');
              }
            }}
            filterOptions={filterFolderOptions}
            getOptionLabel={(option) => {
              if (typeof option === 'string') return option;
              return option.inputValue ? option.name : option.name;
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            freeSolo
            selectOnFocus
            clearOnBlur
            handleHomeEndKeys
            loading={creatingFolder}
            renderOption={(props, option) => {
              const { key, ...restProps } = props;
              return (
                <li key={option.id || `create-${option.inputValue}`} {...restProps}>
                  {option.inputValue ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Add fontSize="small" color="primary" />
                      {option.name}
                    </Box>
                  ) : (
                    option.name
                  )}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Folder"
                placeholder="Search or create folder..."
                error={!!folderError}
                helperText={folderError}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {creatingFolder ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

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
                inputRef={tagsInputRef}
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

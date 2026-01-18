'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { CloudUpload, Code, Language, CheckCircle, Warning } from '@mui/icons-material';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (data: ImportData) => Promise<void>;
  existingUrls?: string[];
}

interface ImportData {
  bookmarks: ImportedBookmark[];
  folders: ImportedFolder[];
}

interface ImportedBookmark {
  url: string;
  title: string;
  description?: string;
  folderName?: string;
  tags?: string[];
  isFavorite?: boolean;
}

interface ImportedFolder {
  name: string;
}

type ImportFormat = 'json' | 'chrome';

// Parse Chrome bookmark HTML export
function parseChromeBookmarks(html: string): ImportData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const bookmarks: ImportedBookmark[] = [];
  const folders: Set<string> = new Set();

  function parseNode(node: Element, currentFolder: string | null) {
    const children = node.children;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      if (child.tagName === 'DT') {
        const h3 = child.querySelector(':scope > H3');
        const a = child.querySelector(':scope > A');
        const dl = child.querySelector(':scope > DL');

        if (h3) {
          // This is a folder
          const folderName = h3.textContent?.trim() || 'Unnamed Folder';
          folders.add(folderName);

          if (dl) {
            parseNode(dl, folderName);
          }
        } else if (a) {
          // This is a bookmark
          const url = a.getAttribute('href') || '';
          const title = a.textContent?.trim() || url;

          if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            bookmarks.push({
              url,
              title,
              folderName: currentFolder || undefined,
            });
          }
        }
      } else if (child.tagName === 'DL') {
        parseNode(child, currentFolder);
      }
    }
  }

  const rootDL = doc.querySelector('DL');
  if (rootDL) {
    parseNode(rootDL, null);
  }

  return {
    bookmarks,
    folders: Array.from(folders).map(name => ({ name })),
  };
}

export default function ImportDialog({ open, onClose, onImport, existingUrls = [] }: ImportDialogProps) {
  const [format, setFormat] = useState<ImportFormat>('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<ImportData | null>(null);
  const [duplicateUrls, setDuplicateUrls] = useState<string[]>([]);
  const [includeDuplicates, setIncludeDuplicates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter folders to only those with bookmarks
  const foldersWithBookmarks = preview
    ? preview.folders.filter((folder) =>
        preview.bookmarks.some((b) => b.folderName === folder.name)
      )
    : [];

  // Count unique and duplicate bookmarks
  const uniqueBookmarks = preview
    ? preview.bookmarks.filter((b) => !existingUrls.includes(b.url))
    : [];
  const duplicateBookmarks = preview
    ? preview.bookmarks.filter((b) => existingUrls.includes(b.url))
    : [];

  const handleFormatChange = (_: React.MouseEvent<HTMLElement>, newFormat: ImportFormat | null) => {
    if (newFormat) {
      setFormat(newFormat);
      setPreview(null);
      setError('');
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setPreview(null);

    try {
      const text = await file.text();

      if (format === 'json') {
        const data = JSON.parse(text);
        // Validate JSON structure
        if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
          throw new Error('Invalid JSON format. Expected { bookmarks: [...], folders: [...] }');
        }
        setPreview({
          bookmarks: data.bookmarks || [],
          folders: data.folders || [],
        });
      } else {
        // Parse Chrome HTML
        const data = parseChromeBookmarks(text);
        if (data.bookmarks.length === 0) {
          throw new Error('No bookmarks found in the HTML file');
        }
        setPreview(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!preview) return;

    setLoading(true);
    setError('');

    try {
      // Filter out duplicates unless user opted to include them
      const bookmarksToImport = includeDuplicates
        ? preview.bookmarks
        : uniqueBookmarks;

      // Only include folders that have bookmarks being imported
      const folderNamesInUse = new Set(
        bookmarksToImport.map((b) => b.folderName).filter(Boolean)
      );
      const foldersToImport = preview.folders.filter((f) =>
        folderNamesInUse.has(f.name)
      );

      await onImport({
        bookmarks: bookmarksToImport,
        folders: foldersToImport,
      });
      onClose();
      resetState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setFormat('json');
    setPreview(null);
    setError('');
    setLoading(false);
    setDuplicateUrls([]);
    setIncludeDuplicates(false);
  };

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth disableEscapeKeyDown={loading}>
      <DialogTitle>Import Bookmarks</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Select Import Format
            </Typography>
            <ToggleButtonGroup
              value={format}
              exclusive
              onChange={handleFormatChange}
              fullWidth
            >
              <ToggleButton value="json">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Code />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Bookmark Manager JSON
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Native format from this app
                    </Typography>
                  </Box>
                </Box>
              </ToggleButton>
              <ToggleButton value="chrome">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Language />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Chrome HTML Export
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      From Chrome/Edge/Brave
                    </Typography>
                  </Box>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {format === 'json' ? 'Select JSON File' : 'Select Bookmarks HTML File'}
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept={format === 'json' ? '.json' : '.html,.htm'}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="import-file-input"
            />
            <label htmlFor="import-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
              >
                Choose File
              </Button>
            </label>
          </Box>

          {preview && (
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {loading ? (
                  <CircularProgress size={16} />
                ) : (
                  <CheckCircle color="success" fontSize="small" />
                )}
                {loading ? 'Importing...' : 'Preview'}
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Typography variant="h6" color="primary">
                      {uniqueBookmarks.length}
                    </Typography>
                  </ListItemIcon>
                  <ListItemText primary="New bookmarks to import" />
                </ListItem>
                {duplicateBookmarks.length > 0 && (
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${duplicateBookmarks.length} duplicate URLs found`}
                      secondary="These already exist in your bookmarks"
                    />
                  </ListItem>
                )}
                {foldersWithBookmarks.length > 0 && (
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Typography variant="h6" color="primary">
                        {foldersWithBookmarks.length}
                      </Typography>
                    </ListItemIcon>
                    <ListItemText primary="Folders with items to create" />
                  </ListItem>
                )}
              </List>
              {duplicateBookmarks.length > 0 && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeDuplicates}
                      onChange={(e) => setIncludeDuplicates(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Include duplicate URLs anyway
                    </Typography>
                  }
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!preview || loading || (uniqueBookmarks.length === 0 && !includeDuplicates)}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {loading ? 'Importing...' : `Import ${includeDuplicates ? preview?.bookmarks.length || 0 : uniqueBookmarks.length} Bookmarks`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

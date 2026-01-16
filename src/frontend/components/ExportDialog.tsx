'use client';

import { useState } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { Code, Language } from '@mui/icons-material';
import { Bookmark, Folder } from '@/types';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: () => Promise<{ bookmarks: Bookmark[]; folders: Folder[] }>;
}

type ExportFormat = 'json' | 'chrome';

function generateChromeBookmarkHtml(bookmarks: Bookmark[], folders: Folder[]): string {
  const timestamp = Math.floor(Date.now() / 1000);

  // Group bookmarks by folder
  const bookmarksByFolder: Record<string, Bookmark[]> = {};
  const uncategorizedBookmarks: Bookmark[] = [];

  bookmarks.forEach((bookmark) => {
    if (bookmark.folderId && bookmark.folderName) {
      if (!bookmarksByFolder[bookmark.folderName]) {
        bookmarksByFolder[bookmark.folderName] = [];
      }
      bookmarksByFolder[bookmark.folderName].push(bookmark);
    } else {
      uncategorizedBookmarks.push(bookmark);
    }
  });

  // Escape HTML entities
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  // Generate bookmark entry
  const generateBookmarkEntry = (bookmark: Bookmark): string => {
    const addDate = bookmark.createdAt
      ? Math.floor(new Date(bookmark.createdAt).getTime() / 1000)
      : timestamp;
    return `        <DT><A HREF="${escapeHtml(bookmark.url)}" ADD_DATE="${addDate}">${escapeHtml(bookmark.title)}</A>`;
  };

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="${timestamp}" LAST_MODIFIED="${timestamp}" PERSONAL_TOOLBAR_FOLDER="true">Bookmarks Bar</H3>
    <DL><p>
`;

  // Add folders with their bookmarks
  Object.entries(bookmarksByFolder).forEach(([folderName, folderBookmarks]) => {
    html += `        <DT><H3 ADD_DATE="${timestamp}" LAST_MODIFIED="${timestamp}">${escapeHtml(folderName)}</H3>\n`;
    html += `        <DL><p>\n`;
    folderBookmarks.forEach((bookmark) => {
      html += `${generateBookmarkEntry(bookmark)}\n`;
    });
    html += `        </DL><p>\n`;
  });

  // Add uncategorized bookmarks
  uncategorizedBookmarks.forEach((bookmark) => {
    html += `${generateBookmarkEntry(bookmark)}\n`;
  });

  html += `    </DL><p>
</DL><p>
`;

  return html;
}

export default function ExportDialog({ open, onClose, onExport }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('json');
  const [loading, setLoading] = useState(false);

  const handleFormatChange = (_: React.MouseEvent<HTMLElement>, newFormat: ExportFormat | null) => {
    if (newFormat) {
      setFormat(newFormat);
    }
  };

  const handleExport = async () => {
    setLoading(true);

    try {
      const data = await onExport();
      let blob: Blob;
      let filename: string;
      const dateStr = new Date().toISOString().split('T')[0];

      if (format === 'json') {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        filename = `bookmarks-export-${dateStr}.json`;
      } else {
        const html = generateChromeBookmarkHtml(data.bookmarks, data.folders);
        blob = new Blob([html], { type: 'text/html' });
        filename = `bookmarks-export-${dateStr}.html`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setFormat('json');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth disableEscapeKeyDown={loading}>
      <DialogTitle>Export Bookmarks</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Select Export Format
            </Typography>
            <ToggleButtonGroup
              value={format}
              exclusive
              onChange={handleFormatChange}
              fullWidth
              disabled={loading}
            >
              <ToggleButton value="json">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Code />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Bookmark Manager JSON
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Full data with tags & metadata
                    </Typography>
                  </Box>
                </Box>
              </ToggleButton>
              <ToggleButton value="chrome">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Language />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Chrome HTML Format
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Compatible with all browsers
                    </Typography>
                  </Box>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {format === 'json'
              ? 'Exports all bookmarks with folders, tags, descriptions, and other metadata. Use this format for backup or transferring to another Bookmark Manager instance.'
              : 'Exports bookmarks in standard HTML format that can be imported into Chrome, Firefox, Edge, Safari, and other browsers. Note: Tags and descriptions are not included in this format.'}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CloudUpload, DeleteSweep } from '@mui/icons-material';

interface MigrationDialogProps {
  open: boolean;
  onClose: () => void;
  localBookmarkCount: number;
  localFolderCount: number;
  onMigrate: () => Promise<void>;
  onSkip: () => void;
}

export default function MigrationDialog({
  open,
  onClose,
  localBookmarkCount,
  localFolderCount,
  onMigrate,
  onSkip,
}: MigrationDialogProps) {
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMigrate = async () => {
    setMigrating(true);
    setError(null);
    try {
      await onMigrate();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setMigrating(false);
    }
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        Migrate Your Demo Bookmarks?
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          We found bookmarks you created while trying the demo. Would you like to migrate them to your account?
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 3,
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="h4" fontWeight={600} color="primary">
              {localBookmarkCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Bookmark{localBookmarkCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
          {localFolderCount > 0 && (
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h4" fontWeight={600} color="primary">
                {localFolderCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Folder{localFolderCount !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="caption" color="text.secondary">
          Demo data will be cleared from this browser after your choice.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
        <Button
          onClick={handleMigrate}
          variant="contained"
          fullWidth
          disabled={migrating}
          startIcon={migrating ? <CircularProgress size={20} /> : <CloudUpload />}
        >
          {migrating ? 'Migrating...' : 'Yes, Migrate My Bookmarks'}
        </Button>
        <Button
          onClick={handleSkip}
          variant="outlined"
          fullWidth
          disabled={migrating}
          startIcon={<DeleteSweep />}
        >
          No, Start Fresh
        </Button>
      </DialogActions>
    </Dialog>
  );
}

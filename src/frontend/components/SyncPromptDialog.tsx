'use client';

import { SignInButton, SignUpButton, ClerkLoaded } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Stack,
  IconButton,
} from '@mui/material';
import {
  CloudSync,
  Warning,
  Check,
  Close,
  Sync,
  Security,
} from '@mui/icons-material';
import ClerkButton from '@/components/ClerkButton';

interface SyncPromptDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SyncPromptDialog({ open, onClose }: SyncPromptDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 4, pb: 2 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <CloudSync sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Keep Your Bookmarks Safe
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your bookmark was saved locally. Create a free account to unlock these benefits:
          </Typography>
        </Box>

        {/* Benefits List */}
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sync sx={{ fontSize: 18, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2">Sync across all devices</Typography>
              <Typography variant="caption" color="text.secondary">
                Access your bookmarks on phone, tablet, and desktop
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Security sx={{ fontSize: 18, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2">Never lose your data</Typography>
              <Typography variant="caption" color="text.secondary">
                Cloud backup keeps your bookmarks safe forever
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'success.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check sx={{ fontSize: 18, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2">100% free, no credit card</Typography>
              <Typography variant="caption" color="text.secondary">
                Create an account in seconds with email or social login
              </Typography>
            </Box>
          </Box>
        </Stack>

        {/* Warning about local storage */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            p: 2,
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            borderRadius: 1,
            mb: 1,
          }}
        >
          <Warning sx={{ fontSize: 20, mt: 0.25 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              Without an account, your data is at risk
            </Typography>
            <Typography variant="caption">
              Local storage can be cleared by your browser, private browsing, or device changes.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ flexDirection: 'column', gap: 1.5, px: 3, pb: 3 }}>
        <ClerkLoaded>
          <SignUpButton mode="modal">
            <ClerkButton variant="contained" fullWidth size="large">
              Create Free Account
            </ClerkButton>
          </SignUpButton>
          <SignInButton mode="modal">
            <ClerkButton variant="outlined" fullWidth>
              I Already Have an Account
            </ClerkButton>
          </SignInButton>
        </ClerkLoaded>
        <Button
          onClick={onClose}
          color="inherit"
          size="small"
          sx={{
            textTransform: 'none',
            color: 'text.secondary',
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          Continue without account (not recommended)
        </Button>
      </DialogActions>
    </Dialog>
  );
}

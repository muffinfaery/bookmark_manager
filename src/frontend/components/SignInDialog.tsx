'use client';

import { SignInButton, SignUpButton, ClerkLoaded } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Divider,
} from '@mui/material';
import { Close, AccountCircle } from '@mui/icons-material';
import ClerkButton from '@/components/ClerkButton';

interface SignInDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SignInDialog({ open, onClose }: SignInDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 4, pb: 3, textAlign: 'center' }}>
        <AccountCircle sx={{ fontSize: 64, color: 'primary.main', mb: 1 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to sync your bookmarks across all your devices
        </Typography>

        <ClerkLoaded>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <SignInButton mode="modal">
              <ClerkButton variant="contained" fullWidth size="large">
                Sign In
              </ClerkButton>
            </SignInButton>

            <Divider sx={{ my: 1 }}>
              <Typography variant="caption" color="text.secondary">
                New here?
              </Typography>
            </Divider>

            <SignUpButton mode="modal">
              <ClerkButton variant="outlined" fullWidth>
                Create Free Account
              </ClerkButton>
            </SignUpButton>
          </Box>
        </ClerkLoaded>
      </DialogContent>
    </Dialog>
  );
}

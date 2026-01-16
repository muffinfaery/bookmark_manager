'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Close,
  Email,
  Phone,
  Person,
  Logout,
  Settings,
} from '@mui/icons-material';

interface UserProfileDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function UserProfileDialog({ open, onClose }: UserProfileDialogProps) {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) return null;

  const primaryEmail = user.primaryEmailAddress?.emailAddress;
  const primaryPhone = user.primaryPhoneNumber?.phoneNumber;
  const fullName = user.fullName || user.username || 'User';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Account
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <Avatar
            src={user.imageUrl}
            sx={{ width: 80, height: 80, fontSize: '1.5rem', mb: 2 }}
          >
            {initials}
          </Avatar>
          <Typography variant="h6" fontWeight={600}>
            {fullName}
          </Typography>
          {user.username && (
            <Typography variant="body2" color="text.secondary">
              @{user.username}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <List dense>
          {primaryEmail && (
            <ListItem>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Email fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Email"
                secondary={primaryEmail}
              />
            </ListItem>
          )}
          {primaryPhone && (
            <ListItem>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Phone fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Phone"
                secondary={primaryPhone}
              />
            </ListItem>
          )}
          <ListItem>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="User ID"
              secondary={user.id}
              secondaryTypographyProps={{
                sx: {
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }
              }}
            />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexDirection: 'column', gap: 1 }}>
        <Button
          onClick={() => openUserProfile()}
          variant="contained"
          fullWidth
          startIcon={<Settings />}
        >
          Manage Account
        </Button>
        <Button
          onClick={handleSignOut}
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<Logout />}
        >
          Sign Out
        </Button>
      </DialogActions>
    </Dialog>
  );
}

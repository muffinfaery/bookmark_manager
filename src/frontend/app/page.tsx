'use client';

import { useEffect, useState } from 'react';
import { useAuth, SignInButton, SignUpButton, ClerkLoaded } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Bookmark,
  Folder,
  LocalOffer,
  Speed,
  CloudSync,
  DragIndicator,
} from '@mui/icons-material';
import { localDataApi } from '@/lib/localStorage';
import { ClerkButton } from '@/components/auth';

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [hasLocalData, setHasLocalData] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    setHasLocalData(localDataApi.hasData());
  }, []);

  const features = [
    {
      icon: <Bookmark sx={{ fontSize: 40 }} />,
      title: 'Organize Bookmarks',
      description: 'Save and organize your favorite links with ease',
    },
    {
      icon: <Folder sx={{ fontSize: 40 }} />,
      title: 'Folders & Categories',
      description: 'Create folders to keep your bookmarks organized',
    },
    {
      icon: <LocalOffer sx={{ fontSize: 40 }} />,
      title: 'Tag System',
      description: 'Use tags for flexible cross-folder organization',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: 'Quick Access',
      description: 'Track most-used bookmarks for instant access',
    },
    {
      icon: <CloudSync sx={{ fontSize: 40 }} />,
      title: 'Cloud Sync',
      description: 'Sign in to sync bookmarks across all devices',
    },
    {
      icon: <DragIndicator sx={{ fontSize: 40 }} />,
      title: 'Drag & Drop',
      description: 'Reorder bookmarks with intuitive drag and drop',
    },
  ];

  if (!isLoaded || isSignedIn) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        {isSignedIn && (
          <Typography variant="h6" color="text.secondary">
            Redirecting...
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Bookmark Manager
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
          >
            Organize, search, and access your bookmarks from anywhere.
            Start locally, sync when ready.
          </Typography>

          <ClerkLoaded>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mb: 2 }}
            >
              <SignInButton mode="modal">
                <ClerkButton variant="contained" size="large" style={{ padding: '12px 32px' }}>
                  Sign In
                </ClerkButton>
              </SignInButton>
              <SignUpButton mode="modal">
                <ClerkButton variant="outlined" size="large" style={{ padding: '12px 32px' }}>
                  Create Account
                </ClerkButton>
              </SignUpButton>
            </Stack>
          </ClerkLoaded>
          <Button
            variant="text"
            size="medium"
            onClick={() => router.push('/dashboard')}
            sx={{ color: 'text.secondary' }}
          >
            {hasLocalData ? 'Continue without account' : 'Try without account'}
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {features.map((feature, index) => (
            <Card key={index} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

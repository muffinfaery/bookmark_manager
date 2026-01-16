'use client';

import { useState, memo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Star,
  StarBorder,
  MoreVert,
  Edit,
  Delete,
  OpenInNew,
  Folder,
  ContentCopy,
} from '@mui/icons-material';
import { Bookmark } from '@/types';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onClick: (bookmark: Bookmark) => void;
  viewMode: 'grid' | 'list';
}

function BookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onToggleFavorite,
  onClick,
  viewMode,
}: BookmarkCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback((event?: React.MouseEvent | {}) => {
    if (event && 'stopPropagation' in event) {
      (event as React.MouseEvent).stopPropagation();
      (event as React.MouseEvent).preventDefault();
    }
    setAnchorEl(null);
  }, []);

  const handleEdit = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(null);
    onEdit(bookmark);
  }, [bookmark, onEdit]);

  const handleDelete = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setAnchorEl(null);
    onDelete(bookmark.id);
  }, [bookmark.id, onDelete]);

  const handleCopyUrl = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    navigator.clipboard.writeText(bookmark.url);
    setAnchorEl(null);
  }, [bookmark.url]);

  const handleOpenInNewTab = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
    onClick(bookmark);
  }, [bookmark, onClick]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(bookmark.id);
  }, [bookmark.id, onToggleFavorite]);

  const faviconUrl = bookmark.favicon || (() => {
    try {
      const url = new URL(bookmark.url);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
    } catch {
      return null;
    }
  })();

  if (viewMode === 'list') {
    return (
      <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          {faviconUrl && (
            <Box
              component="img"
              src={faviconUrl}
              alt=""
              sx={{ width: 20, height: 20, mr: 2, flexShrink: 0 }}
              onError={(e: any) => (e.target.style.display = 'none')}
            />
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body1" noWrap sx={{ fontWeight: 500 }}>
              {bookmark.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {bookmark.url}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={0.5} sx={{ ml: 2 }}>
          {bookmark.tags.slice(0, 2).map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              size="small"
              sx={{ bgcolor: tag.color || 'default' }}
            />
          ))}
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <IconButton size="small" onClick={handleToggleFavorite}>
            {bookmark.isFavorite ? <Star color="warning" /> : <StarBorder />}
          </IconButton>
          <Tooltip title="Open in new tab">
            <IconButton size="small" onClick={handleOpenInNewTab}>
              <OpenInNew fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleCopyUrl}>
            <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
            <ListItemText>Copy URL</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          {faviconUrl && (
            <Box
              component="img"
              src={faviconUrl}
              alt=""
              sx={{ width: 24, height: 24, mr: 1.5, mt: 0.5, flexShrink: 0 }}
              onError={(e: any) => (e.target.style.display = 'none')}
            />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {bookmark.title}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleToggleFavorite}
            sx={{ ml: 1, mt: -0.5 }}
          >
            {bookmark.isFavorite ? (
              <Star color="warning" fontSize="small" />
            ) : (
              <StarBorder fontSize="small" />
            )}
          </IconButton>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {bookmark.url}
        </Typography>

        {bookmark.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {bookmark.description}
          </Typography>
        )}

        {bookmark.tags.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {bookmark.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag.id}
                label={tag.name}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.75rem',
                  bgcolor: tag.color || undefined,
                }}
              />
            ))}
            {bookmark.tags.length > 3 && (
              <Chip
                label={`+${bookmark.tags.length - 3}`}
                size="small"
                sx={{ height: 22, fontSize: '0.75rem' }}
              />
            )}
          </Stack>
        )}
      </CardContent>

      <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {bookmark.folderName && (
            <Tooltip title={`In folder: ${bookmark.folderName}`}>
              <Chip
                icon={<Folder />}
                label={bookmark.folderName}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}
        </Box>
        <Box>
          <Tooltip title="Open in new tab">
            <IconButton size="small" onClick={handleOpenInNewTab}>
              <OpenInNew fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
      </CardActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleCopyUrl}>
          <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
          <ListItemText>Copy URL</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
}

export default memo(BookmarkCard);

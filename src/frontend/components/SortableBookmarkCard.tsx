'use client';

import { memo, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { Box, Tooltip } from '@mui/material';
import { DragIndicator } from '@mui/icons-material';
import { Bookmark } from '@/types';
import BookmarkCard from './BookmarkCard';

interface SortableBookmarkCardProps {
  bookmark: Bookmark;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onClick: (bookmark: Bookmark) => void;
  viewMode: 'grid' | 'list';
}

function SortableBookmarkCard({
  bookmark,
  onEdit,
  onDelete,
  onToggleFavorite,
  onClick,
  viewMode,
}: SortableBookmarkCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: bookmark.id });

  // Memoize style to prevent recalculation
  const style = useMemo<React.CSSProperties>(() => ({
    transform: transform
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
      : undefined,
    opacity: isDragging ? 0.4 : undefined,
    zIndex: isDragging ? 1000 : undefined,
    pointerEvents: isDragging ? 'none' as const : undefined,
  }), [transform, isDragging]);

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        position: 'relative',
        minWidth: 0,
        height: viewMode === 'grid' ? '100%' : 'auto',
        '&:hover .drag-handle': {
          opacity: 1,
        },
      }}
    >
      <Tooltip title="Drag to reorder" placement="left" enterDelay={700}>
        <Box
          component="button"
          className="drag-handle"
          {...attributes}
          {...listeners}
          sx={{
            position: 'absolute',
            top: viewMode === 'grid' ? 8 : '50%',
            left: 8,
            transform: viewMode === 'list' ? 'translateY(-50%)' : 'none',
            zIndex: 20,
            opacity: 0,
            transition: 'opacity 0.1s',
            cursor: 'grab',
            bgcolor: 'warning.main',
            boxShadow: 2,
            border: 'none',
            borderRadius: 1,
            p: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'none',
            '&:hover': {
              bgcolor: 'warning.dark',
            },
            '&:active': {
              cursor: 'grabbing',
              bgcolor: 'warning.dark',
            },
          }}
        >
          <DragIndicator fontSize="small" sx={{ color: 'warning.contrastText' }} />
        </Box>
      </Tooltip>
      <BookmarkCard
        bookmark={bookmark}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite}
        onClick={onClick}
        viewMode={viewMode}
      />
    </Box>
  );
}

export default memo(SortableBookmarkCard, (prevProps, nextProps) => {
  // Custom comparison - only re-render if bookmark data actually changed
  return (
    prevProps.bookmark.id === nextProps.bookmark.id &&
    prevProps.bookmark.title === nextProps.bookmark.title &&
    prevProps.bookmark.url === nextProps.bookmark.url &&
    prevProps.bookmark.isFavorite === nextProps.bookmark.isFavorite &&
    prevProps.bookmark.sortOrder === nextProps.bookmark.sortOrder &&
    prevProps.viewMode === nextProps.viewMode
  );
});

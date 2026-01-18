'use client';

import { useCallback, useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSwappingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Box } from '@mui/material';
import { Bookmark } from '@/types';
import SortableBookmarkCard from './SortableBookmarkCard';
import BookmarkCard from './BookmarkCard';

interface SortableBookmarkGridProps {
  bookmarks: Bookmark[];
  viewMode: 'grid' | 'list';
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onClick: (bookmark: Bookmark) => void;
  onReorder: (items: { id: string; sortOrder: number }[]) => Promise<void>;
}

export default function SortableBookmarkGrid({
  bookmarks,
  viewMode,
  onEdit,
  onDelete,
  onToggleFavorite,
  onClick,
  onReorder,
}: SortableBookmarkGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (over && active.id !== over.id) {
        const oldIndex = bookmarks.findIndex((b) => b.id === active.id);
        const newIndex = bookmarks.findIndex((b) => b.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedBookmarks = arrayMove(bookmarks, oldIndex, newIndex);
          const updates = reorderedBookmarks.map((bookmark, index) => ({
            id: bookmark.id,
            sortOrder: index,
          }));

          // Fire and forget - don't await to keep UI responsive
          onReorder(updates).catch(console.error);
        }
      }
    },
    [bookmarks, onReorder]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  const activeBookmark = useMemo(
    () => (activeId ? bookmarks.find((b) => b.id === activeId) : null),
    [activeId, bookmarks]
  );

  const bookmarkIds = useMemo(() => bookmarks.map((b) => b.id), [bookmarks]);

  // Use rectSwappingStrategy for grid (simpler, faster) and verticalListSortingStrategy for list
  const strategy = viewMode === 'grid' ? rectSwappingStrategy : verticalListSortingStrategy;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={bookmarkIds} strategy={strategy}>
        {viewMode === 'grid' ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2,
              overflow: 'hidden',
            }}
          >
            {bookmarks.map((bookmark) => (
              <SortableBookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                onClick={onClick}
                viewMode={viewMode}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {bookmarks.map((bookmark) => (
              <SortableBookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                onClick={onClick}
                viewMode={viewMode}
              />
            ))}
          </Box>
        )}
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeBookmark ? (
          <Box
            sx={{
              cursor: 'grabbing',
              boxShadow: 6,
              borderRadius: 1,
            }}
          >
            <BookmarkCard
              bookmark={activeBookmark}
              onEdit={() => {}}
              onDelete={() => {}}
              onToggleFavorite={() => {}}
              onClick={() => {}}
              viewMode={viewMode}
            />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

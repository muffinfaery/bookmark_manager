'use client';

/**
 * Hook for computing filtered bookmarks
 * Uses pure utility functions for filtering logic
 * Memoized for performance
 */

import { useMemo } from 'react';
import { Bookmark } from '@/types';
import {
  createBookmarkSearcher,
  getFilteredBookmarks,
} from '@/lib/utils';
import type { BookmarkFilters } from './useBookmarkFilters';

/**
 * Hook that computes filtered bookmarks based on filter state
 * Uses Fuse.js for fuzzy search and pure utility functions for filtering
 */
export function useFilteredBookmarks(
  bookmarks: Bookmark[],
  filters: BookmarkFilters
): Bookmark[] {
  // Create Fuse.js instance - memoized to avoid recreation on every render
  const fuse = useMemo(
    () => createBookmarkSearcher(bookmarks),
    [bookmarks]
  );

  // Compute filtered bookmarks using pure utility function
  const filteredBookmarks = useMemo(
    () =>
      getFilteredBookmarks(bookmarks, filters.filterType, {
        selectedFolderId: filters.selectedFolderId,
        selectedTagId: filters.selectedTagId,
        searchQuery: filters.searchQuery,
        fuse,
      }),
    [
      bookmarks,
      filters.filterType,
      filters.selectedFolderId,
      filters.selectedTagId,
      filters.searchQuery,
      fuse,
    ]
  );

  return filteredBookmarks;
}

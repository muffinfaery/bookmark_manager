/**
 * Bookmark utility functions - pure, no React dependencies
 * Handles filtering, sorting, and fuzzy search operations
 */

import Fuse, { IFuseOptions } from 'fuse.js';
import { Bookmark, FilterType } from '@/types';

/**
 * Fuse.js configuration for bookmark search
 * Weights: title (50%), description (30%), url (15%), tags (5%)
 */
export const BOOKMARK_FUSE_OPTIONS: IFuseOptions<Bookmark> = {
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'description', weight: 0.3 },
    { name: 'url', weight: 0.15 },
    { name: 'tags.name', weight: 0.05 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
};

/**
 * Creates a Fuse.js instance for bookmark searching
 */
export const createBookmarkSearcher = (bookmarks: Bookmark[]): Fuse<Bookmark> =>
  new Fuse(bookmarks, BOOKMARK_FUSE_OPTIONS);

/**
 * Performs fuzzy search on bookmarks using Fuse.js
 */
export const fuzzySearchBookmarks = (
  fuse: Fuse<Bookmark>,
  query: string
): Bookmark[] => {
  if (!query.trim()) return [];
  const results = fuse.search(query);
  return results.map((result) => result.item);
};

/**
 * Filters bookmarks by favorite status
 */
export const filterByFavorites = (bookmarks: Bookmark[]): Bookmark[] =>
  bookmarks.filter((b) => b.isFavorite);

/**
 * Filters bookmarks by folder ID
 * If folderId is null, returns bookmarks without a folder (uncategorized)
 */
export const filterByFolder = (
  bookmarks: Bookmark[],
  folderId: string | null
): Bookmark[] =>
  bookmarks.filter((b) => (folderId ? b.folderId === folderId : !b.folderId));

/**
 * Filters bookmarks by tag ID
 */
export const filterByTag = (bookmarks: Bookmark[], tagId: string): Bookmark[] =>
  bookmarks.filter((b) => b.tags.some((t) => t.id === tagId));

/**
 * Sorts bookmarks by their sortOrder property
 */
export const sortByOrder = (bookmarks: Bookmark[]): Bookmark[] =>
  [...bookmarks].sort((a, b) => a.sortOrder - b.sortOrder);

/**
 * Sorts bookmarks by click count (most used first)
 */
export const sortByClickCount = (bookmarks: Bookmark[]): Bookmark[] =>
  [...bookmarks].sort((a, b) => b.clickCount - a.clickCount);

/**
 * Sorts bookmarks by creation date (newest first)
 */
export const sortByNewest = (bookmarks: Bookmark[]): Bookmark[] =>
  [...bookmarks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

/**
 * Filter options for getFilteredBookmarks
 */
export interface FilterOptions {
  selectedFolderId?: string | null;
  selectedTagId?: string | null;
  searchQuery?: string;
  fuse?: Fuse<Bookmark>;
}

/**
 * Main filtering function - applies filter type and returns filtered bookmarks
 * For search filter, results are returned in relevance order (not sorted by sortOrder)
 */
export const getFilteredBookmarks = (
  bookmarks: Bookmark[],
  filterType: FilterType,
  options: FilterOptions = {}
): Bookmark[] => {
  const { selectedFolderId, selectedTagId, searchQuery, fuse } = options;

  let filtered: Bookmark[];

  switch (filterType) {
    case 'favorites':
      filtered = filterByFavorites(bookmarks);
      break;
    case 'folder':
      filtered = filterByFolder(bookmarks, selectedFolderId ?? null);
      break;
    case 'tag':
      if (selectedTagId) {
        filtered = filterByTag(bookmarks, selectedTagId);
      } else {
        filtered = bookmarks;
      }
      break;
    case 'search':
      if (searchQuery && fuse) {
        // Search results are already in relevance order from Fuse.js
        return fuzzySearchBookmarks(fuse, searchQuery);
      }
      filtered = bookmarks;
      break;
    default:
      filtered = bookmarks;
  }

  return sortByOrder(filtered);
};

/**
 * Gets the count of bookmarks matching a filter
 */
export const getBookmarkCount = (
  bookmarks: Bookmark[],
  filterType: FilterType,
  options: FilterOptions = {}
): number => {
  return getFilteredBookmarks(bookmarks, filterType, options).length;
};

import { describe, it, expect } from 'vitest';
import {
  filterByFavorites,
  filterByFolder,
  filterByTag,
  sortByOrder,
  sortByClickCount,
  sortByNewest,
  getFilteredBookmarks,
  createBookmarkSearcher,
  fuzzySearchBookmarks,
} from '../bookmark';
import { Bookmark } from '@/types';

// Test fixtures
const createMockBookmark = (overrides: Partial<Bookmark> = {}): Bookmark => ({
  id: 'test-id',
  url: 'https://example.com',
  title: 'Test Bookmark',
  description: 'A test bookmark',
  isFavorite: false,
  clickCount: 0,
  sortOrder: 0,
  tags: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

const mockBookmarks: Bookmark[] = [
  createMockBookmark({
    id: '1',
    title: 'GitHub',
    url: 'https://github.com',
    isFavorite: true,
    clickCount: 10,
    sortOrder: 2,
    folderId: 'folder-1',
    tags: [{ id: 'tag-1', name: 'dev', bookmarkCount: 1, createdAt: '' }],
    createdAt: '2024-01-01T00:00:00Z',
  }),
  createMockBookmark({
    id: '2',
    title: 'Google',
    url: 'https://google.com',
    isFavorite: false,
    clickCount: 5,
    sortOrder: 1,
    folderId: 'folder-2',
    tags: [{ id: 'tag-2', name: 'search', bookmarkCount: 1, createdAt: '' }],
    createdAt: '2024-01-02T00:00:00Z',
  }),
  createMockBookmark({
    id: '3',
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    description: 'Programming Q&A',
    isFavorite: true,
    clickCount: 20,
    sortOrder: 0,
    tags: [
      { id: 'tag-1', name: 'dev', bookmarkCount: 1, createdAt: '' },
      { id: 'tag-3', name: 'qa', bookmarkCount: 1, createdAt: '' },
    ],
    createdAt: '2024-01-03T00:00:00Z',
  }),
];

describe('bookmark utilities', () => {
  describe('filterByFavorites', () => {
    it('returns only favorite bookmarks', () => {
      const result = filterByFavorites(mockBookmarks);
      expect(result).toHaveLength(2);
      expect(result.every((b) => b.isFavorite)).toBe(true);
    });

    it('returns empty array when no favorites', () => {
      const noFavorites = mockBookmarks.map((b) => ({ ...b, isFavorite: false }));
      expect(filterByFavorites(noFavorites)).toHaveLength(0);
    });

    it('handles empty array', () => {
      expect(filterByFavorites([])).toHaveLength(0);
    });
  });

  describe('filterByFolder', () => {
    it('returns bookmarks in specific folder', () => {
      const result = filterByFolder(mockBookmarks, 'folder-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('returns uncategorized bookmarks when folderId is null', () => {
      // Create bookmarks where only one has no folder
      const testBookmarks = [
        createMockBookmark({ id: '1', folderId: 'folder-1' }),
        createMockBookmark({ id: '2', folderId: 'folder-2' }),
        createMockBookmark({ id: '3', folderId: undefined }),
      ];
      const result = filterByFolder(testBookmarks, null);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('returns empty array when folder not found', () => {
      expect(filterByFolder(mockBookmarks, 'nonexistent')).toHaveLength(0);
    });
  });

  describe('filterByTag', () => {
    it('returns bookmarks with specific tag', () => {
      const result = filterByTag(mockBookmarks, 'tag-1');
      expect(result).toHaveLength(2);
      expect(result.map((b) => b.id)).toContain('1');
      expect(result.map((b) => b.id)).toContain('3');
    });

    it('returns empty array when tag not found', () => {
      expect(filterByTag(mockBookmarks, 'nonexistent')).toHaveLength(0);
    });
  });

  describe('sortByOrder', () => {
    it('sorts bookmarks by sortOrder ascending', () => {
      const result = sortByOrder(mockBookmarks);
      expect(result[0].id).toBe('3'); // sortOrder: 0
      expect(result[1].id).toBe('2'); // sortOrder: 1
      expect(result[2].id).toBe('1'); // sortOrder: 2
    });

    it('does not mutate original array', () => {
      const original = [...mockBookmarks];
      sortByOrder(mockBookmarks);
      expect(mockBookmarks).toEqual(original);
    });
  });

  describe('sortByClickCount', () => {
    it('sorts bookmarks by click count descending', () => {
      const result = sortByClickCount(mockBookmarks);
      expect(result[0].id).toBe('3'); // clickCount: 20
      expect(result[1].id).toBe('1'); // clickCount: 10
      expect(result[2].id).toBe('2'); // clickCount: 5
    });
  });

  describe('sortByNewest', () => {
    it('sorts bookmarks by creation date descending', () => {
      const result = sortByNewest(mockBookmarks);
      expect(result[0].id).toBe('3'); // 2024-01-03
      expect(result[1].id).toBe('2'); // 2024-01-02
      expect(result[2].id).toBe('1'); // 2024-01-01
    });
  });

  describe('getFilteredBookmarks', () => {
    it('returns all bookmarks sorted by order for "all" filter', () => {
      const result = getFilteredBookmarks(mockBookmarks, 'all', {});
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('3'); // sortOrder: 0
    });

    it('returns favorites for "favorites" filter', () => {
      const result = getFilteredBookmarks(mockBookmarks, 'favorites', {});
      expect(result).toHaveLength(2);
      expect(result.every((b) => b.isFavorite)).toBe(true);
    });

    it('returns folder bookmarks for "folder" filter', () => {
      const result = getFilteredBookmarks(mockBookmarks, 'folder', {
        selectedFolderId: 'folder-1',
      });
      expect(result).toHaveLength(1);
      expect(result[0].folderId).toBe('folder-1');
    });

    it('returns tag bookmarks for "tag" filter', () => {
      const result = getFilteredBookmarks(mockBookmarks, 'tag', {
        selectedTagId: 'tag-1',
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('fuzzy search', () => {
    it('finds bookmarks by title', () => {
      const fuse = createBookmarkSearcher(mockBookmarks);
      const result = fuzzySearchBookmarks(fuse, 'github');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('GitHub');
    });

    it('finds bookmarks by partial title match', () => {
      const fuse = createBookmarkSearcher(mockBookmarks);
      const result = fuzzySearchBookmarks(fuse, 'stack');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Stack Overflow');
    });

    it('finds bookmarks by description', () => {
      const fuse = createBookmarkSearcher(mockBookmarks);
      const result = fuzzySearchBookmarks(fuse, 'programming');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].description).toContain('Programming');
    });

    it('finds bookmarks by URL', () => {
      const fuse = createBookmarkSearcher(mockBookmarks);
      const result = fuzzySearchBookmarks(fuse, 'stackoverflow');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for no matches', () => {
      const fuse = createBookmarkSearcher(mockBookmarks);
      const result = fuzzySearchBookmarks(fuse, 'xyz123nonexistent');
      expect(result).toHaveLength(0);
    });

    it('returns empty array for empty query', () => {
      const fuse = createBookmarkSearcher(mockBookmarks);
      expect(fuzzySearchBookmarks(fuse, '')).toHaveLength(0);
      expect(fuzzySearchBookmarks(fuse, '   ')).toHaveLength(0);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { getPageTitle, getPageSubtitle } from '../pageTitle';
import { Folder, Tag } from '@/types';

const mockFolders: Folder[] = [
  {
    id: 'folder-1',
    name: 'Development',
    sortOrder: 0,
    bookmarkCount: 5,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'folder-2',
    name: 'Personal',
    sortOrder: 1,
    bookmarkCount: 3,
    createdAt: '',
    updatedAt: '',
  },
];

const mockTags: Tag[] = [
  { id: 'tag-1', name: 'javascript', bookmarkCount: 10, createdAt: '' },
  { id: 'tag-2', name: 'react', bookmarkCount: 8, createdAt: '' },
];

describe('pageTitle utilities', () => {
  describe('getPageTitle', () => {
    it('returns "All Bookmarks" for "all" filter', () => {
      const result = getPageTitle('all', { folders: mockFolders, tags: mockTags });
      expect(result).toBe('All Bookmarks');
    });

    it('returns "Favorites" for "favorites" filter', () => {
      const result = getPageTitle('favorites', { folders: mockFolders, tags: mockTags });
      expect(result).toBe('Favorites');
    });

    it('returns folder name for "folder" filter with selection', () => {
      const result = getPageTitle('folder', {
        folders: mockFolders,
        tags: mockTags,
        selectedFolderId: 'folder-1',
      });
      expect(result).toBe('Development');
    });

    it('returns "Uncategorized" for "folder" filter without selection', () => {
      const result = getPageTitle('folder', {
        folders: mockFolders,
        tags: mockTags,
        selectedFolderId: null,
      });
      expect(result).toBe('Uncategorized');
    });

    it('returns "Folder" for "folder" filter with invalid selection', () => {
      const result = getPageTitle('folder', {
        folders: mockFolders,
        tags: mockTags,
        selectedFolderId: 'nonexistent',
      });
      expect(result).toBe('Folder');
    });

    it('returns tag name for "tag" filter with selection', () => {
      const result = getPageTitle('tag', {
        folders: mockFolders,
        tags: mockTags,
        selectedTagId: 'tag-1',
      });
      expect(result).toBe('Tag: javascript');
    });

    it('returns "All Bookmarks" for "tag" filter without selection', () => {
      const result = getPageTitle('tag', {
        folders: mockFolders,
        tags: mockTags,
        selectedTagId: null,
      });
      expect(result).toBe('All Bookmarks');
    });

    it('returns "Search Results" for "search" filter', () => {
      const result = getPageTitle('search', { folders: mockFolders, tags: mockTags });
      expect(result).toBe('Search Results');
    });
  });

  describe('getPageSubtitle', () => {
    it('returns count text for "all" filter', () => {
      const result = getPageSubtitle('all', 10, { folders: mockFolders, tags: mockTags });
      expect(result).toBe('10 bookmarks');
    });

    it('handles singular bookmark count', () => {
      const result = getPageSubtitle('all', 1, { folders: mockFolders, tags: mockTags });
      expect(result).toBe('1 bookmark');
    });

    it('returns favorites subtitle', () => {
      const result = getPageSubtitle('favorites', 5, { folders: mockFolders, tags: mockTags });
      expect(result).toBe('5 bookmarks marked as favorite');
    });

    it('returns folder subtitle with folder name', () => {
      const result = getPageSubtitle('folder', 3, {
        folders: mockFolders,
        tags: mockTags,
        selectedFolderId: 'folder-1',
      });
      expect(result).toBe('3 bookmarks in Development');
    });

    it('returns uncategorized subtitle', () => {
      const result = getPageSubtitle('folder', 2, {
        folders: mockFolders,
        tags: mockTags,
        selectedFolderId: null,
      });
      expect(result).toBe('2 bookmarks without a folder');
    });

    it('returns tag subtitle with tag name', () => {
      const result = getPageSubtitle('tag', 8, {
        folders: mockFolders,
        tags: mockTags,
        selectedTagId: 'tag-2',
      });
      expect(result).toBe('8 bookmarks tagged with react');
    });

    it('returns search subtitle', () => {
      const result = getPageSubtitle('search', 15, { folders: mockFolders, tags: mockTags });
      expect(result).toBe('15 bookmarks found');
    });
  });
});

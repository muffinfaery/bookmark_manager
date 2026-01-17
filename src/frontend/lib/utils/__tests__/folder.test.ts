import { describe, it, expect } from 'vitest';
import {
  createFolderSearcher,
  fuzzySearchFolders,
  findFolderById,
  findFolderByName,
  getRootFolders,
  getSubFolders,
  sortFoldersByOrder,
  sortFoldersByName,
  folderNameExists,
} from '../folder';
import { Folder } from '@/types';

// Test fixtures
const createMockFolder = (overrides: Partial<Folder> = {}): Folder => ({
  id: 'folder-id',
  name: 'Test Folder',
  sortOrder: 0,
  bookmarkCount: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

const mockFolders: Folder[] = [
  createMockFolder({ id: '1', name: 'Development', sortOrder: 2 }),
  createMockFolder({ id: '2', name: 'Personal', sortOrder: 0 }),
  createMockFolder({ id: '3', name: 'Work', sortOrder: 1, parentFolderId: '1' }),
  createMockFolder({ id: '4', name: 'Archive', sortOrder: 3 }),
];

describe('folder utilities', () => {
  describe('findFolderById', () => {
    it('finds folder by ID', () => {
      const result = findFolderById(mockFolders, '1');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Development');
    });

    it('returns undefined for null ID', () => {
      expect(findFolderById(mockFolders, null)).toBeUndefined();
    });

    it('returns undefined for non-existent ID', () => {
      expect(findFolderById(mockFolders, 'nonexistent')).toBeUndefined();
    });
  });

  describe('findFolderByName', () => {
    it('finds folder by exact name', () => {
      const result = findFolderByName(mockFolders, 'Development');
      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
    });

    it('finds folder case-insensitively', () => {
      expect(findFolderByName(mockFolders, 'development')).toBeDefined();
      expect(findFolderByName(mockFolders, 'DEVELOPMENT')).toBeDefined();
      expect(findFolderByName(mockFolders, 'DeVeLoPmEnT')).toBeDefined();
    });

    it('returns undefined for non-existent name', () => {
      expect(findFolderByName(mockFolders, 'Nonexistent')).toBeUndefined();
    });
  });

  describe('getRootFolders', () => {
    it('returns folders without parent', () => {
      const result = getRootFolders(mockFolders);
      expect(result).toHaveLength(3);
      expect(result.every((f) => !f.parentFolderId)).toBe(true);
    });
  });

  describe('getSubFolders', () => {
    it('returns subfolders of a parent', () => {
      const result = getSubFolders(mockFolders, '1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('returns empty array when no subfolders', () => {
      expect(getSubFolders(mockFolders, '2')).toHaveLength(0);
    });
  });

  describe('sortFoldersByOrder', () => {
    it('sorts folders by sortOrder ascending', () => {
      const result = sortFoldersByOrder(mockFolders);
      expect(result[0].id).toBe('2'); // sortOrder: 0
      expect(result[1].id).toBe('3'); // sortOrder: 1
      expect(result[2].id).toBe('1'); // sortOrder: 2
      expect(result[3].id).toBe('4'); // sortOrder: 3
    });

    it('does not mutate original array', () => {
      const original = [...mockFolders];
      sortFoldersByOrder(mockFolders);
      expect(mockFolders).toEqual(original);
    });
  });

  describe('sortFoldersByName', () => {
    it('sorts folders alphabetically', () => {
      const result = sortFoldersByName(mockFolders);
      expect(result[0].name).toBe('Archive');
      expect(result[1].name).toBe('Development');
      expect(result[2].name).toBe('Personal');
      expect(result[3].name).toBe('Work');
    });
  });

  describe('folderNameExists', () => {
    it('returns true when name exists', () => {
      expect(folderNameExists(mockFolders, 'Development')).toBe(true);
    });

    it('checks case-insensitively', () => {
      expect(folderNameExists(mockFolders, 'development')).toBe(true);
      expect(folderNameExists(mockFolders, 'DEVELOPMENT')).toBe(true);
    });

    it('returns false when name does not exist', () => {
      expect(folderNameExists(mockFolders, 'Nonexistent')).toBe(false);
    });

    it('excludes folder with given ID', () => {
      // Development exists but exclude folder with ID '1'
      expect(folderNameExists(mockFolders, 'Development', '1')).toBe(false);
      // Development exists and we're not excluding it
      expect(folderNameExists(mockFolders, 'Development', '2')).toBe(true);
    });
  });

  describe('fuzzy search', () => {
    it('finds folders by name', () => {
      const fuse = createFolderSearcher(mockFolders);
      const result = fuzzySearchFolders(fuse, 'dev');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('Development');
    });

    it('finds folders with partial match', () => {
      const fuse = createFolderSearcher(mockFolders);
      const result = fuzzySearchFolders(fuse, 'work');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toBe('Work');
    });

    it('returns empty array for no matches', () => {
      const fuse = createFolderSearcher(mockFolders);
      expect(fuzzySearchFolders(fuse, 'xyz123')).toHaveLength(0);
    });

    it('returns empty array for empty query', () => {
      const fuse = createFolderSearcher(mockFolders);
      expect(fuzzySearchFolders(fuse, '')).toHaveLength(0);
      expect(fuzzySearchFolders(fuse, '   ')).toHaveLength(0);
    });
  });
});

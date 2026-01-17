/**
 * Bookmark Service - Business logic layer for bookmark operations
 * Uses factory pattern for dependency injection, making it easily testable
 */

import { Bookmark, CreateBookmarkDto, UpdateBookmarkDto } from '@/types';
import { bookmarksApi } from '@/lib/api';
import { localBookmarksApi } from '@/lib/localStorage';

/**
 * Bookmark service interface - defines all bookmark operations
 */
export interface BookmarkService {
  getAll: () => Promise<Bookmark[]>;
  getById: (id: string) => Promise<Bookmark | undefined>;
  create: (dto: CreateBookmarkDto) => Promise<Bookmark>;
  update: (id: string, dto: UpdateBookmarkDto) => Promise<Bookmark | undefined>;
  delete: (id: string) => Promise<void>;
  toggleFavorite: (bookmark: Bookmark) => Promise<Bookmark | undefined>;
  trackClick: (id: string) => Promise<void>;
  reorder: (items: { id: string; sortOrder: number }[]) => Promise<void>;
  checkDuplicate: (url: string) => Promise<boolean>;
  exportAll: () => Promise<Bookmark[]>;
  importMany: (bookmarks: CreateBookmarkDto[]) => Promise<Bookmark[]>;
}

/**
 * Token provider type - allows for flexible authentication
 */
export type TokenProvider = () => Promise<string | null>;

/**
 * Creates an API-based bookmark service for authenticated users
 */
const createApiBookmarkService = (getToken: TokenProvider): BookmarkService => ({
  getAll: async () => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return bookmarksApi.getAll(token);
  },

  getById: async (id) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const all = await bookmarksApi.getAll(token);
    return all.find((b) => b.id === id);
  },

  create: async (dto) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return bookmarksApi.create(dto, token);
  },

  update: async (id, dto) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return bookmarksApi.update(id, dto, token);
  },

  delete: async (id) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    await bookmarksApi.delete(id, token);
  },

  toggleFavorite: async (bookmark) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return bookmarksApi.update(bookmark.id, {
      isFavorite: !bookmark.isFavorite,
    }, token);
  },

  trackClick: async (id) => {
    const token = await getToken();
    if (token) {
      await bookmarksApi.trackClick(id, token);
    }
  },

  reorder: async (items) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    await bookmarksApi.reorder(items, token);
  },

  checkDuplicate: async (url) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const all = await bookmarksApi.getAll(token);
    return all.some((b) => b.url === url);
  },

  exportAll: async () => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return bookmarksApi.getAll(token);
  },

  importMany: async (bookmarks) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return bookmarksApi.import(bookmarks, token);
  },
});

/**
 * Creates a localStorage-based bookmark service for unauthenticated users
 */
const createLocalBookmarkService = (): BookmarkService => ({
  getAll: async () => localBookmarksApi.getAll(),

  getById: async (id) => localBookmarksApi.getById(id),

  create: async (dto) => localBookmarksApi.create(dto),

  update: async (id, dto) => localBookmarksApi.update(id, dto),

  delete: async (id) => {
    localBookmarksApi.delete(id);
  },

  toggleFavorite: async (bookmark) =>
    localBookmarksApi.update(bookmark.id, {
      isFavorite: !bookmark.isFavorite,
    }),

  trackClick: async (id) => {
    localBookmarksApi.trackClick(id);
  },

  reorder: async (items) => {
    localBookmarksApi.reorder(items);
  },

  checkDuplicate: async (url) => localBookmarksApi.checkDuplicate(url),

  exportAll: async () => localBookmarksApi.getAll(),

  importMany: async (bookmarks) => {
    const created: Bookmark[] = [];
    for (const dto of bookmarks) {
      if (!localBookmarksApi.checkDuplicate(dto.url)) {
        created.push(localBookmarksApi.create(dto));
      }
    }
    return created;
  },
});

/**
 * Factory function to create the appropriate bookmark service
 * based on authentication state
 */
export const createBookmarkService = (
  isSignedIn: boolean,
  getToken: TokenProvider
): BookmarkService => {
  return isSignedIn
    ? createApiBookmarkService(getToken)
    : createLocalBookmarkService();
};

/**
 * Creates a mock bookmark service for testing
 */
export const createMockBookmarkService = (
  overrides: Partial<BookmarkService> = {}
): BookmarkService => ({
  getAll: async () => [],
  getById: async () => undefined,
  create: async (dto) => ({
    id: 'mock-id',
    ...dto,
    isFavorite: false,
    clickCount: 0,
    sortOrder: 0,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Bookmark),
  update: async () => undefined,
  delete: async () => {},
  toggleFavorite: async () => undefined,
  trackClick: async () => {},
  reorder: async () => {},
  checkDuplicate: async () => false,
  exportAll: async () => [],
  importMany: async () => [],
  ...overrides,
});

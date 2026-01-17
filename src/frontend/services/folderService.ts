/**
 * Folder Service - Business logic layer for folder operations
 * Uses factory pattern for dependency injection, making it easily testable
 */

import { Folder, CreateFolderDto, UpdateFolderDto } from '@/types';
import { foldersApi } from '@/lib/api';
import { localFoldersApi } from '@/lib/localStorage';

/**
 * Folder service interface - defines all folder operations
 */
export interface FolderService {
  getAll: () => Promise<Folder[]>;
  getById: (id: string) => Promise<Folder | undefined>;
  create: (dto: CreateFolderDto) => Promise<Folder>;
  update: (id: string, dto: UpdateFolderDto) => Promise<Folder | undefined>;
  delete: (id: string) => Promise<void>;
  reorder: (items: { id: string; sortOrder: number }[]) => Promise<void>;
}

/**
 * Token provider type - allows for flexible authentication
 */
export type TokenProvider = () => Promise<string | null>;

/**
 * Creates an API-based folder service for authenticated users
 */
const createApiFolderService = (getToken: TokenProvider): FolderService => ({
  getAll: async () => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return foldersApi.getAll(token);
  },

  getById: async (id) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const all = await foldersApi.getAll(token);
    return all.find((f) => f.id === id);
  },

  create: async (dto) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return foldersApi.create(dto, token);
  },

  update: async (id, dto) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return foldersApi.update(id, dto, token);
  },

  delete: async (id) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    await foldersApi.delete(id, token);
  },

  reorder: async (items) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    // API reorder if available, otherwise update individually
    for (const item of items) {
      await foldersApi.update(item.id, { sortOrder: item.sortOrder } as UpdateFolderDto, token);
    }
  },
});

/**
 * Creates a localStorage-based folder service for unauthenticated users
 */
const createLocalFolderService = (): FolderService => ({
  getAll: async () => localFoldersApi.getAll(),

  getById: async (id) => localFoldersApi.getById(id),

  create: async (dto) => localFoldersApi.create(dto),

  update: async (id, dto) => localFoldersApi.update(id, dto),

  delete: async (id) => {
    localFoldersApi.delete(id);
  },

  reorder: async (items) => {
    localFoldersApi.reorder(items);
  },
});

/**
 * Factory function to create the appropriate folder service
 * based on authentication state
 */
export const createFolderService = (
  isSignedIn: boolean,
  getToken: TokenProvider
): FolderService => {
  return isSignedIn
    ? createApiFolderService(getToken)
    : createLocalFolderService();
};

/**
 * Creates a mock folder service for testing
 */
export const createMockFolderService = (
  overrides: Partial<FolderService> = {}
): FolderService => ({
  getAll: async () => [],
  getById: async () => undefined,
  create: async (dto) => ({
    id: 'mock-folder-id',
    name: dto.name,
    color: dto.color,
    icon: dto.icon,
    sortOrder: 0,
    parentFolderId: dto.parentFolderId,
    bookmarkCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  update: async () => undefined,
  delete: async () => {},
  reorder: async () => {},
  ...overrides,
});

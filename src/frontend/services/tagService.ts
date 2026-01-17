/**
 * Tag Service - Business logic layer for tag operations
 * Uses factory pattern for dependency injection, making it easily testable
 */

import { Tag, CreateTagDto, UpdateTagDto } from '@/types';
import { tagsApi } from '@/lib/api';
import { localTagsApi } from '@/lib/localStorage';

/**
 * Tag service interface - defines all tag operations
 */
export interface TagService {
  getAll: () => Promise<Tag[]>;
  getById: (id: string) => Promise<Tag | undefined>;
  create: (dto: CreateTagDto) => Promise<Tag>;
  update: (id: string, dto: UpdateTagDto) => Promise<Tag | undefined>;
  delete: (id: string) => Promise<void>;
}

/**
 * Token provider type - allows for flexible authentication
 */
export type TokenProvider = () => Promise<string | null>;

/**
 * Creates an API-based tag service for authenticated users
 */
const createApiTagService = (getToken: TokenProvider): TagService => ({
  getAll: async () => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return tagsApi.getAll(token);
  },

  getById: async (id) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const all = await tagsApi.getAll(token);
    return all.find((t) => t.id === id);
  },

  create: async (dto) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return tagsApi.create(dto, token);
  },

  update: async (id, dto) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return tagsApi.update(id, dto, token);
  },

  delete: async (id) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    await tagsApi.delete(id, token);
  },
});

/**
 * Creates a localStorage-based tag service for unauthenticated users
 */
const createLocalTagService = (): TagService => ({
  getAll: async () => localTagsApi.getAll(),

  getById: async (id) => localTagsApi.getById(id),

  create: async (dto) => localTagsApi.create(dto),

  update: async (id, dto) => localTagsApi.update(id, dto),

  delete: async (id) => {
    localTagsApi.delete(id);
  },
});

/**
 * Factory function to create the appropriate tag service
 * based on authentication state
 */
export const createTagService = (
  isSignedIn: boolean,
  getToken: TokenProvider
): TagService => {
  return isSignedIn
    ? createApiTagService(getToken)
    : createLocalTagService();
};

/**
 * Creates a mock tag service for testing
 */
export const createMockTagService = (
  overrides: Partial<TagService> = {}
): TagService => ({
  getAll: async () => [],
  getById: async () => undefined,
  create: async (dto) => ({
    id: 'mock-tag-id',
    name: dto.name,
    color: dto.color,
    bookmarkCount: 0,
    createdAt: new Date().toISOString(),
  }),
  update: async () => undefined,
  delete: async () => {},
  ...overrides,
});

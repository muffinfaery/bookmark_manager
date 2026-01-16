import {
  Bookmark,
  Folder,
  FolderWithBookmarks,
  Tag,
  CreateBookmarkDto,
  UpdateBookmarkDto,
  CreateFolderDto,
  UpdateFolderDto,
  CreateTagDto,
  UpdateTagDto,
  UrlMetadata,
  BookmarkExport,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(response.status, errorData.message || 'An error occurred');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Bookmarks
export const bookmarksApi = {
  getAll: (token: string) => fetchWithAuth<Bookmark[]>('/bookmarks', {}, token),

  getById: (id: string, token: string) =>
    fetchWithAuth<Bookmark>(`/bookmarks/${id}`, {}, token),

  getByFolder: (folderId: string | null, token: string) =>
    fetchWithAuth<Bookmark[]>(`/bookmarks/folder/${folderId || ''}`, {}, token),

  getFavorites: (token: string) =>
    fetchWithAuth<Bookmark[]>('/bookmarks/favorites', {}, token),

  search: (query: string, token: string) =>
    fetchWithAuth<Bookmark[]>(`/bookmarks/search?q=${encodeURIComponent(query)}`, {}, token),

  getMostUsed: (count: number, token: string) =>
    fetchWithAuth<Bookmark[]>(`/bookmarks/most-used?count=${count}`, {}, token),

  create: (dto: CreateBookmarkDto, token: string) =>
    fetchWithAuth<Bookmark>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify(dto),
    }, token),

  update: (id: string, dto: UpdateBookmarkDto, token: string) =>
    fetchWithAuth<Bookmark>(`/bookmarks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }, token),

  delete: (id: string, token: string) =>
    fetchWithAuth<void>(`/bookmarks/${id}`, { method: 'DELETE' }, token),

  checkDuplicate: (url: string, token: string) =>
    fetchWithAuth<{ isDuplicate: boolean }>(`/bookmarks/check-duplicate?url=${encodeURIComponent(url)}`, {}, token),

  trackClick: (id: string, token: string) =>
    fetchWithAuth<void>(`/bookmarks/${id}/click`, { method: 'POST' }, token),

  reorder: (items: { id: string; sortOrder: number }[], token: string) =>
    fetchWithAuth<void>('/bookmarks/reorder', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }, token),

  import: (bookmarks: CreateBookmarkDto[], token: string) =>
    fetchWithAuth<Bookmark[]>('/bookmarks/import', {
      method: 'POST',
      body: JSON.stringify({ bookmarks }),
    }, token),

  export: (token: string) =>
    fetchWithAuth<BookmarkExport>('/bookmarks/export', {}, token),
};

// Folders
export const foldersApi = {
  getAll: (token: string) => fetchWithAuth<Folder[]>('/folders', {}, token),

  getById: (id: string, token: string) =>
    fetchWithAuth<Folder>(`/folders/${id}`, {}, token),

  getWithBookmarks: (id: string, token: string) =>
    fetchWithAuth<FolderWithBookmarks>(`/folders/${id}/with-bookmarks`, {}, token),

  getRootFolders: (token: string) =>
    fetchWithAuth<Folder[]>('/folders/root', {}, token),

  getSubFolders: (parentId: string, token: string) =>
    fetchWithAuth<Folder[]>(`/folders/${parentId}/subfolders`, {}, token),

  create: (dto: CreateFolderDto, token: string) =>
    fetchWithAuth<Folder>('/folders', {
      method: 'POST',
      body: JSON.stringify(dto),
    }, token),

  update: (id: string, dto: UpdateFolderDto, token: string) =>
    fetchWithAuth<Folder>(`/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }, token),

  delete: (id: string, token: string) =>
    fetchWithAuth<void>(`/folders/${id}`, { method: 'DELETE' }, token),

  reorder: (items: { id: string; sortOrder: number }[], token: string) =>
    fetchWithAuth<void>('/folders/reorder', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }, token),
};

// Tags
export const tagsApi = {
  getAll: (token: string) => fetchWithAuth<Tag[]>('/tags', {}, token),

  getById: (id: string, token: string) =>
    fetchWithAuth<Tag>(`/tags/${id}`, {}, token),

  create: (dto: CreateTagDto, token: string) =>
    fetchWithAuth<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(dto),
    }, token),

  update: (id: string, dto: UpdateTagDto, token: string) =>
    fetchWithAuth<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }, token),

  delete: (id: string, token: string) =>
    fetchWithAuth<void>(`/tags/${id}`, { method: 'DELETE' }, token),
};

// Metadata
export const metadataApi = {
  fetch: (url: string, token: string) =>
    fetchWithAuth<UrlMetadata>('/metadata/fetch', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }, token),
};

export { ApiError };

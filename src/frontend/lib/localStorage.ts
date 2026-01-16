import { v4 as uuidv4 } from 'uuid';
import {
  Bookmark,
  Folder,
  Tag,
  CreateBookmarkDto,
  UpdateBookmarkDto,
  CreateFolderDto,
  UpdateFolderDto,
  CreateTagDto,
  UpdateTagDto,
  LocalStorageData,
} from '@/types';

const STORAGE_KEY = 'bookmark_manager_data';

function getStorageData(): LocalStorageData {
  if (typeof window === 'undefined') {
    return { bookmarks: [], folders: [], tags: [] };
  }
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return { bookmarks: [], folders: [], tags: [] };
  }
  try {
    return JSON.parse(data);
  } catch {
    return { bookmarks: [], folders: [], tags: [] };
  }
}

function setStorageData(data: LocalStorageData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Bookmarks
export const localBookmarksApi = {
  getAll: (): Bookmark[] => {
    return getStorageData().bookmarks;
  },

  getById: (id: string): Bookmark | undefined => {
    return getStorageData().bookmarks.find((b) => b.id === id);
  },

  getByFolder: (folderId: string | null): Bookmark[] => {
    return getStorageData().bookmarks.filter((b) =>
      folderId ? b.folderId === folderId : !b.folderId
    );
  },

  getFavorites: (): Bookmark[] => {
    return getStorageData().bookmarks.filter((b) => b.isFavorite);
  },

  search: (query: string): Bookmark[] => {
    const lowerQuery = query.toLowerCase();
    return getStorageData().bookmarks.filter(
      (b) =>
        b.title.toLowerCase().includes(lowerQuery) ||
        b.url.toLowerCase().includes(lowerQuery) ||
        b.description?.toLowerCase().includes(lowerQuery) ||
        b.tags.some((t) => t.name.toLowerCase().includes(lowerQuery))
    );
  },

  getMostUsed: (count: number): Bookmark[] => {
    return [...getStorageData().bookmarks]
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, count);
  },

  create: (dto: CreateBookmarkDto): Bookmark => {
    const data = getStorageData();
    const folder = dto.folderId
      ? data.folders.find((f) => f.id === dto.folderId)
      : undefined;

    const tags: Tag[] = (dto.tags || []).map((tagName) => {
      let tag = data.tags.find(
        (t) => t.name.toLowerCase() === tagName.toLowerCase()
      );
      if (!tag) {
        tag = {
          id: uuidv4(),
          name: tagName,
          bookmarkCount: 0,
          createdAt: new Date().toISOString(),
        };
        data.tags.push(tag);
      }
      return tag;
    });

    const bookmark: Bookmark = {
      id: uuidv4(),
      url: dto.url,
      title: dto.title,
      description: dto.description,
      favicon: dto.favicon,
      isFavorite: false,
      clickCount: 0,
      sortOrder: data.bookmarks.length,
      folderId: dto.folderId,
      folderName: folder?.name,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.bookmarks.push(bookmark);
    setStorageData(data);
    return bookmark;
  },

  update: (id: string, dto: UpdateBookmarkDto): Bookmark | undefined => {
    const data = getStorageData();
    const index = data.bookmarks.findIndex((b) => b.id === id);
    if (index === -1) return undefined;

    const bookmark = data.bookmarks[index];

    if (dto.url !== undefined) bookmark.url = dto.url;
    if (dto.title !== undefined) bookmark.title = dto.title;
    if (dto.description !== undefined) bookmark.description = dto.description;
    if (dto.favicon !== undefined) bookmark.favicon = dto.favicon;
    if (dto.isFavorite !== undefined) bookmark.isFavorite = dto.isFavorite;
    if (dto.folderId !== undefined) {
      bookmark.folderId = dto.folderId;
      const folder = data.folders.find((f) => f.id === dto.folderId);
      bookmark.folderName = folder?.name;
    }
    if (dto.tags !== undefined) {
      bookmark.tags = dto.tags.map((tagName) => {
        let tag = data.tags.find(
          (t) => t.name.toLowerCase() === tagName.toLowerCase()
        );
        if (!tag) {
          tag = {
            id: uuidv4(),
            name: tagName,
            bookmarkCount: 0,
            createdAt: new Date().toISOString(),
          };
          data.tags.push(tag);
        }
        return tag;
      });
    }
    bookmark.updatedAt = new Date().toISOString();

    data.bookmarks[index] = bookmark;
    setStorageData(data);
    return bookmark;
  },

  delete: (id: string): boolean => {
    const data = getStorageData();
    const index = data.bookmarks.findIndex((b) => b.id === id);
    if (index === -1) return false;
    data.bookmarks.splice(index, 1);
    setStorageData(data);
    return true;
  },

  checkDuplicate: (url: string): boolean => {
    return getStorageData().bookmarks.some((b) => b.url === url);
  },

  trackClick: (id: string): void => {
    const data = getStorageData();
    const bookmark = data.bookmarks.find((b) => b.id === id);
    if (bookmark) {
      bookmark.clickCount++;
      setStorageData(data);
    }
  },

  reorder: (items: { id: string; sortOrder: number }[]): void => {
    const data = getStorageData();
    items.forEach(({ id, sortOrder }) => {
      const bookmark = data.bookmarks.find((b) => b.id === id);
      if (bookmark) {
        bookmark.sortOrder = sortOrder;
      }
    });
    setStorageData(data);
  },
};

// Folders
export const localFoldersApi = {
  getAll: (): Folder[] => {
    const data = getStorageData();
    return data.folders.map((folder) => ({
      ...folder,
      bookmarkCount: data.bookmarks.filter((b) => b.folderId === folder.id).length,
    }));
  },

  getById: (id: string): Folder | undefined => {
    return getStorageData().folders.find((f) => f.id === id);
  },

  getRootFolders: (): Folder[] => {
    return getStorageData().folders.filter((f) => !f.parentFolderId);
  },

  getSubFolders: (parentId: string): Folder[] => {
    return getStorageData().folders.filter((f) => f.parentFolderId === parentId);
  },

  create: (dto: CreateFolderDto): Folder => {
    const data = getStorageData();
    const folder: Folder = {
      id: uuidv4(),
      name: dto.name,
      color: dto.color,
      icon: dto.icon,
      sortOrder: data.folders.length,
      parentFolderId: dto.parentFolderId,
      bookmarkCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.folders.push(folder);
    setStorageData(data);
    return folder;
  },

  update: (id: string, dto: UpdateFolderDto): Folder | undefined => {
    const data = getStorageData();
    const index = data.folders.findIndex((f) => f.id === id);
    if (index === -1) return undefined;

    const folder = data.folders[index];
    if (dto.name !== undefined) folder.name = dto.name;
    if (dto.color !== undefined) folder.color = dto.color;
    if (dto.icon !== undefined) folder.icon = dto.icon;
    if (dto.parentFolderId !== undefined) folder.parentFolderId = dto.parentFolderId;
    folder.updatedAt = new Date().toISOString();

    data.folders[index] = folder;
    setStorageData(data);
    return folder;
  },

  delete: (id: string): boolean => {
    const data = getStorageData();
    const index = data.folders.findIndex((f) => f.id === id);
    if (index === -1) return false;

    // Remove bookmarks from this folder
    data.bookmarks.forEach((b) => {
      if (b.folderId === id) {
        b.folderId = undefined;
        b.folderName = undefined;
      }
    });

    // Remove subfolders
    data.folders = data.folders.filter(
      (f) => f.id !== id && f.parentFolderId !== id
    );

    setStorageData(data);
    return true;
  },

  reorder: (items: { id: string; sortOrder: number }[]): void => {
    const data = getStorageData();
    items.forEach(({ id, sortOrder }) => {
      const folder = data.folders.find((f) => f.id === id);
      if (folder) {
        folder.sortOrder = sortOrder;
      }
    });
    setStorageData(data);
  },
};

// Tags
export const localTagsApi = {
  getAll: (): Tag[] => {
    const data = getStorageData();
    return data.tags.map((tag) => ({
      ...tag,
      bookmarkCount: data.bookmarks.filter((b) =>
        b.tags.some((t) => t.id === tag.id)
      ).length,
    }));
  },

  getById: (id: string): Tag | undefined => {
    return getStorageData().tags.find((t) => t.id === id);
  },

  create: (dto: CreateTagDto): Tag => {
    const data = getStorageData();
    const existing = data.tags.find(
      (t) => t.name.toLowerCase() === dto.name.toLowerCase()
    );
    if (existing) throw new Error('Tag already exists');

    const tag: Tag = {
      id: uuidv4(),
      name: dto.name,
      color: dto.color,
      bookmarkCount: 0,
      createdAt: new Date().toISOString(),
    };
    data.tags.push(tag);
    setStorageData(data);
    return tag;
  },

  update: (id: string, dto: UpdateTagDto): Tag | undefined => {
    const data = getStorageData();
    const index = data.tags.findIndex((t) => t.id === id);
    if (index === -1) return undefined;

    const tag = data.tags[index];
    if (dto.name !== undefined) {
      const existing = data.tags.find(
        (t) => t.name.toLowerCase() === dto.name!.toLowerCase() && t.id !== id
      );
      if (existing) throw new Error('Tag already exists');
      tag.name = dto.name;
    }
    if (dto.color !== undefined) tag.color = dto.color;

    data.tags[index] = tag;
    setStorageData(data);
    return tag;
  },

  delete: (id: string): boolean => {
    const data = getStorageData();
    const index = data.tags.findIndex((t) => t.id === id);
    if (index === -1) return false;

    // Remove tag from bookmarks
    data.bookmarks.forEach((b) => {
      b.tags = b.tags.filter((t) => t.id !== id);
    });

    data.tags.splice(index, 1);
    setStorageData(data);
    return true;
  },
};

// Export/Import
export const localDataApi = {
  export: (): LocalStorageData => {
    return getStorageData();
  },

  import: (importData: LocalStorageData): void => {
    const data = getStorageData();

    // Merge data, avoiding duplicates by URL for bookmarks
    importData.bookmarks.forEach((bookmark) => {
      if (!data.bookmarks.some((b) => b.url === bookmark.url)) {
        data.bookmarks.push({ ...bookmark, id: uuidv4() });
      }
    });

    importData.folders.forEach((folder) => {
      if (!data.folders.some((f) => f.name === folder.name)) {
        data.folders.push({ ...folder, id: uuidv4() });
      }
    });

    importData.tags.forEach((tag) => {
      if (!data.tags.some((t) => t.name.toLowerCase() === tag.name.toLowerCase())) {
        data.tags.push({ ...tag, id: uuidv4() });
      }
    });

    setStorageData(data);
  },

  clear: (): void => {
    setStorageData({ bookmarks: [], folders: [], tags: [] });
  },

  hasData: (): boolean => {
    const data = getStorageData();
    return data.bookmarks.length > 0 || data.folders.length > 0;
  },
};

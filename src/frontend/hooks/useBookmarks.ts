'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import Fuse from 'fuse.js';
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
  ViewMode,
  FilterType,
} from '@/types';
import { bookmarksApi, foldersApi, tagsApi } from '@/lib/api';
import {
  localBookmarksApi,
  localFoldersApi,
  localTagsApi,
  localDataApi,
} from '@/lib/localStorage';

export function useBookmarks() {
  const { isSignedIn, getToken } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);

  // Ref to track current bookmarks for optimistic updates rollback
  const bookmarksRef = useRef<Bookmark[]>(bookmarks);
  bookmarksRef.current = bookmarks;

  // Configure Fuse.js for fuzzy search with weighted fields
  const fuse = useMemo(() => {
    return new Fuse(bookmarks, {
      keys: [
        { name: 'title', weight: 0.5 },
        { name: 'description', weight: 0.3 },
        { name: 'url', weight: 0.15 },
        { name: 'tags.name', weight: 0.05 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
      includeScore: true,
    });
  }, [bookmarks]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSignedIn) {
        const token = await getToken();
        if (token) {
          const [bookmarksData, foldersData, tagsData] = await Promise.all([
            bookmarksApi.getAll(token),
            foldersApi.getAll(token),
            tagsApi.getAll(token),
          ]);
          setBookmarks(bookmarksData);
          setFolders(foldersData);
          setTags(tagsData);
        }
      } else {
        // Use localStorage
        setBookmarks(localBookmarksApi.getAll());
        setFolders(localFoldersApi.getAll());
        setTags(localTagsApi.getAll());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get filtered bookmarks
  const getFilteredBookmarks = useCallback(() => {
    let filtered = bookmarks;

    switch (filterType) {
      case 'favorites':
        filtered = bookmarks.filter((b) => b.isFavorite);
        break;
      case 'folder':
        filtered = bookmarks.filter((b) =>
          selectedFolderId ? b.folderId === selectedFolderId : !b.folderId
        );
        break;
      case 'tag':
        if (selectedTagId) {
          filtered = bookmarks.filter((b) =>
            b.tags.some((t) => t.id === selectedTagId)
          );
        }
        break;
      case 'search':
        if (searchQuery) {
          const results = fuse.search(searchQuery);
          filtered = results.map((result) => result.item);
        }
        break;
    }

    // For search, preserve the relevance order from Fuse.js
    if (filterType === 'search' && searchQuery) {
      return filtered;
    }
    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [bookmarks, filterType, selectedFolderId, selectedTagId, searchQuery, fuse]);

  // Bookmark operations
  const createBookmark = useCallback(
    async (dto: CreateBookmarkDto) => {
      try {
        let newBookmark: Bookmark;
        if (isSignedIn) {
          const token = await getToken();
          if (!token) throw new Error('Not authenticated');
          newBookmark = await bookmarksApi.create(dto, token);
        } else {
          newBookmark = localBookmarksApi.create(dto);
          // Show sync prompt on first save
          if (!showSyncPrompt && localBookmarksApi.getAll().length === 1) {
            setShowSyncPrompt(true);
          }
        }
        setBookmarks((prev) => [...prev, newBookmark]);
        return newBookmark;
      } catch (err) {
        throw err;
      }
    },
    [isSignedIn, getToken, showSyncPrompt]
  );

  const updateBookmark = useCallback(
    async (id: string, dto: UpdateBookmarkDto) => {
      try {
        let updated: Bookmark | undefined;
        if (isSignedIn) {
          const token = await getToken();
          if (!token) throw new Error('Not authenticated');
          updated = await bookmarksApi.update(id, dto, token);
        } else {
          updated = localBookmarksApi.update(id, dto);
        }
        if (updated) {
          setBookmarks((prev) =>
            prev.map((b) => (b.id === id ? updated! : b))
          );
        }
        return updated;
      } catch (err) {
        throw err;
      }
    },
    [isSignedIn, getToken]
  );

  const deleteBookmark = useCallback(
    async (id: string) => {
      try {
        if (isSignedIn) {
          const token = await getToken();
          if (!token) throw new Error('Not authenticated');
          await bookmarksApi.delete(id, token);
        } else {
          localBookmarksApi.delete(id);
        }
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
      } catch (err) {
        throw err;
      }
    },
    [isSignedIn, getToken]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const bookmark = bookmarks.find((b) => b.id === id);
      if (bookmark) {
        await updateBookmark(id, { isFavorite: !bookmark.isFavorite });
      }
    },
    [bookmarks, updateBookmark]
  );

  const trackClick = useCallback(
    async (id: string) => {
      try {
        if (isSignedIn) {
          const token = await getToken();
          if (token) {
            await bookmarksApi.trackClick(id, token);
          }
        } else {
          localBookmarksApi.trackClick(id);
        }
        setBookmarks((prev) =>
          prev.map((b) =>
            b.id === id ? { ...b, clickCount: b.clickCount + 1 } : b
          )
        );
      } catch (err) {
        // Silently fail for click tracking
      }
    },
    [isSignedIn, getToken]
  );

  const reorderBookmarks = useCallback(
    async (items: { id: string; sortOrder: number }[]) => {
      // Store previous state for rollback on error (use ref to avoid stale closure)
      const previousBookmarks = [...bookmarksRef.current];

      // Optimistic update - update UI immediately
      setBookmarks((prev) => {
        const updated = [...prev];
        items.forEach(({ id, sortOrder }) => {
          const bookmark = updated.find((b) => b.id === id);
          if (bookmark) {
            bookmark.sortOrder = sortOrder;
          }
        });
        return updated.sort((a, b) => a.sortOrder - b.sortOrder);
      });

      // Persist to backend/localStorage in background
      try {
        if (isSignedIn) {
          const token = await getToken();
          if (!token) throw new Error('Not authenticated');
          await bookmarksApi.reorder(items, token);
        } else {
          localBookmarksApi.reorder(items);
        }
      } catch (err) {
        // Rollback on error
        setBookmarks(previousBookmarks);
        throw err;
      }
    },
    [isSignedIn, getToken]
  );

  // Folder operations
  const createFolder = useCallback(
    async (dto: CreateFolderDto) => {
      try {
        let newFolder: Folder;
        if (isSignedIn) {
          const token = await getToken();
          if (!token) throw new Error('Not authenticated');
          newFolder = await foldersApi.create(dto, token);
        } else {
          newFolder = localFoldersApi.create(dto);
        }
        setFolders((prev) => [...prev, newFolder]);
        return newFolder;
      } catch (err) {
        throw err;
      }
    },
    [isSignedIn, getToken]
  );

  const updateFolder = useCallback(
    async (id: string, dto: UpdateFolderDto) => {
      try {
        let updated: Folder | undefined;
        if (isSignedIn) {
          const token = await getToken();
          if (!token) throw new Error('Not authenticated');
          updated = await foldersApi.update(id, dto, token);
        } else {
          updated = localFoldersApi.update(id, dto);
        }
        if (updated) {
          setFolders((prev) => prev.map((f) => (f.id === id ? updated! : f)));
        }
        return updated;
      } catch (err) {
        throw err;
      }
    },
    [isSignedIn, getToken]
  );

  const deleteFolder = useCallback(
    async (id: string) => {
      try {
        if (isSignedIn) {
          const token = await getToken();
          if (!token) throw new Error('Not authenticated');
          await foldersApi.delete(id, token);
        } else {
          localFoldersApi.delete(id);
        }
        setFolders((prev) => prev.filter((f) => f.id !== id));
        // Update bookmarks that were in this folder
        setBookmarks((prev) =>
          prev.map((b) =>
            b.folderId === id ? { ...b, folderId: undefined, folderName: undefined } : b
          )
        );
      } catch (err) {
        throw err;
      }
    },
    [isSignedIn, getToken]
  );

  // Tag operations
  const createTag = useCallback(
    async (dto: CreateTagDto) => {
      try {
        let newTag: Tag;
        if (isSignedIn) {
          const token = await getToken();
          if (!token) throw new Error('Not authenticated');
          newTag = await tagsApi.create(dto, token);
        } else {
          newTag = localTagsApi.create(dto);
        }
        setTags((prev) => [...prev, newTag]);
        return newTag;
      } catch (err) {
        throw err;
      }
    },
    [isSignedIn, getToken]
  );

  const deleteTag = useCallback(
    async (id: string) => {
      try {
        if (isSignedIn) {
          const token = await getToken();
          if (!token) throw new Error('Not authenticated');
          await tagsApi.delete(id, token);
        } else {
          localTagsApi.delete(id);
        }
        setTags((prev) => prev.filter((t) => t.id !== id));
        // Update bookmarks that had this tag
        setBookmarks((prev) =>
          prev.map((b) => ({
            ...b,
            tags: b.tags.filter((t) => t.id !== id),
          }))
        );
      } catch (err) {
        throw err;
      }
    },
    [isSignedIn, getToken]
  );

  // Export/Import
  const exportData = useCallback(async () => {
    if (isSignedIn) {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return bookmarksApi.export(token);
    } else {
      const data = localDataApi.export();
      return {
        bookmarks,
        folders,
        tags,
        exportedAt: new Date().toISOString(),
      };
    }
  }, [isSignedIn, getToken, bookmarks, folders, tags]);

  const importData = useCallback(
    async (data: { bookmarks: any[]; folders?: any[] }) => {
      if (isSignedIn) {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        // Create folders first if provided
        const folderNameToId: Record<string, string> = {};
        if (data.folders && data.folders.length > 0) {
          for (const folder of data.folders) {
            // Check if folder already exists
            const existingFolder = folders.find(
              (f) => f.name.toLowerCase() === folder.name.toLowerCase()
            );
            if (existingFolder) {
              folderNameToId[folder.name] = existingFolder.id;
            } else {
              const newFolder = await foldersApi.create({ name: folder.name }, token);
              folderNameToId[folder.name] = newFolder.id;
              setFolders((prev) => [...prev, newFolder]);
            }
          }
        }

        // Map bookmarks to include folder IDs
        const bookmarksToImport = data.bookmarks.map((b) => ({
          url: b.url,
          title: b.title,
          description: b.description,
          favicon: b.favicon,
          folderId: b.folderName ? folderNameToId[b.folderName] : undefined,
          tags: b.tags,
          isFavorite: b.isFavorite,
        }));

        const imported = await bookmarksApi.import(bookmarksToImport, token);
        setBookmarks((prev) => [...prev, ...imported]);
        return imported;
      } else {
        // Create folders first if provided
        const folderNameToId: Record<string, string> = {};
        if (data.folders && data.folders.length > 0) {
          const existingFolders = localFoldersApi.getAll();
          for (const folder of data.folders) {
            const existingFolder = existingFolders.find(
              (f) => f.name.toLowerCase() === folder.name.toLowerCase()
            );
            if (existingFolder) {
              folderNameToId[folder.name] = existingFolder.id;
            } else {
              const newFolder = localFoldersApi.create({ name: folder.name });
              folderNameToId[folder.name] = newFolder.id;
            }
          }
          setFolders(localFoldersApi.getAll());
        }

        // Import bookmarks with folder mapping
        data.bookmarks.forEach((b) => {
          if (!localBookmarksApi.checkDuplicate(b.url)) {
            const created = localBookmarksApi.create({
              url: b.url,
              title: b.title,
              description: b.description,
              favicon: b.favicon,
              folderId: b.folderName ? folderNameToId[b.folderName] : undefined,
              tags: b.tags,
            });
            // Update favorite status if needed (not part of CreateBookmarkDto)
            if (b.isFavorite) {
              localBookmarksApi.update(created.id, { isFavorite: true });
            }
          }
        });
        setBookmarks(localBookmarksApi.getAll());
      }
    },
    [isSignedIn, getToken, folders]
  );

  return {
    // Data
    bookmarks,
    folders,
    tags,
    loading,
    error,

    // View state
    viewMode,
    setViewMode,
    filterType,
    setFilterType,
    selectedFolderId,
    setSelectedFolderId,
    selectedTagId,
    setSelectedTagId,
    searchQuery,
    setSearchQuery,
    showSyncPrompt,
    setShowSyncPrompt,

    // Computed
    filteredBookmarks: getFilteredBookmarks(),

    // Bookmark operations
    createBookmark,
    updateBookmark,
    deleteBookmark,
    toggleFavorite,
    trackClick,
    reorderBookmarks,

    // Folder operations
    createFolder,
    updateFolder,
    deleteFolder,

    // Tag operations
    createTag,
    deleteTag,

    // Data operations
    exportData,
    importData,
    refreshData: loadData,
  };
}

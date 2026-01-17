'use client';

/**
 * Hook for managing bookmark filter state
 * Handles filter type, folder selection, tag selection, and search query
 * Pure state management - no business logic
 */

import { useState, useCallback } from 'react';
import { FilterType } from '@/types';

export interface BookmarkFilters {
  filterType: FilterType;
  selectedFolderId: string | null;
  selectedTagId: string | null;
  searchQuery: string;
}

export interface UseBookmarkFiltersReturn extends BookmarkFilters {
  setFilterType: (type: FilterType) => void;
  setSelectedFolderId: (id: string | null) => void;
  setSelectedTagId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  selectFolder: (folderId: string | null) => void;
  selectTag: (tagId: string | null) => void;
  showFavorites: () => void;
  showAll: () => void;
  search: (query: string) => void;
  clearFilters: () => void;
}

/**
 * Hook for managing bookmark filter state
 */
export function useBookmarkFilters(): UseBookmarkFiltersReturn {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Convenience methods that combine state updates
  const selectFolder = useCallback((folderId: string | null) => {
    setFilterType('folder');
    setSelectedFolderId(folderId);
    setSelectedTagId(null);
    setSearchQuery('');
  }, []);

  const selectTag = useCallback((tagId: string | null) => {
    if (tagId) {
      setFilterType('tag');
      setSelectedTagId(tagId);
      setSelectedFolderId(null);
      setSearchQuery('');
    }
  }, []);

  const showFavorites = useCallback(() => {
    setFilterType('favorites');
    setSelectedFolderId(null);
    setSelectedTagId(null);
    setSearchQuery('');
  }, []);

  const showAll = useCallback(() => {
    setFilterType('all');
    setSelectedFolderId(null);
    setSelectedTagId(null);
    setSearchQuery('');
  }, []);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setFilterType('search');
    } else {
      setFilterType('all');
    }
  }, []);

  const clearFilters = useCallback(() => {
    setFilterType('all');
    setSelectedFolderId(null);
    setSelectedTagId(null);
    setSearchQuery('');
  }, []);

  return {
    // State
    filterType,
    selectedFolderId,
    selectedTagId,
    searchQuery,
    // Setters
    setFilterType,
    setSelectedFolderId,
    setSelectedTagId,
    setSearchQuery,
    // Convenience methods
    selectFolder,
    selectTag,
    showFavorites,
    showAll,
    search,
    clearFilters,
  };
}

/**
 * Folder utility functions - pure, no React dependencies
 * Handles folder searching and filtering
 */

import Fuse, { IFuseOptions } from 'fuse.js';
import { Folder } from '@/types';

/**
 * Fuse.js configuration for folder search
 */
export const FOLDER_FUSE_OPTIONS: IFuseOptions<Folder> = {
  keys: ['name'],
  threshold: 0.4,
  ignoreLocation: true,
};

/**
 * Creates a Fuse.js instance for folder searching
 */
export const createFolderSearcher = (folders: Folder[]): Fuse<Folder> =>
  new Fuse(folders, FOLDER_FUSE_OPTIONS);

/**
 * Performs fuzzy search on folders using Fuse.js
 */
export const fuzzySearchFolders = (
  fuse: Fuse<Folder>,
  query: string
): Folder[] => {
  if (!query.trim()) return [];
  const results = fuse.search(query);
  return results.map((result) => result.item);
};

/**
 * Finds a folder by ID
 */
export const findFolderById = (
  folders: Folder[],
  id: string | null
): Folder | undefined => {
  if (!id) return undefined;
  return folders.find((f) => f.id === id);
};

/**
 * Finds a folder by name (case-insensitive)
 */
export const findFolderByName = (
  folders: Folder[],
  name: string
): Folder | undefined => {
  const lowerName = name.toLowerCase();
  return folders.find((f) => f.name.toLowerCase() === lowerName);
};

/**
 * Gets root folders (folders without a parent)
 */
export const getRootFolders = (folders: Folder[]): Folder[] =>
  folders.filter((f) => !f.parentFolderId);

/**
 * Gets subfolders of a specific parent folder
 */
export const getSubFolders = (
  folders: Folder[],
  parentId: string
): Folder[] => folders.filter((f) => f.parentFolderId === parentId);

/**
 * Sorts folders by their sortOrder property
 */
export const sortFoldersByOrder = (folders: Folder[]): Folder[] =>
  [...folders].sort((a, b) => a.sortOrder - b.sortOrder);

/**
 * Sorts folders alphabetically by name
 */
export const sortFoldersByName = (folders: Folder[]): Folder[] =>
  [...folders].sort((a, b) => a.name.localeCompare(b.name));

/**
 * Checks if a folder name already exists (case-insensitive)
 */
export const folderNameExists = (
  folders: Folder[],
  name: string,
  excludeId?: string
): boolean => {
  const lowerName = name.toLowerCase();
  return folders.some(
    (f) => f.name.toLowerCase() === lowerName && f.id !== excludeId
  );
};

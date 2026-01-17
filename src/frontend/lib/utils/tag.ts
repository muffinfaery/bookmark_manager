/**
 * Tag utility functions - pure, no React dependencies
 */

import Fuse, { IFuseOptions } from 'fuse.js';
import { Tag } from '@/types';

/**
 * Fuse.js configuration for tag search
 */
export const TAG_FUSE_OPTIONS: IFuseOptions<Tag> = {
  keys: ['name'],
  threshold: 0.4,
  ignoreLocation: true,
};

/**
 * Creates a Fuse.js instance for tag searching
 */
export const createTagSearcher = (tags: Tag[]): Fuse<Tag> =>
  new Fuse(tags, TAG_FUSE_OPTIONS);

/**
 * Performs fuzzy search on tags using Fuse.js
 */
export const fuzzySearchTags = (fuse: Fuse<Tag>, query: string): Tag[] => {
  if (!query.trim()) return [];
  const results = fuse.search(query);
  return results.map((result) => result.item);
};

/**
 * Finds a tag by ID
 */
export const findTagById = (
  tags: Tag[],
  id: string | null
): Tag | undefined => {
  if (!id) return undefined;
  return tags.find((t) => t.id === id);
};

/**
 * Finds a tag by name (case-insensitive)
 */
export const findTagByName = (tags: Tag[], name: string): Tag | undefined => {
  const lowerName = name.toLowerCase();
  return tags.find((t) => t.name.toLowerCase() === lowerName);
};

/**
 * Sorts tags by their bookmark count (most used first)
 */
export const sortTagsByUsage = (tags: Tag[]): Tag[] =>
  [...tags].sort((a, b) => b.bookmarkCount - a.bookmarkCount);

/**
 * Sorts tags alphabetically by name
 */
export const sortTagsByName = (tags: Tag[]): Tag[] =>
  [...tags].sort((a, b) => a.name.localeCompare(b.name));

/**
 * Checks if a tag name already exists (case-insensitive)
 */
export const tagNameExists = (
  tags: Tag[],
  name: string,
  excludeId?: string
): boolean => {
  const lowerName = name.toLowerCase();
  return tags.some(
    (t) => t.name.toLowerCase() === lowerName && t.id !== excludeId
  );
};

/**
 * Gets unique tag names from an array of tag name strings
 */
export const getUniqueTagNames = (tagNames: string[]): string[] => {
  const seen = new Set<string>();
  return tagNames.filter((name) => {
    const lower = name.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
};

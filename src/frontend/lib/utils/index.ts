/**
 * Barrel export for utility functions
 */

// URL utilities
export {
  isValidUrl,
  extractDomain,
  getFaviconUrl,
  normalizeUrl,
} from './url';

// Bookmark utilities
export {
  BOOKMARK_FUSE_OPTIONS,
  createBookmarkSearcher,
  fuzzySearchBookmarks,
  filterByFavorites,
  filterByFolder,
  filterByTag,
  sortByOrder,
  sortByClickCount,
  sortByNewest,
  getFilteredBookmarks,
  getBookmarkCount,
} from './bookmark';
export type { FilterOptions } from './bookmark';

// Folder utilities
export {
  FOLDER_FUSE_OPTIONS,
  createFolderSearcher,
  fuzzySearchFolders,
  findFolderById,
  findFolderByName,
  getRootFolders,
  getSubFolders,
  sortFoldersByOrder,
  sortFoldersByName,
  folderNameExists,
} from './folder';

// Tag utilities
export {
  TAG_FUSE_OPTIONS,
  createTagSearcher,
  fuzzySearchTags,
  findTagById,
  findTagByName,
  sortTagsByUsage,
  sortTagsByName,
  tagNameExists,
  getUniqueTagNames,
} from './tag';

// Page title utilities
export { getPageTitle, getPageSubtitle } from './pageTitle';
export type { PageTitleOptions } from './pageTitle';

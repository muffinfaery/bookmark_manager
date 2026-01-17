/**
 * Page title utility functions - pure, no React dependencies
 */

import { FilterType, Folder, Tag } from '@/types';

/**
 * Options for generating page title
 */
export interface PageTitleOptions {
  selectedFolderId?: string | null;
  selectedTagId?: string | null;
  folders: Folder[];
  tags: Tag[];
}

/**
 * Gets the page title based on the current filter type and selection
 */
export const getPageTitle = (
  filterType: FilterType,
  options: PageTitleOptions
): string => {
  const { selectedFolderId, selectedTagId, folders, tags } = options;

  switch (filterType) {
    case 'favorites':
      return 'Favorites';

    case 'folder':
      if (selectedFolderId) {
        const folder = folders.find((f) => f.id === selectedFolderId);
        return folder?.name || 'Folder';
      }
      return 'Uncategorized';

    case 'tag':
      if (selectedTagId) {
        const tag = tags.find((t) => t.id === selectedTagId);
        return tag ? `Tag: ${tag.name}` : 'All Bookmarks';
      }
      return 'All Bookmarks';

    case 'search':
      return 'Search Results';

    case 'all':
    default:
      return 'All Bookmarks';
  }
};

/**
 * Gets a subtitle/description for the current view
 */
export const getPageSubtitle = (
  filterType: FilterType,
  bookmarkCount: number,
  options: PageTitleOptions
): string => {
  const { selectedFolderId, selectedTagId, folders, tags } = options;
  const countText = `${bookmarkCount} bookmark${bookmarkCount !== 1 ? 's' : ''}`;

  switch (filterType) {
    case 'favorites':
      return `${countText} marked as favorite`;

    case 'folder':
      if (selectedFolderId) {
        const folder = folders.find((f) => f.id === selectedFolderId);
        return folder ? `${countText} in ${folder.name}` : countText;
      }
      return `${countText} without a folder`;

    case 'tag':
      if (selectedTagId) {
        const tag = tags.find((t) => t.id === selectedTagId);
        return tag ? `${countText} tagged with ${tag.name}` : countText;
      }
      return countText;

    case 'search':
      return `${countText} found`;

    case 'all':
    default:
      return countText;
  }
};

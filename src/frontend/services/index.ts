/**
 * Barrel export for services
 */

export {
  createBookmarkService,
  createMockBookmarkService,
} from './bookmarkService';
export type { BookmarkService } from './bookmarkService';

export {
  createFolderService,
  createMockFolderService,
} from './folderService';
export type { FolderService } from './folderService';

export {
  createTagService,
  createMockTagService,
} from './tagService';
export type { TagService } from './tagService';

export type { TokenProvider } from './bookmarkService';

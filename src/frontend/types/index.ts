export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  isFavorite: boolean;
  clickCount: number;
  sortOrder: number;
  folderId?: string;
  folderName?: string;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  parentFolderId?: string;
  bookmarkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FolderWithBookmarks extends Folder {
  bookmarks: Bookmark[];
  subFolders: Folder[];
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  bookmarkCount: number;
  createdAt: string;
}

export interface CreateBookmarkDto {
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  folderId?: string;
  tags?: string[];
}

export interface UpdateBookmarkDto {
  url?: string;
  title?: string;
  description?: string;
  favicon?: string;
  isFavorite?: boolean;
  folderId?: string;
  tags?: string[];
}

export interface CreateFolderDto {
  name: string;
  color?: string;
  icon?: string;
  parentFolderId?: string;
}

export interface UpdateFolderDto {
  name?: string;
  color?: string;
  icon?: string;
  parentFolderId?: string;
}

export interface CreateTagDto {
  name: string;
  color?: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
}

export interface UrlMetadata {
  url: string;
  title?: string;
  description?: string;
  favicon?: string;
  image?: string;
}

export interface BookmarkExport {
  bookmarks: Bookmark[];
  folders: Folder[];
  tags: Tag[];
  exportedAt: string;
}

export type ViewMode = 'grid' | 'list';

export type FilterType = 'all' | 'favorites' | 'folder' | 'tag' | 'search';

export interface LocalStorageData {
  bookmarks: Bookmark[];
  folders: Folder[];
  tags: Tag[];
  lastSynced?: string;
}

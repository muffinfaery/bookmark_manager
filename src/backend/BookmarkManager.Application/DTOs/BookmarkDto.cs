namespace BookmarkManager.Application.DTOs;

public record BookmarkDto(
    Guid Id,
    string Url,
    string Title,
    string? Description,
    string? Favicon,
    bool IsFavorite,
    int ClickCount,
    int SortOrder,
    Guid? FolderId,
    string? FolderName,
    List<TagDto> Tags,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateBookmarkDto(
    string Url,
    string Title,
    string? Description,
    string? Favicon,
    Guid? FolderId,
    List<string>? Tags
);

public record UpdateBookmarkDto(
    string? Url,
    string? Title,
    string? Description,
    string? Favicon,
    bool? IsFavorite,
    Guid? FolderId,
    List<string>? Tags
);

public record ReorderBookmarksDto(
    List<BookmarkOrderItem> Items
);

public record BookmarkOrderItem(
    Guid Id,
    int SortOrder
);

public record BulkImportDto(
    List<CreateBookmarkDto> Bookmarks
);

public record BookmarkExportDto(
    List<BookmarkDto> Bookmarks,
    List<FolderDto> Folders,
    List<TagDto> Tags,
    DateTime ExportedAt
);

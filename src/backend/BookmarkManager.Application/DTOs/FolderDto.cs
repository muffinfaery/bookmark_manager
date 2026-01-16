namespace BookmarkManager.Application.DTOs;

public record FolderDto(
    Guid Id,
    string Name,
    string? Color,
    string? Icon,
    int SortOrder,
    Guid? ParentFolderId,
    int BookmarkCount,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record FolderWithBookmarksDto(
    Guid Id,
    string Name,
    string? Color,
    string? Icon,
    int SortOrder,
    Guid? ParentFolderId,
    List<BookmarkDto> Bookmarks,
    List<FolderDto> SubFolders,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateFolderDto(
    string Name,
    string? Color,
    string? Icon,
    Guid? ParentFolderId
);

public record UpdateFolderDto(
    string? Name,
    string? Color,
    string? Icon,
    Guid? ParentFolderId
);

public record ReorderFoldersDto(
    List<FolderOrderItem> Items
);

public record FolderOrderItem(
    Guid Id,
    int SortOrder
);

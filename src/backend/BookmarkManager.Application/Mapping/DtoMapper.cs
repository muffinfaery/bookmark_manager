using BookmarkManager.Application.DTOs;
using BookmarkManager.Domain.Entities;

namespace BookmarkManager.Application.Mapping;

/// <summary>
/// Centralized DTO mapping for all entities.
/// </summary>
public static class DtoMapper
{
    public static BookmarkDto ToDto(Bookmark bookmark)
    {
        return new BookmarkDto(
            bookmark.Id,
            bookmark.Url,
            bookmark.Title,
            bookmark.Description,
            bookmark.Favicon,
            bookmark.IsFavorite,
            bookmark.ClickCount,
            bookmark.SortOrder,
            bookmark.FolderId,
            bookmark.Folder?.Name,
            bookmark.BookmarkTags.Select(bt => ToDto(bt.Tag)).ToList(),
            bookmark.CreatedAt,
            bookmark.UpdatedAt
        );
    }

    public static IEnumerable<BookmarkDto> ToDtos(IEnumerable<Bookmark> bookmarks)
    {
        return bookmarks.Select(ToDto);
    }

    public static FolderDto ToDto(Folder folder)
    {
        return new FolderDto(
            folder.Id,
            folder.Name,
            folder.Color,
            folder.Icon,
            folder.SortOrder,
            folder.ParentFolderId,
            folder.Bookmarks.Count,
            folder.CreatedAt,
            folder.UpdatedAt
        );
    }

    public static IEnumerable<FolderDto> ToDtos(IEnumerable<Folder> folders)
    {
        return folders.Select(ToDto);
    }

    public static FolderWithBookmarksDto ToFolderWithBookmarksDto(Folder folder)
    {
        return new FolderWithBookmarksDto(
            folder.Id,
            folder.Name,
            folder.Color,
            folder.Icon,
            folder.SortOrder,
            folder.ParentFolderId,
            folder.Bookmarks.Select(ToDto).ToList(),
            folder.SubFolders.Select(ToDto).ToList(),
            folder.CreatedAt,
            folder.UpdatedAt
        );
    }

    public static TagDto ToDto(Tag tag)
    {
        return new TagDto(
            tag.Id,
            tag.Name,
            tag.Color,
            tag.BookmarkTags.Count,
            tag.CreatedAt
        );
    }

    public static IEnumerable<TagDto> ToDtos(IEnumerable<Tag> tags)
    {
        return tags.Select(ToDto);
    }
}

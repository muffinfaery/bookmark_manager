using BookmarkManager.Domain.Entities;
using BookmarkManager.Application.DTOs;

namespace BookmarkManager.Tests.Helpers;

/// <summary>
/// Test data builder for creating test entities and DTOs
/// </summary>
public static class TestDataBuilder
{
    public const string DefaultUserId = "test-user-id";
    public const string OtherUserId = "other-user-456";

    public static Bookmark CreateBookmark(
        string userId = DefaultUserId,
        string? url = null,
        string? title = null,
        string? description = null,
        string? favicon = null,
        bool isFavorite = false,
        int clickCount = 0,
        int sortOrder = 0,
        Guid? folderId = null,
        Guid? id = null)
    {
        return new Bookmark
        {
            Id = id ?? Guid.NewGuid(),
            UserId = userId,
            Url = url ?? $"https://example{Guid.NewGuid():N}.com",
            Title = title ?? "Test Bookmark",
            Description = description,
            Favicon = favicon,
            IsFavorite = isFavorite,
            ClickCount = clickCount,
            SortOrder = sortOrder,
            FolderId = folderId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            BookmarkTags = new List<BookmarkTag>()
        };
    }

    public static Folder CreateFolder(
        string userId = DefaultUserId,
        string? name = null,
        string? color = null,
        string? icon = null,
        int sortOrder = 0,
        Guid? parentFolderId = null,
        Guid? parentId = null,
        Guid? id = null)
    {
        return new Folder
        {
            Id = id ?? Guid.NewGuid(),
            UserId = userId,
            Name = name ?? "Test Folder",
            Color = color,
            Icon = icon,
            SortOrder = sortOrder,
            ParentFolderId = parentId ?? parentFolderId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Bookmarks = new List<Bookmark>(),
            SubFolders = new List<Folder>()
        };
    }

    public static Tag CreateTag(
        string userId = DefaultUserId,
        string? name = null,
        string? color = null,
        Guid? id = null)
    {
        return new Tag
        {
            Id = id ?? Guid.NewGuid(),
            UserId = userId,
            Name = name ?? "Test Tag",
            Color = color,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            BookmarkTags = new List<BookmarkTag>()
        };
    }

    public static BookmarkTag CreateBookmarkTag(Bookmark bookmark, Tag tag)
    {
        return new BookmarkTag
        {
            BookmarkId = bookmark.Id,
            Bookmark = bookmark,
            TagId = tag.Id,
            Tag = tag
        };
    }

    public static CreateBookmarkDto CreateBookmarkDto(
        string? url = null,
        string? title = null,
        string? description = null,
        string? favicon = null,
        Guid? folderId = null,
        List<string>? tags = null)
    {
        return new CreateBookmarkDto(
            url ?? "https://example.com",
            title ?? "Test Bookmark",
            description,
            favicon,
            folderId,
            tags
        );
    }

    public static UpdateBookmarkDto CreateUpdateBookmarkDto(
        string? url = null,
        string? title = null,
        string? description = null,
        string? favicon = null,
        bool? isFavorite = null,
        Guid? folderId = null,
        List<string>? tags = null)
    {
        return new UpdateBookmarkDto(url, title, description, favicon, isFavorite, folderId, tags);
    }

    public static CreateFolderDto CreateFolderDto(
        string? name = null,
        string? color = null,
        string? icon = null,
        Guid? parentFolderId = null)
    {
        return new CreateFolderDto(
            name ?? "Test Folder",
            color,
            icon,
            parentFolderId
        );
    }

    public static CreateTagDto CreateTagDto(
        string? name = null,
        string? color = null)
    {
        return new CreateTagDto(
            name ?? "Test Tag",
            color
        );
    }

    public static List<Bookmark> CreateBookmarkList(string userId = DefaultUserId, int count = 5)
    {
        return Enumerable.Range(0, count)
            .Select(i => CreateBookmark(
                userId: userId,
                url: $"https://example{i}.com",
                title: $"Bookmark {i}",
                sortOrder: i))
            .ToList();
    }

    public static List<Folder> CreateFolderList(string userId = DefaultUserId, int count = 3)
    {
        return Enumerable.Range(0, count)
            .Select(i => CreateFolder(
                userId: userId,
                name: $"Folder {i}",
                sortOrder: i))
            .ToList();
    }

    public static List<Tag> CreateTagList(string userId = DefaultUserId, int count = 3)
    {
        return Enumerable.Range(0, count)
            .Select(i => CreateTag(
                userId: userId,
                name: $"Tag {i}"))
            .ToList();
    }
}

using BookmarkManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookmarkManager.Infrastructure.Extensions;

public static class BookmarkQueryExtensions
{
    /// <summary>
    /// Includes all navigation properties for bookmarks (Folder, Tags).
    /// </summary>
    public static IQueryable<Bookmark> WithNavigationProperties(this IQueryable<Bookmark> query)
    {
        return query
            .Include(b => b.Folder)
            .Include(b => b.BookmarkTags)
                .ThenInclude(bt => bt.Tag);
    }

    /// <summary>
    /// Orders bookmarks by SortOrder then by CreatedAt descending.
    /// </summary>
    public static IQueryable<Bookmark> OrderBySortOrder(this IQueryable<Bookmark> query)
    {
        return query
            .OrderBy(b => b.SortOrder)
            .ThenByDescending(b => b.CreatedAt);
    }

    /// <summary>
    /// Orders bookmarks by ClickCount descending then by CreatedAt descending.
    /// </summary>
    public static IQueryable<Bookmark> OrderByPopularity(this IQueryable<Bookmark> query)
    {
        return query
            .OrderByDescending(b => b.ClickCount)
            .ThenByDescending(b => b.CreatedAt);
    }
}

public static class FolderQueryExtensions
{
    /// <summary>
    /// Includes bookmarks and subfolders for folders.
    /// </summary>
    public static IQueryable<Folder> WithBookmarksAndSubFolders(this IQueryable<Folder> query)
    {
        return query
            .Include(f => f.Bookmarks)
            .Include(f => f.SubFolders);
    }

    /// <summary>
    /// Includes bookmarks with their tags for folders.
    /// </summary>
    public static IQueryable<Folder> WithBookmarksAndTags(this IQueryable<Folder> query)
    {
        return query
            .Include(f => f.Bookmarks)
                .ThenInclude(b => b.BookmarkTags)
                    .ThenInclude(bt => bt.Tag)
            .Include(f => f.SubFolders);
    }

    /// <summary>
    /// Orders folders by SortOrder then by Name.
    /// </summary>
    public static IQueryable<Folder> OrderBySortOrder(this IQueryable<Folder> query)
    {
        return query
            .OrderBy(f => f.SortOrder)
            .ThenBy(f => f.Name);
    }
}

using BookmarkManager.Domain.Entities;
using BookmarkManager.Domain.Interfaces;
using BookmarkManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookmarkManager.Infrastructure.Repositories;

public class BookmarkRepository : Repository<Bookmark>, IBookmarkRepository
{
    public BookmarkRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<Bookmark?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Folder)
            .Include(b => b.BookmarkTags)
                .ThenInclude(bt => bt.Tag)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Bookmark>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Folder)
            .Include(b => b.BookmarkTags)
                .ThenInclude(bt => bt.Tag)
            .Where(b => b.UserId == userId)
            .OrderBy(b => b.SortOrder)
            .ThenByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Bookmark>> GetByFolderIdAsync(string userId, Guid? folderId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Folder)
            .Include(b => b.BookmarkTags)
                .ThenInclude(bt => bt.Tag)
            .Where(b => b.UserId == userId && b.FolderId == folderId)
            .OrderBy(b => b.SortOrder)
            .ThenByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Bookmark>> GetFavoritesAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Folder)
            .Include(b => b.BookmarkTags)
                .ThenInclude(bt => bt.Tag)
            .Where(b => b.UserId == userId && b.IsFavorite)
            .OrderBy(b => b.SortOrder)
            .ThenByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Bookmark>> SearchAsync(string userId, string searchTerm, CancellationToken cancellationToken = default)
    {
        var lowerSearchTerm = searchTerm.ToLower();
        return await _dbSet
            .Include(b => b.Folder)
            .Include(b => b.BookmarkTags)
                .ThenInclude(bt => bt.Tag)
            .Where(b => b.UserId == userId &&
                (b.Title.ToLower().Contains(lowerSearchTerm) ||
                 b.Url.ToLower().Contains(lowerSearchTerm) ||
                 (b.Description != null && b.Description.ToLower().Contains(lowerSearchTerm)) ||
                 b.BookmarkTags.Any(bt => bt.Tag.Name.ToLower().Contains(lowerSearchTerm))))
            .OrderByDescending(b => b.ClickCount)
            .ThenByDescending(b => b.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Bookmark?> GetByUrlAsync(string userId, string url, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(b => b.UserId == userId && b.Url == url, cancellationToken);
    }

    public async Task<IEnumerable<Bookmark>> GetMostUsedAsync(string userId, int count, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(b => b.Folder)
            .Include(b => b.BookmarkTags)
                .ThenInclude(bt => bt.Tag)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.ClickCount)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task IncrementClickCountAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _context.Database.ExecuteSqlRawAsync(
            "UPDATE \"Bookmarks\" SET \"ClickCount\" = \"ClickCount\" + 1 WHERE \"Id\" = {0}",
            id);
    }

    public async Task UpdateSortOrderAsync(IEnumerable<(Guid Id, int SortOrder)> updates, CancellationToken cancellationToken = default)
    {
        foreach (var (id, sortOrder) in updates)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "UPDATE \"Bookmarks\" SET \"SortOrder\" = {0} WHERE \"Id\" = {1}",
                sortOrder, id);
        }
    }
}

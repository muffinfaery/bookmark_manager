using BookmarkManager.Domain.Entities;
using BookmarkManager.Domain.Interfaces;
using BookmarkManager.Infrastructure.Data;
using BookmarkManager.Infrastructure.Extensions;
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
            .WithNavigationProperties()
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Bookmark>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .WithNavigationProperties()
            .Where(b => b.UserId == userId)
            .OrderBySortOrder()
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Bookmark>> GetByFolderIdAsync(string userId, Guid? folderId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .WithNavigationProperties()
            .Where(b => b.UserId == userId && b.FolderId == folderId)
            .OrderBySortOrder()
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Bookmark>> GetFavoritesAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .WithNavigationProperties()
            .Where(b => b.UserId == userId && b.IsFavorite)
            .OrderBySortOrder()
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Bookmark>> SearchAsync(string userId, string searchTerm, CancellationToken cancellationToken = default)
    {
        var lowerSearchTerm = searchTerm.ToLower();
        return await _dbSet
            .WithNavigationProperties()
            .Where(b => b.UserId == userId &&
                (b.Title.ToLower().Contains(lowerSearchTerm) ||
                 b.Url.ToLower().Contains(lowerSearchTerm) ||
                 (b.Description != null && b.Description.ToLower().Contains(lowerSearchTerm)) ||
                 b.BookmarkTags.Any(bt => bt.Tag.Name.ToLower().Contains(lowerSearchTerm))))
            .OrderByPopularity()
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
            .WithNavigationProperties()
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.ClickCount)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    public async Task IncrementClickCountAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await _dbSet
            .Where(b => b.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(b => b.ClickCount, b => b.ClickCount + 1), cancellationToken);
    }

    public async Task UpdateSortOrderAsync(IEnumerable<(Guid Id, int SortOrder)> updates, CancellationToken cancellationToken = default)
    {
        foreach (var (id, sortOrder) in updates)
        {
            await _dbSet
                .Where(b => b.Id == id)
                .ExecuteUpdateAsync(s => s.SetProperty(b => b.SortOrder, sortOrder), cancellationToken);
        }
    }
}

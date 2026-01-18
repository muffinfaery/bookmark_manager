using BookmarkManager.Domain.Entities;
using BookmarkManager.Domain.Interfaces;
using BookmarkManager.Infrastructure.Data;
using BookmarkManager.Infrastructure.Extensions;
using Microsoft.EntityFrameworkCore;

namespace BookmarkManager.Infrastructure.Repositories;

public class FolderRepository : Repository<Folder>, IFolderRepository
{
    public FolderRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<Folder?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .WithBookmarksAndSubFolders()
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Folder>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(f => f.Bookmarks)
            .Where(f => f.UserId == userId)
            .OrderBySortOrder()
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Folder>> GetRootFoldersAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .WithBookmarksAndSubFolders()
            .Where(f => f.UserId == userId && f.ParentFolderId == null)
            .OrderBySortOrder()
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Folder>> GetSubFoldersAsync(string userId, Guid parentFolderId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .WithBookmarksAndSubFolders()
            .Where(f => f.UserId == userId && f.ParentFolderId == parentFolderId)
            .OrderBySortOrder()
            .ToListAsync(cancellationToken);
    }

    public async Task<Folder?> GetWithBookmarksAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .WithBookmarksAndTags()
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task UpdateSortOrderAsync(IEnumerable<(Guid Id, int SortOrder)> updates, CancellationToken cancellationToken = default)
    {
        foreach (var (id, sortOrder) in updates)
        {
            await _dbSet
                .Where(f => f.Id == id)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.SortOrder, sortOrder), cancellationToken);
        }
    }
}

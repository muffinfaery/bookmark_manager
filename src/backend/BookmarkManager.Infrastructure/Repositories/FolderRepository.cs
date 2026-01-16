using BookmarkManager.Domain.Entities;
using BookmarkManager.Domain.Interfaces;
using BookmarkManager.Infrastructure.Data;
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
            .Include(f => f.Bookmarks)
            .Include(f => f.SubFolders)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Folder>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(f => f.Bookmarks)
            .Where(f => f.UserId == userId)
            .OrderBy(f => f.SortOrder)
            .ThenBy(f => f.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Folder>> GetRootFoldersAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(f => f.Bookmarks)
            .Include(f => f.SubFolders)
            .Where(f => f.UserId == userId && f.ParentFolderId == null)
            .OrderBy(f => f.SortOrder)
            .ThenBy(f => f.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Folder>> GetSubFoldersAsync(string userId, Guid parentFolderId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(f => f.Bookmarks)
            .Include(f => f.SubFolders)
            .Where(f => f.UserId == userId && f.ParentFolderId == parentFolderId)
            .OrderBy(f => f.SortOrder)
            .ThenBy(f => f.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Folder?> GetWithBookmarksAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(f => f.Bookmarks)
                .ThenInclude(b => b.BookmarkTags)
                    .ThenInclude(bt => bt.Tag)
            .Include(f => f.SubFolders)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken);
    }

    public async Task UpdateSortOrderAsync(IEnumerable<(Guid Id, int SortOrder)> updates, CancellationToken cancellationToken = default)
    {
        foreach (var (id, sortOrder) in updates)
        {
            await _context.Database.ExecuteSqlRawAsync(
                "UPDATE \"Folders\" SET \"SortOrder\" = {0} WHERE \"Id\" = {1}",
                sortOrder, id);
        }
    }
}

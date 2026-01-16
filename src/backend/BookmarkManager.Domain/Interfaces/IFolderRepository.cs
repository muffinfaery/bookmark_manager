using BookmarkManager.Domain.Entities;

namespace BookmarkManager.Domain.Interfaces;

public interface IFolderRepository : IRepository<Folder>
{
    Task<IEnumerable<Folder>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Folder>> GetRootFoldersAsync(string userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Folder>> GetSubFoldersAsync(string userId, Guid parentFolderId, CancellationToken cancellationToken = default);
    Task<Folder?> GetWithBookmarksAsync(Guid id, CancellationToken cancellationToken = default);
    Task UpdateSortOrderAsync(IEnumerable<(Guid Id, int SortOrder)> updates, CancellationToken cancellationToken = default);
}

using BookmarkManager.Domain.Entities;

namespace BookmarkManager.Domain.Interfaces;

public interface IBookmarkRepository : IRepository<Bookmark>
{
    Task<IEnumerable<Bookmark>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Bookmark>> GetByFolderIdAsync(string userId, Guid? folderId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Bookmark>> GetFavoritesAsync(string userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<Bookmark>> SearchAsync(string userId, string searchTerm, CancellationToken cancellationToken = default);
    Task<Bookmark?> GetByUrlAsync(string userId, string url, CancellationToken cancellationToken = default);
    Task<IEnumerable<Bookmark>> GetMostUsedAsync(string userId, int count, CancellationToken cancellationToken = default);
    Task IncrementClickCountAsync(Guid id, CancellationToken cancellationToken = default);
    Task UpdateSortOrderAsync(IEnumerable<(Guid Id, int SortOrder)> updates, CancellationToken cancellationToken = default);
}

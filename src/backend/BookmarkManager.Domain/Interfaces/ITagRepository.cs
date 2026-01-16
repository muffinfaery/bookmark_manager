using BookmarkManager.Domain.Entities;

namespace BookmarkManager.Domain.Interfaces;

public interface ITagRepository : IRepository<Tag>
{
    Task<IEnumerable<Tag>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task<Tag?> GetByNameAsync(string userId, string name, CancellationToken cancellationToken = default);
    Task<IEnumerable<Tag>> GetByBookmarkIdAsync(Guid bookmarkId, CancellationToken cancellationToken = default);
}

namespace BookmarkManager.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IBookmarkRepository Bookmarks { get; }
    IFolderRepository Folders { get; }
    ITagRepository Tags { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}

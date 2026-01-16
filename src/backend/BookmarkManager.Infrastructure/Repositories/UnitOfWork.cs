using BookmarkManager.Domain.Interfaces;
using BookmarkManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace BookmarkManager.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    private IBookmarkRepository? _bookmarks;
    private IFolderRepository? _folders;
    private ITagRepository? _tags;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
    }

    public IBookmarkRepository Bookmarks => _bookmarks ??= new BookmarkRepository(_context);
    public IFolderRepository Folders => _folders ??= new FolderRepository(_context);
    public ITagRepository Tags => _tags ??= new TagRepository(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}

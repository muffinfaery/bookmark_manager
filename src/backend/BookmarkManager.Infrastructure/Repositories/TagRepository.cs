using BookmarkManager.Domain.Entities;
using BookmarkManager.Domain.Interfaces;
using BookmarkManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BookmarkManager.Infrastructure.Repositories;

public class TagRepository : Repository<Tag>, ITagRepository
{
    public TagRepository(ApplicationDbContext context) : base(context)
    {
    }

    public override async Task<Tag?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.BookmarkTags)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Tag>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.BookmarkTags)
            .Where(t => t.UserId == userId)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Tag?> GetByNameAsync(string userId, string name, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.BookmarkTags)
            .FirstOrDefaultAsync(t => t.UserId == userId && t.Name.ToLower() == name.ToLower(), cancellationToken);
    }

    public async Task<IEnumerable<Tag>> GetByBookmarkIdAsync(Guid bookmarkId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(t => t.BookmarkTags)
            .Where(t => t.BookmarkTags.Any(bt => bt.BookmarkId == bookmarkId))
            .ToListAsync(cancellationToken);
    }
}

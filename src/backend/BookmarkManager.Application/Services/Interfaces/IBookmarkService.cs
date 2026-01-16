using BookmarkManager.Application.DTOs;

namespace BookmarkManager.Application.Services.Interfaces;

public interface IBookmarkService
{
    Task<IEnumerable<BookmarkDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default);
    Task<BookmarkDto?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<BookmarkDto>> GetByFolderAsync(string userId, Guid? folderId, CancellationToken cancellationToken = default);
    Task<IEnumerable<BookmarkDto>> GetFavoritesAsync(string userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<BookmarkDto>> SearchAsync(string userId, string searchTerm, CancellationToken cancellationToken = default);
    Task<IEnumerable<BookmarkDto>> GetMostUsedAsync(string userId, int count = 10, CancellationToken cancellationToken = default);
    Task<BookmarkDto> CreateAsync(string userId, CreateBookmarkDto dto, CancellationToken cancellationToken = default);
    Task<BookmarkDto> UpdateAsync(string userId, Guid id, UpdateBookmarkDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(string userId, Guid id, CancellationToken cancellationToken = default);
    Task<bool> CheckDuplicateAsync(string userId, string url, CancellationToken cancellationToken = default);
    Task TrackClickAsync(string userId, Guid id, CancellationToken cancellationToken = default);
    Task ReorderAsync(string userId, ReorderBookmarksDto dto, CancellationToken cancellationToken = default);
    Task<IEnumerable<BookmarkDto>> BulkImportAsync(string userId, BulkImportDto dto, CancellationToken cancellationToken = default);
    Task<BookmarkExportDto> ExportAsync(string userId, CancellationToken cancellationToken = default);
}

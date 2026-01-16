using BookmarkManager.Application.DTOs;

namespace BookmarkManager.Application.Services.Interfaces;

public interface IFolderService
{
    Task<IEnumerable<FolderDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default);
    Task<FolderDto?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default);
    Task<FolderWithBookmarksDto?> GetWithBookmarksAsync(string userId, Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<FolderDto>> GetRootFoldersAsync(string userId, CancellationToken cancellationToken = default);
    Task<IEnumerable<FolderDto>> GetSubFoldersAsync(string userId, Guid parentFolderId, CancellationToken cancellationToken = default);
    Task<FolderDto> CreateAsync(string userId, CreateFolderDto dto, CancellationToken cancellationToken = default);
    Task<FolderDto> UpdateAsync(string userId, Guid id, UpdateFolderDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(string userId, Guid id, CancellationToken cancellationToken = default);
    Task ReorderAsync(string userId, ReorderFoldersDto dto, CancellationToken cancellationToken = default);
}

using BookmarkManager.Application.DTOs;

namespace BookmarkManager.Application.Services.Interfaces;

public interface ITagService
{
    Task<IEnumerable<TagDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default);
    Task<TagDto?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default);
    Task<TagDto> CreateAsync(string userId, CreateTagDto dto, CancellationToken cancellationToken = default);
    Task<TagDto> UpdateAsync(string userId, Guid id, UpdateTagDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(string userId, Guid id, CancellationToken cancellationToken = default);
}

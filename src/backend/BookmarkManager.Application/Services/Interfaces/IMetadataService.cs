using BookmarkManager.Application.DTOs;

namespace BookmarkManager.Application.Services.Interfaces;

public interface IMetadataService
{
    Task<UrlMetadataDto> FetchMetadataAsync(string url, CancellationToken cancellationToken = default);
}

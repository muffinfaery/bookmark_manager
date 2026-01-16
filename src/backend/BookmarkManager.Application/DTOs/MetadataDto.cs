namespace BookmarkManager.Application.DTOs;

public record UrlMetadataDto(
    string Url,
    string? Title,
    string? Description,
    string? Favicon,
    string? Image
);

public record FetchMetadataRequestDto(
    string Url
);

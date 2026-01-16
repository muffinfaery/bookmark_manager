namespace BookmarkManager.Application.DTOs;

public record TagDto(
    Guid Id,
    string Name,
    string? Color,
    int BookmarkCount,
    DateTime CreatedAt
);

public record CreateTagDto(
    string Name,
    string? Color
);

public record UpdateTagDto(
    string? Name,
    string? Color
);

using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Interfaces;
using BookmarkManager.Domain.Entities;
using BookmarkManager.Domain.Interfaces;

namespace BookmarkManager.Application.Services.Implementations;

public class TagService : ITagService
{
    private readonly IUnitOfWork _unitOfWork;

    public TagService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<TagDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default)
    {
        var tags = await _unitOfWork.Tags.GetByUserIdAsync(userId, cancellationToken);
        return tags.Select(MapToDto);
    }

    public async Task<TagDto?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var tag = await _unitOfWork.Tags.GetByIdAsync(id, cancellationToken);
        if (tag == null || tag.UserId != userId)
            return null;
        return MapToDto(tag);
    }

    public async Task<TagDto> CreateAsync(string userId, CreateTagDto dto, CancellationToken cancellationToken = default)
    {
        // Check if tag already exists
        var existing = await _unitOfWork.Tags.GetByNameAsync(userId, dto.Name, cancellationToken);
        if (existing != null)
            throw new InvalidOperationException("Tag with this name already exists");

        var tag = new Tag
        {
            UserId = userId,
            Name = dto.Name,
            Color = dto.Color
        };

        await _unitOfWork.Tags.AddAsync(tag, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return MapToDto(tag);
    }

    public async Task<TagDto> UpdateAsync(string userId, Guid id, UpdateTagDto dto, CancellationToken cancellationToken = default)
    {
        var tag = await _unitOfWork.Tags.GetByIdAsync(id, cancellationToken);
        if (tag == null || tag.UserId != userId)
            throw new InvalidOperationException("Tag not found");

        if (dto.Name != null)
        {
            // Check if another tag with this name exists
            var existing = await _unitOfWork.Tags.GetByNameAsync(userId, dto.Name, cancellationToken);
            if (existing != null && existing.Id != id)
                throw new InvalidOperationException("Tag with this name already exists");
            tag.Name = dto.Name;
        }
        if (dto.Color != null) tag.Color = dto.Color;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return MapToDto(tag);
    }

    public async Task DeleteAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var tag = await _unitOfWork.Tags.GetByIdAsync(id, cancellationToken);
        if (tag == null || tag.UserId != userId)
            throw new InvalidOperationException("Tag not found");

        await _unitOfWork.Tags.DeleteAsync(tag, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static TagDto MapToDto(Tag tag)
    {
        return new TagDto(
            tag.Id,
            tag.Name,
            tag.Color,
            tag.BookmarkTags.Count,
            tag.CreatedAt
        );
    }
}

using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Mapping;
using BookmarkManager.Application.Services.Interfaces;
using BookmarkManager.Domain.Entities;
using BookmarkManager.Domain.Exceptions;
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
        return DtoMapper.ToDtos(tags);
    }

    public async Task<TagDto?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var tag = await _unitOfWork.Tags.GetByIdAsync(id, cancellationToken);
        if (tag == null || tag.UserId != userId)
            return null;
        return DtoMapper.ToDto(tag);
    }

    public async Task<TagDto> CreateAsync(string userId, CreateTagDto dto, CancellationToken cancellationToken = default)
    {
        var existing = await _unitOfWork.Tags.GetByNameAsync(userId, dto.Name, cancellationToken);
        if (existing != null)
            throw new DuplicateEntityException("Tag", "name", dto.Name);

        var tag = new Tag
        {
            UserId = userId,
            Name = dto.Name,
            Color = dto.Color
        };

        await _unitOfWork.Tags.AddAsync(tag, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return DtoMapper.ToDto(tag);
    }

    public async Task<TagDto> UpdateAsync(string userId, Guid id, UpdateTagDto dto, CancellationToken cancellationToken = default)
    {
        var tag = await _unitOfWork.Tags.GetByIdAsync(id, cancellationToken);
        if (tag == null || tag.UserId != userId)
            throw new EntityNotFoundException("Tag", id);

        if (dto.Name != null)
        {
            var existing = await _unitOfWork.Tags.GetByNameAsync(userId, dto.Name, cancellationToken);
            if (existing != null && existing.Id != id)
                throw new DuplicateEntityException("Tag", "name", dto.Name);
            tag.Name = dto.Name;
        }
        if (dto.Color != null) tag.Color = dto.Color;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return DtoMapper.ToDto(tag);
    }

    public async Task DeleteAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var tag = await _unitOfWork.Tags.GetByIdAsync(id, cancellationToken);
        if (tag == null || tag.UserId != userId)
            throw new EntityNotFoundException("Tag", id);

        await _unitOfWork.Tags.DeleteAsync(tag, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Mapping;
using BookmarkManager.Application.Services.Interfaces;
using BookmarkManager.Domain.Entities;
using BookmarkManager.Domain.Exceptions;
using BookmarkManager.Domain.Interfaces;

namespace BookmarkManager.Application.Services.Implementations;

public class FolderService : IFolderService
{
    private readonly IUnitOfWork _unitOfWork;

    public FolderService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<FolderDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default)
    {
        var folders = await _unitOfWork.Folders.GetByUserIdAsync(userId, cancellationToken);
        return DtoMapper.ToDtos(folders);
    }

    public async Task<FolderDto?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var folder = await _unitOfWork.Folders.GetByIdAsync(id, cancellationToken);
        if (folder == null || folder.UserId != userId)
            return null;
        return DtoMapper.ToDto(folder);
    }

    public async Task<FolderWithBookmarksDto?> GetWithBookmarksAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var folder = await _unitOfWork.Folders.GetWithBookmarksAsync(id, cancellationToken);
        if (folder == null || folder.UserId != userId)
            return null;

        return DtoMapper.ToFolderWithBookmarksDto(folder);
    }

    public async Task<IEnumerable<FolderDto>> GetRootFoldersAsync(string userId, CancellationToken cancellationToken = default)
    {
        var folders = await _unitOfWork.Folders.GetRootFoldersAsync(userId, cancellationToken);
        return DtoMapper.ToDtos(folders);
    }

    public async Task<IEnumerable<FolderDto>> GetSubFoldersAsync(string userId, Guid parentFolderId, CancellationToken cancellationToken = default)
    {
        var folders = await _unitOfWork.Folders.GetSubFoldersAsync(userId, parentFolderId, cancellationToken);
        return DtoMapper.ToDtos(folders);
    }

    public async Task<FolderDto> CreateAsync(string userId, CreateFolderDto dto, CancellationToken cancellationToken = default)
    {
        var folder = new Folder
        {
            UserId = userId,
            Name = dto.Name,
            Color = dto.Color,
            Icon = dto.Icon,
            ParentFolderId = dto.ParentFolderId,
            SortOrder = 0
        };

        await _unitOfWork.Folders.AddAsync(folder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return DtoMapper.ToDto(folder);
    }

    public async Task<FolderDto> UpdateAsync(string userId, Guid id, UpdateFolderDto dto, CancellationToken cancellationToken = default)
    {
        var folder = await _unitOfWork.Folders.GetByIdAsync(id, cancellationToken);
        if (folder == null || folder.UserId != userId)
            throw new EntityNotFoundException("Folder", id);

        if (dto.Name != null) folder.Name = dto.Name;
        if (dto.Color != null) folder.Color = dto.Color;
        if (dto.Icon != null) folder.Icon = dto.Icon;
        if (dto.ParentFolderId.HasValue) folder.ParentFolderId = dto.ParentFolderId;

        folder.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return DtoMapper.ToDto(folder);
    }

    public async Task DeleteAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var folder = await _unitOfWork.Folders.GetByIdAsync(id, cancellationToken);
        if (folder == null || folder.UserId != userId)
            throw new EntityNotFoundException("Folder", id);

        await _unitOfWork.Folders.DeleteAsync(folder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ReorderAsync(string userId, ReorderFoldersDto dto, CancellationToken cancellationToken = default)
    {
        var updates = dto.Items.Select(i => (i.Id, i.SortOrder));
        await _unitOfWork.Folders.UpdateSortOrderAsync(updates, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

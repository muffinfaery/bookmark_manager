using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Interfaces;
using BookmarkManager.Domain.Entities;
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
        return folders.Select(MapToDto);
    }

    public async Task<FolderDto?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var folder = await _unitOfWork.Folders.GetByIdAsync(id, cancellationToken);
        if (folder == null || folder.UserId != userId)
            return null;
        return MapToDto(folder);
    }

    public async Task<FolderWithBookmarksDto?> GetWithBookmarksAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var folder = await _unitOfWork.Folders.GetWithBookmarksAsync(id, cancellationToken);
        if (folder == null || folder.UserId != userId)
            return null;

        return new FolderWithBookmarksDto(
            folder.Id,
            folder.Name,
            folder.Color,
            folder.Icon,
            folder.SortOrder,
            folder.ParentFolderId,
            folder.Bookmarks.Select(b => new BookmarkDto(
                b.Id, b.Url, b.Title, b.Description, b.Favicon, b.IsFavorite,
                b.ClickCount, b.SortOrder, b.FolderId, folder.Name,
                b.BookmarkTags.Select(bt => new TagDto(
                    bt.Tag.Id, bt.Tag.Name, bt.Tag.Color,
                    bt.Tag.BookmarkTags.Count, bt.Tag.CreatedAt
                )).ToList(),
                b.CreatedAt, b.UpdatedAt
            )).ToList(),
            folder.SubFolders.Select(MapToDto).ToList(),
            folder.CreatedAt,
            folder.UpdatedAt
        );
    }

    public async Task<IEnumerable<FolderDto>> GetRootFoldersAsync(string userId, CancellationToken cancellationToken = default)
    {
        var folders = await _unitOfWork.Folders.GetRootFoldersAsync(userId, cancellationToken);
        return folders.Select(MapToDto);
    }

    public async Task<IEnumerable<FolderDto>> GetSubFoldersAsync(string userId, Guid parentFolderId, CancellationToken cancellationToken = default)
    {
        var folders = await _unitOfWork.Folders.GetSubFoldersAsync(userId, parentFolderId, cancellationToken);
        return folders.Select(MapToDto);
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
        return MapToDto(folder);
    }

    public async Task<FolderDto> UpdateAsync(string userId, Guid id, UpdateFolderDto dto, CancellationToken cancellationToken = default)
    {
        var folder = await _unitOfWork.Folders.GetByIdAsync(id, cancellationToken);
        if (folder == null || folder.UserId != userId)
            throw new InvalidOperationException("Folder not found");

        if (dto.Name != null) folder.Name = dto.Name;
        if (dto.Color != null) folder.Color = dto.Color;
        if (dto.Icon != null) folder.Icon = dto.Icon;
        if (dto.ParentFolderId.HasValue) folder.ParentFolderId = dto.ParentFolderId;

        folder.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return MapToDto(folder);
    }

    public async Task DeleteAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var folder = await _unitOfWork.Folders.GetByIdAsync(id, cancellationToken);
        if (folder == null || folder.UserId != userId)
            throw new InvalidOperationException("Folder not found");

        await _unitOfWork.Folders.DeleteAsync(folder, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ReorderAsync(string userId, ReorderFoldersDto dto, CancellationToken cancellationToken = default)
    {
        var updates = dto.Items.Select(i => (i.Id, i.SortOrder));
        await _unitOfWork.Folders.UpdateSortOrderAsync(updates, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static FolderDto MapToDto(Folder folder)
    {
        return new FolderDto(
            folder.Id,
            folder.Name,
            folder.Color,
            folder.Icon,
            folder.SortOrder,
            folder.ParentFolderId,
            folder.Bookmarks.Count,
            folder.CreatedAt,
            folder.UpdatedAt
        );
    }
}

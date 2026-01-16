using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Interfaces;
using BookmarkManager.Domain.Entities;
using BookmarkManager.Domain.Interfaces;

namespace BookmarkManager.Application.Services.Implementations;

public class BookmarkService : IBookmarkService
{
    private readonly IUnitOfWork _unitOfWork;

    public BookmarkService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<BookmarkDto>> GetAllAsync(string userId, CancellationToken cancellationToken = default)
    {
        var bookmarks = await _unitOfWork.Bookmarks.GetByUserIdAsync(userId, cancellationToken);
        return bookmarks.Select(MapToDto);
    }

    public async Task<BookmarkDto?> GetByIdAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var bookmark = await _unitOfWork.Bookmarks.GetByIdAsync(id, cancellationToken);
        if (bookmark == null || bookmark.UserId != userId)
            return null;
        return MapToDto(bookmark);
    }

    public async Task<IEnumerable<BookmarkDto>> GetByFolderAsync(string userId, Guid? folderId, CancellationToken cancellationToken = default)
    {
        var bookmarks = await _unitOfWork.Bookmarks.GetByFolderIdAsync(userId, folderId, cancellationToken);
        return bookmarks.Select(MapToDto);
    }

    public async Task<IEnumerable<BookmarkDto>> GetFavoritesAsync(string userId, CancellationToken cancellationToken = default)
    {
        var bookmarks = await _unitOfWork.Bookmarks.GetFavoritesAsync(userId, cancellationToken);
        return bookmarks.Select(MapToDto);
    }

    public async Task<IEnumerable<BookmarkDto>> SearchAsync(string userId, string searchTerm, CancellationToken cancellationToken = default)
    {
        var bookmarks = await _unitOfWork.Bookmarks.SearchAsync(userId, searchTerm, cancellationToken);
        return bookmarks.Select(MapToDto);
    }

    public async Task<IEnumerable<BookmarkDto>> GetMostUsedAsync(string userId, int count = 10, CancellationToken cancellationToken = default)
    {
        var bookmarks = await _unitOfWork.Bookmarks.GetMostUsedAsync(userId, count, cancellationToken);
        return bookmarks.Select(MapToDto);
    }

    public async Task<BookmarkDto> CreateAsync(string userId, CreateBookmarkDto dto, CancellationToken cancellationToken = default)
    {
        var bookmark = new Bookmark
        {
            UserId = userId,
            Url = dto.Url,
            Title = dto.Title,
            Description = dto.Description,
            Favicon = dto.Favicon,
            FolderId = dto.FolderId,
            IsFavorite = false,
            ClickCount = 0,
            SortOrder = 0
        };

        await _unitOfWork.Bookmarks.AddAsync(bookmark, cancellationToken);

        // Handle tags
        if (dto.Tags != null && dto.Tags.Any())
        {
            foreach (var tagName in dto.Tags)
            {
                var tag = await _unitOfWork.Tags.GetByNameAsync(userId, tagName, cancellationToken);
                if (tag == null)
                {
                    tag = new Tag { UserId = userId, Name = tagName };
                    await _unitOfWork.Tags.AddAsync(tag, cancellationToken);
                }
                bookmark.BookmarkTags.Add(new BookmarkTag { BookmarkId = bookmark.Id, TagId = tag.Id });
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return MapToDto(bookmark);
    }

    public async Task<BookmarkDto> UpdateAsync(string userId, Guid id, UpdateBookmarkDto dto, CancellationToken cancellationToken = default)
    {
        var bookmark = await _unitOfWork.Bookmarks.GetByIdAsync(id, cancellationToken);
        if (bookmark == null || bookmark.UserId != userId)
            throw new InvalidOperationException("Bookmark not found");

        if (dto.Url != null) bookmark.Url = dto.Url;
        if (dto.Title != null) bookmark.Title = dto.Title;
        if (dto.Description != null) bookmark.Description = dto.Description;
        if (dto.Favicon != null) bookmark.Favicon = dto.Favicon;
        if (dto.IsFavorite.HasValue) bookmark.IsFavorite = dto.IsFavorite.Value;
        if (dto.FolderId.HasValue) bookmark.FolderId = dto.FolderId;

        bookmark.UpdatedAt = DateTime.UtcNow;

        // Handle tags update
        if (dto.Tags != null)
        {
            bookmark.BookmarkTags.Clear();
            foreach (var tagName in dto.Tags)
            {
                var tag = await _unitOfWork.Tags.GetByNameAsync(userId, tagName, cancellationToken);
                if (tag == null)
                {
                    tag = new Tag { UserId = userId, Name = tagName };
                    await _unitOfWork.Tags.AddAsync(tag, cancellationToken);
                }
                bookmark.BookmarkTags.Add(new BookmarkTag { BookmarkId = bookmark.Id, TagId = tag.Id });
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return MapToDto(bookmark);
    }

    public async Task DeleteAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var bookmark = await _unitOfWork.Bookmarks.GetByIdAsync(id, cancellationToken);
        if (bookmark == null || bookmark.UserId != userId)
            throw new InvalidOperationException("Bookmark not found");

        await _unitOfWork.Bookmarks.DeleteAsync(bookmark, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> CheckDuplicateAsync(string userId, string url, CancellationToken cancellationToken = default)
    {
        var existing = await _unitOfWork.Bookmarks.GetByUrlAsync(userId, url, cancellationToken);
        return existing != null;
    }

    public async Task TrackClickAsync(string userId, Guid id, CancellationToken cancellationToken = default)
    {
        var bookmark = await _unitOfWork.Bookmarks.GetByIdAsync(id, cancellationToken);
        if (bookmark == null || bookmark.UserId != userId)
            return;

        await _unitOfWork.Bookmarks.IncrementClickCountAsync(id, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ReorderAsync(string userId, ReorderBookmarksDto dto, CancellationToken cancellationToken = default)
    {
        var updates = dto.Items.Select(i => (i.Id, i.SortOrder));
        await _unitOfWork.Bookmarks.UpdateSortOrderAsync(updates, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IEnumerable<BookmarkDto>> BulkImportAsync(string userId, BulkImportDto dto, CancellationToken cancellationToken = default)
    {
        var results = new List<BookmarkDto>();
        foreach (var createDto in dto.Bookmarks)
        {
            // Skip duplicates
            var isDuplicate = await CheckDuplicateAsync(userId, createDto.Url, cancellationToken);
            if (!isDuplicate)
            {
                var bookmark = await CreateAsync(userId, createDto, cancellationToken);
                results.Add(bookmark);
            }
        }
        return results;
    }

    public async Task<BookmarkExportDto> ExportAsync(string userId, CancellationToken cancellationToken = default)
    {
        var bookmarks = await GetAllAsync(userId, cancellationToken);
        var folders = await _unitOfWork.Folders.GetByUserIdAsync(userId, cancellationToken);
        var tags = await _unitOfWork.Tags.GetByUserIdAsync(userId, cancellationToken);

        return new BookmarkExportDto(
            bookmarks.ToList(),
            folders.Select(f => new FolderDto(
                f.Id, f.Name, f.Color, f.Icon, f.SortOrder, f.ParentFolderId,
                f.Bookmarks.Count, f.CreatedAt, f.UpdatedAt
            )).ToList(),
            tags.Select(t => new TagDto(
                t.Id, t.Name, t.Color, t.BookmarkTags.Count, t.CreatedAt
            )).ToList(),
            DateTime.UtcNow
        );
    }

    private static BookmarkDto MapToDto(Bookmark bookmark)
    {
        return new BookmarkDto(
            bookmark.Id,
            bookmark.Url,
            bookmark.Title,
            bookmark.Description,
            bookmark.Favicon,
            bookmark.IsFavorite,
            bookmark.ClickCount,
            bookmark.SortOrder,
            bookmark.FolderId,
            bookmark.Folder?.Name,
            bookmark.BookmarkTags.Select(bt => new TagDto(
                bt.Tag.Id, bt.Tag.Name, bt.Tag.Color,
                bt.Tag.BookmarkTags.Count, bt.Tag.CreatedAt
            )).ToList(),
            bookmark.CreatedAt,
            bookmark.UpdatedAt
        );
    }
}

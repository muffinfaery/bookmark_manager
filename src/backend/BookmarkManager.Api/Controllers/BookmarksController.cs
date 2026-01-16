using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BookmarkManager.Api.Controllers;

public class BookmarksController : BaseController
{
    private readonly IBookmarkService _bookmarkService;

    public BookmarksController(IBookmarkService bookmarkService)
    {
        _bookmarkService = bookmarkService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookmarkDto>>> GetAll(CancellationToken cancellationToken)
    {
        var bookmarks = await _bookmarkService.GetAllAsync(UserId, cancellationToken);
        return Ok(bookmarks);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BookmarkDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var bookmark = await _bookmarkService.GetByIdAsync(UserId, id, cancellationToken);
        if (bookmark == null)
            return NotFound();
        return Ok(bookmark);
    }

    [HttpGet("folder/{folderId:guid?}")]
    public async Task<ActionResult<IEnumerable<BookmarkDto>>> GetByFolder(Guid? folderId, CancellationToken cancellationToken)
    {
        var bookmarks = await _bookmarkService.GetByFolderAsync(UserId, folderId, cancellationToken);
        return Ok(bookmarks);
    }

    [HttpGet("favorites")]
    public async Task<ActionResult<IEnumerable<BookmarkDto>>> GetFavorites(CancellationToken cancellationToken)
    {
        var bookmarks = await _bookmarkService.GetFavoritesAsync(UserId, cancellationToken);
        return Ok(bookmarks);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<BookmarkDto>>> Search([FromQuery] string q, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest("Search query is required");
        var bookmarks = await _bookmarkService.SearchAsync(UserId, q, cancellationToken);
        return Ok(bookmarks);
    }

    [HttpGet("most-used")]
    public async Task<ActionResult<IEnumerable<BookmarkDto>>> GetMostUsed([FromQuery] int count = 10, CancellationToken cancellationToken = default)
    {
        var bookmarks = await _bookmarkService.GetMostUsedAsync(UserId, count, cancellationToken);
        return Ok(bookmarks);
    }

    [HttpPost]
    public async Task<ActionResult<BookmarkDto>> Create([FromBody] CreateBookmarkDto dto, CancellationToken cancellationToken)
    {
        var bookmark = await _bookmarkService.CreateAsync(UserId, dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = bookmark.Id }, bookmark);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BookmarkDto>> Update(Guid id, [FromBody] UpdateBookmarkDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var bookmark = await _bookmarkService.UpdateAsync(UserId, id, dto, cancellationToken);
            return Ok(bookmark);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            await _bookmarkService.DeleteAsync(UserId, id, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    [HttpGet("check-duplicate")]
    public async Task<ActionResult<bool>> CheckDuplicate([FromQuery] string url, CancellationToken cancellationToken)
    {
        var isDuplicate = await _bookmarkService.CheckDuplicateAsync(UserId, url, cancellationToken);
        return Ok(new { isDuplicate });
    }

    [HttpPost("{id:guid}/click")]
    public async Task<IActionResult> TrackClick(Guid id, CancellationToken cancellationToken)
    {
        await _bookmarkService.TrackClickAsync(UserId, id, cancellationToken);
        return NoContent();
    }

    [HttpPost("reorder")]
    public async Task<IActionResult> Reorder([FromBody] ReorderBookmarksDto dto, CancellationToken cancellationToken)
    {
        await _bookmarkService.ReorderAsync(UserId, dto, cancellationToken);
        return NoContent();
    }

    [HttpPost("import")]
    public async Task<ActionResult<IEnumerable<BookmarkDto>>> BulkImport([FromBody] BulkImportDto dto, CancellationToken cancellationToken)
    {
        var bookmarks = await _bookmarkService.BulkImportAsync(UserId, dto, cancellationToken);
        return Ok(bookmarks);
    }

    [HttpGet("export")]
    public async Task<ActionResult<BookmarkExportDto>> Export(CancellationToken cancellationToken)
    {
        var export = await _bookmarkService.ExportAsync(UserId, cancellationToken);
        return Ok(export);
    }
}

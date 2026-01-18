using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BookmarkManager.Api.Controllers;

public class FoldersController : BaseController
{
    private readonly IFolderService _folderService;

    public FoldersController(IFolderService folderService)
    {
        _folderService = folderService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FolderDto>>> GetAll(CancellationToken cancellationToken)
    {
        var folders = await _folderService.GetAllAsync(UserId, cancellationToken);
        return Ok(folders);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FolderDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var folder = await _folderService.GetByIdAsync(UserId, id, cancellationToken);
        if (folder == null)
            return NotFound();
        return Ok(folder);
    }

    [HttpGet("{id:guid}/with-bookmarks")]
    public async Task<ActionResult<FolderWithBookmarksDto>> GetWithBookmarks(Guid id, CancellationToken cancellationToken)
    {
        var folder = await _folderService.GetWithBookmarksAsync(UserId, id, cancellationToken);
        if (folder == null)
            return NotFound();
        return Ok(folder);
    }

    [HttpGet("root")]
    public async Task<ActionResult<IEnumerable<FolderDto>>> GetRootFolders(CancellationToken cancellationToken)
    {
        var folders = await _folderService.GetRootFoldersAsync(UserId, cancellationToken);
        return Ok(folders);
    }

    [HttpGet("{parentId:guid}/subfolders")]
    public async Task<ActionResult<IEnumerable<FolderDto>>> GetSubFolders(Guid parentId, CancellationToken cancellationToken)
    {
        var folders = await _folderService.GetSubFoldersAsync(UserId, parentId, cancellationToken);
        return Ok(folders);
    }

    [HttpPost]
    public async Task<ActionResult<FolderDto>> Create([FromBody] CreateFolderDto dto, CancellationToken cancellationToken)
    {
        var folder = await _folderService.CreateAsync(UserId, dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = folder.Id }, folder);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<FolderDto>> Update(Guid id, [FromBody] UpdateFolderDto dto, CancellationToken cancellationToken)
    {
        // EntityNotFoundException is handled by global exception middleware
        var folder = await _folderService.UpdateAsync(UserId, id, dto, cancellationToken);
        return Ok(folder);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        // EntityNotFoundException is handled by global exception middleware
        await _folderService.DeleteAsync(UserId, id, cancellationToken);
        return NoContent();
    }

    [HttpPost("reorder")]
    public async Task<IActionResult> Reorder([FromBody] ReorderFoldersDto dto, CancellationToken cancellationToken)
    {
        await _folderService.ReorderAsync(UserId, dto, cancellationToken);
        return NoContent();
    }
}

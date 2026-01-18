using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BookmarkManager.Api.Controllers;

public class TagsController : BaseController
{
    private readonly ITagService _tagService;

    public TagsController(ITagService tagService)
    {
        _tagService = tagService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TagDto>>> GetAll(CancellationToken cancellationToken)
    {
        var tags = await _tagService.GetAllAsync(UserId, cancellationToken);
        return Ok(tags);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TagDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var tag = await _tagService.GetByIdAsync(UserId, id, cancellationToken);
        if (tag == null)
            return NotFound();
        return Ok(tag);
    }

    [HttpPost]
    public async Task<ActionResult<TagDto>> Create([FromBody] CreateTagDto dto, CancellationToken cancellationToken)
    {
        // DuplicateEntityException is handled by global exception middleware (returns 409 Conflict)
        var tag = await _tagService.CreateAsync(UserId, dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = tag.Id }, tag);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TagDto>> Update(Guid id, [FromBody] UpdateTagDto dto, CancellationToken cancellationToken)
    {
        // EntityNotFoundException and DuplicateEntityException handled by global exception middleware
        var tag = await _tagService.UpdateAsync(UserId, id, dto, cancellationToken);
        return Ok(tag);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        // EntityNotFoundException is handled by global exception middleware
        await _tagService.DeleteAsync(UserId, id, cancellationToken);
        return NoContent();
    }
}

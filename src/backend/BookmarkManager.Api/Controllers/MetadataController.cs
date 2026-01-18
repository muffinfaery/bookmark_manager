using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BookmarkManager.Api.Controllers;

public class MetadataController : BaseController
{
    private readonly IMetadataService _metadataService;

    public MetadataController(IMetadataService metadataService)
    {
        _metadataService = metadataService;
    }

    [HttpPost("fetch")]
    public async Task<ActionResult<UrlMetadataDto>> FetchMetadata([FromBody] FetchMetadataRequestDto dto, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(dto.Url))
            return BadRequest(new { message = "URL is required" });

        // Metadata fetch failures return default metadata rather than errors (graceful degradation)
        var metadata = await _metadataService.FetchMetadataAsync(dto.Url, cancellationToken);
        return Ok(metadata);
    }
}

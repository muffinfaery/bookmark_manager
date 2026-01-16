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

        try
        {
            var metadata = await _metadataService.FetchMetadataAsync(dto.Url, cancellationToken);
            return Ok(metadata);
        }
        catch (Exception ex)
        {
            return Ok(new UrlMetadataDto(dto.Url, null, null, null, null));
        }
    }
}

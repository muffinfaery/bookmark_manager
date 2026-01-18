using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Interfaces;
using HtmlAgilityPack;
using Microsoft.Extensions.Logging;

namespace BookmarkManager.Infrastructure.Services;

public class MetadataService : IMetadataService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<MetadataService> _logger;

    public MetadataService(HttpClient httpClient, ILogger<MetadataService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _httpClient.Timeout = TimeSpan.FromSeconds(10);
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "BookmarkManager/1.0");
    }

    public async Task<UrlMetadataDto> FetchMetadataAsync(string url, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogDebug("Fetching metadata for URL: {Url}", url);

            var response = await _httpClient.GetStringAsync(url, cancellationToken);
            var doc = new HtmlDocument();
            doc.LoadHtml(response);

            var title = ExtractTitle(doc);
            var description = ExtractDescription(doc);
            var favicon = ExtractFavicon(doc, url);
            var image = ExtractImage(doc, url);

            _logger.LogDebug("Successfully fetched metadata for URL: {Url}, Title: {Title}", url, title);

            return new UrlMetadataDto(url, title, description, favicon, image);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "HTTP error fetching metadata for URL: {Url}", url);
            return new UrlMetadataDto(url, null, null, GetDefaultFavicon(url), null);
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogWarning(ex, "Timeout fetching metadata for URL: {Url}", url);
            return new UrlMetadataDto(url, null, null, GetDefaultFavicon(url), null);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Unexpected error fetching metadata for URL: {Url}", url);
            return new UrlMetadataDto(url, null, null, GetDefaultFavicon(url), null);
        }
    }

    private static string? ExtractTitle(HtmlDocument doc)
    {
        // Try Open Graph title first
        var ogTitle = doc.DocumentNode.SelectSingleNode("//meta[@property='og:title']")?.GetAttributeValue("content", null);
        if (!string.IsNullOrEmpty(ogTitle))
            return ogTitle;

        // Try Twitter title
        var twitterTitle = doc.DocumentNode.SelectSingleNode("//meta[@name='twitter:title']")?.GetAttributeValue("content", null);
        if (!string.IsNullOrEmpty(twitterTitle))
            return twitterTitle;

        // Fall back to page title
        var titleTag = doc.DocumentNode.SelectSingleNode("//title")?.InnerText;
        return titleTag?.Trim();
    }

    private static string? ExtractDescription(HtmlDocument doc)
    {
        // Try Open Graph description first
        var ogDesc = doc.DocumentNode.SelectSingleNode("//meta[@property='og:description']")?.GetAttributeValue("content", null);
        if (!string.IsNullOrEmpty(ogDesc))
            return ogDesc;

        // Try Twitter description
        var twitterDesc = doc.DocumentNode.SelectSingleNode("//meta[@name='twitter:description']")?.GetAttributeValue("content", null);
        if (!string.IsNullOrEmpty(twitterDesc))
            return twitterDesc;

        // Fall back to meta description
        var metaDesc = doc.DocumentNode.SelectSingleNode("//meta[@name='description']")?.GetAttributeValue("content", null);
        return metaDesc;
    }

    private static string? ExtractFavicon(HtmlDocument doc, string url)
    {
        var uri = new Uri(url);
        var baseUrl = $"{uri.Scheme}://{uri.Host}";

        // Try various favicon link tags
        var faviconSelectors = new[]
        {
            "//link[@rel='icon']",
            "//link[@rel='shortcut icon']",
            "//link[@rel='apple-touch-icon']",
            "//link[@rel='apple-touch-icon-precomposed']"
        };

        foreach (var selector in faviconSelectors)
        {
            var favicon = doc.DocumentNode.SelectSingleNode(selector)?.GetAttributeValue("href", null);
            if (!string.IsNullOrEmpty(favicon))
            {
                return MakeAbsoluteUrl(favicon, baseUrl);
            }
        }

        // Fall back to default favicon location
        return $"{baseUrl}/favicon.ico";
    }

    private static string? ExtractImage(HtmlDocument doc, string url)
    {
        var uri = new Uri(url);
        var baseUrl = $"{uri.Scheme}://{uri.Host}";

        // Try Open Graph image
        var ogImage = doc.DocumentNode.SelectSingleNode("//meta[@property='og:image']")?.GetAttributeValue("content", null);
        if (!string.IsNullOrEmpty(ogImage))
            return MakeAbsoluteUrl(ogImage, baseUrl);

        // Try Twitter image
        var twitterImage = doc.DocumentNode.SelectSingleNode("//meta[@name='twitter:image']")?.GetAttributeValue("content", null);
        if (!string.IsNullOrEmpty(twitterImage))
            return MakeAbsoluteUrl(twitterImage, baseUrl);

        return null;
    }

    private static string MakeAbsoluteUrl(string url, string baseUrl)
    {
        if (url.StartsWith("http://") || url.StartsWith("https://"))
            return url;
        if (url.StartsWith("//"))
            return $"https:{url}";
        if (url.StartsWith("/"))
            return $"{baseUrl}{url}";
        return $"{baseUrl}/{url}";
    }

    private static string GetDefaultFavicon(string url)
    {
        try
        {
            var uri = new Uri(url);
            return $"{uri.Scheme}://{uri.Host}/favicon.ico";
        }
        catch
        {
            return string.Empty;
        }
    }
}

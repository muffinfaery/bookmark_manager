using BookmarkManager.Api.Controllers;
using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Interfaces;
using BookmarkManager.Domain.Exceptions;
using BookmarkManager.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookmarkManager.Tests.Unit.Controllers;

public class BookmarksControllerTests
{
    private readonly Mock<IBookmarkService> _mockService;
    private readonly BookmarksController _controller;
    private const string TestUserId = "test-user-id";

    public BookmarksControllerTests()
    {
        _mockService = new Mock<IBookmarkService>();
        _controller = new BookmarksController(_mockService.Object);

        // Setup controller context with user claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, TestUserId)
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var principal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = principal }
        };
    }

    #region GetAll Tests

    [Fact]
    public async Task GetAll_ReturnsOkWithBookmarks()
    {
        // Arrange
        var bookmarks = new List<BookmarkDto>
        {
            CreateBookmarkDto(Guid.NewGuid(), "https://example1.com", "Example 1"),
            CreateBookmarkDto(Guid.NewGuid(), "https://example2.com", "Example 2")
        };
        _mockService.Setup(s => s.GetAllAsync(TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmarks);

        // Act
        var result = await _controller.GetAll(CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedBookmarks = okResult.Value.Should().BeAssignableTo<IEnumerable<BookmarkDto>>().Subject;
        returnedBookmarks.Should().HaveCount(2);
    }

    #endregion

    #region GetById Tests

    [Fact]
    public async Task GetById_ReturnsOk_WhenBookmarkExists()
    {
        // Arrange
        var id = Guid.NewGuid();
        var bookmark = CreateBookmarkDto(id, "https://example.com", "Test");
        _mockService.Setup(s => s.GetByIdAsync(TestUserId, id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmark);

        // Act
        var result = await _controller.GetById(id, CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().Be(bookmark);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenBookmarkDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();
        _mockService.Setup(s => s.GetByIdAsync(TestUserId, id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((BookmarkDto?)null);

        // Act
        var result = await _controller.GetById(id, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region GetByFolder Tests

    [Fact]
    public async Task GetByFolder_ReturnsOkWithBookmarks()
    {
        // Arrange
        var folderId = Guid.NewGuid();
        var bookmarks = new List<BookmarkDto>
        {
            CreateBookmarkDto(Guid.NewGuid(), "https://example.com", "Test", folderId: folderId)
        };
        _mockService.Setup(s => s.GetByFolderAsync(TestUserId, folderId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmarks);

        // Act
        var result = await _controller.GetByFolder(folderId, CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedBookmarks = okResult.Value.Should().BeAssignableTo<IEnumerable<BookmarkDto>>().Subject;
        returnedBookmarks.Should().ContainSingle();
    }

    #endregion

    #region GetFavorites Tests

    [Fact]
    public async Task GetFavorites_ReturnsOkWithFavorites()
    {
        // Arrange
        var favorites = new List<BookmarkDto>
        {
            CreateBookmarkDto(Guid.NewGuid(), "https://example.com", "Favorite", isFavorite: true)
        };
        _mockService.Setup(s => s.GetFavoritesAsync(TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(favorites);

        // Act
        var result = await _controller.GetFavorites(CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedBookmarks = okResult.Value.Should().BeAssignableTo<IEnumerable<BookmarkDto>>().Subject;
        returnedBookmarks.Should().ContainSingle();
    }

    #endregion

    #region Search Tests

    [Fact]
    public async Task Search_ReturnsBadRequest_WhenQueryIsEmpty()
    {
        // Act
        var result = await _controller.Search("", CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Search_ReturnsOk_WhenQueryIsValid()
    {
        // Arrange
        var bookmarks = new List<BookmarkDto>
        {
            CreateBookmarkDto(Guid.NewGuid(), "https://example.com", "Test Result")
        };
        _mockService.Setup(s => s.SearchAsync(TestUserId, "test", It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmarks);

        // Act
        var result = await _controller.Search("test", CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedBookmarks = okResult.Value.Should().BeAssignableTo<IEnumerable<BookmarkDto>>().Subject;
        returnedBookmarks.Should().ContainSingle();
    }

    #endregion

    #region Create Tests

    [Fact]
    public async Task Create_ReturnsCreatedAtAction()
    {
        // Arrange
        var dto = TestDataBuilder.CreateBookmarkDto(url: "https://example.com", title: "New Bookmark");
        var createdBookmark = CreateBookmarkDto(Guid.NewGuid(), dto.Url, dto.Title);
        _mockService.Setup(s => s.CreateAsync(TestUserId, dto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdBookmark);

        // Act
        var result = await _controller.Create(dto, CancellationToken.None);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(BookmarksController.GetById));
        createdResult.Value.Should().Be(createdBookmark);
    }

    #endregion

    #region Update Tests

    [Fact]
    public async Task Update_ReturnsOk_WhenSuccessful()
    {
        // Arrange
        var id = Guid.NewGuid();
        var dto = TestDataBuilder.CreateUpdateBookmarkDto(title: "Updated");
        var updatedBookmark = CreateBookmarkDto(id, "https://example.com", "Updated");
        _mockService.Setup(s => s.UpdateAsync(TestUserId, id, dto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedBookmark);

        // Act
        var result = await _controller.Update(id, dto, CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().Be(updatedBookmark);
    }

    [Fact]
    public async Task Update_ThrowsEntityNotFoundException_WhenBookmarkDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();
        var dto = TestDataBuilder.CreateUpdateBookmarkDto(title: "Updated");
        _mockService.Setup(s => s.UpdateAsync(TestUserId, id, dto, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new EntityNotFoundException("Bookmark", id));

        // Act & Assert - Exception propagates to middleware in production
        await Assert.ThrowsAsync<EntityNotFoundException>(
            () => _controller.Update(id, dto, CancellationToken.None));
    }

    #endregion

    #region Delete Tests

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenSuccessful()
    {
        // Arrange
        var id = Guid.NewGuid();
        _mockService.Setup(s => s.DeleteAsync(TestUserId, id, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.Delete(id, CancellationToken.None);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task Delete_ThrowsEntityNotFoundException_WhenBookmarkDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();
        _mockService.Setup(s => s.DeleteAsync(TestUserId, id, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new EntityNotFoundException("Bookmark", id));

        // Act & Assert - Exception propagates to middleware in production
        await Assert.ThrowsAsync<EntityNotFoundException>(
            () => _controller.Delete(id, CancellationToken.None));
    }

    #endregion

    #region CheckDuplicate Tests

    [Fact]
    public async Task CheckDuplicate_ReturnsResult()
    {
        // Arrange
        _mockService.Setup(s => s.CheckDuplicateAsync(TestUserId, "https://example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.CheckDuplicate("https://example.com", CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().NotBeNull();
    }

    #endregion

    #region TrackClick Tests

    [Fact]
    public async Task TrackClick_ReturnsNoContent()
    {
        // Arrange
        var id = Guid.NewGuid();
        _mockService.Setup(s => s.TrackClickAsync(TestUserId, id, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.TrackClick(id, CancellationToken.None);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    #endregion

    #region Reorder Tests

    [Fact]
    public async Task Reorder_ReturnsNoContent()
    {
        // Arrange
        var dto = new ReorderBookmarksDto(new List<BookmarkOrderItem>
        {
            new(Guid.NewGuid(), 0),
            new(Guid.NewGuid(), 1)
        });
        _mockService.Setup(s => s.ReorderAsync(TestUserId, dto, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _controller.Reorder(dto, CancellationToken.None);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    #endregion

    #region BulkImport Tests

    [Fact]
    public async Task BulkImport_ReturnsOkWithBookmarks()
    {
        // Arrange
        var dto = new BulkImportDto(new List<CreateBookmarkDto>
        {
            new("https://import.com", "Import", null, null, null, null)
        });
        var imported = new List<BookmarkDto>
        {
            CreateBookmarkDto(Guid.NewGuid(), "https://import.com", "Import")
        };
        _mockService.Setup(s => s.BulkImportAsync(TestUserId, dto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(imported);

        // Act
        var result = await _controller.BulkImport(dto, CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedBookmarks = okResult.Value.Should().BeAssignableTo<IEnumerable<BookmarkDto>>().Subject;
        returnedBookmarks.Should().ContainSingle();
    }

    #endregion

    #region Export Tests

    [Fact]
    public async Task Export_ReturnsOkWithExportData()
    {
        // Arrange
        var exportData = new BookmarkExportDto(
            new List<BookmarkDto>(),
            new List<FolderDto>(),
            new List<TagDto>(),
            DateTime.UtcNow
        );
        _mockService.Setup(s => s.ExportAsync(TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(exportData);

        // Act
        var result = await _controller.Export(CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().Be(exportData);
    }

    #endregion

    // Helper method to create BookmarkDto
    private static BookmarkDto CreateBookmarkDto(
        Guid id,
        string url,
        string title,
        Guid? folderId = null,
        bool isFavorite = false)
    {
        return new BookmarkDto(
            id,
            url,
            title,
            null,
            null,
            isFavorite,
            0,
            0,
            folderId,
            null,
            new List<TagDto>(),
            DateTime.UtcNow,
            DateTime.UtcNow
        );
    }
}

using BookmarkManager.Api.Controllers;
using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Interfaces;
using BookmarkManager.Domain.Exceptions;
using BookmarkManager.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookmarkManager.Tests.Unit.Controllers;

public class FoldersControllerTests
{
    private readonly Mock<IFolderService> _mockService;
    private readonly FoldersController _controller;
    private const string TestUserId = "test-user-id";

    public FoldersControllerTests()
    {
        _mockService = new Mock<IFolderService>();
        _controller = new FoldersController(_mockService.Object);

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
    public async Task GetAll_ReturnsOkWithFolders()
    {
        // Arrange
        var folders = new List<FolderDto>
        {
            CreateFolderDto(Guid.NewGuid(), "Folder 1"),
            CreateFolderDto(Guid.NewGuid(), "Folder 2")
        };
        _mockService.Setup(s => s.GetAllAsync(TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folders);

        // Act
        var result = await _controller.GetAll(CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedFolders = okResult.Value.Should().BeAssignableTo<IEnumerable<FolderDto>>().Subject;
        returnedFolders.Should().HaveCount(2);
    }

    #endregion

    #region GetById Tests

    [Fact]
    public async Task GetById_ReturnsOk_WhenFolderExists()
    {
        // Arrange
        var id = Guid.NewGuid();
        var folder = CreateFolderDto(id, "Test Folder");
        _mockService.Setup(s => s.GetByIdAsync(TestUserId, id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folder);

        // Act
        var result = await _controller.GetById(id, CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().Be(folder);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenFolderDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();
        _mockService.Setup(s => s.GetByIdAsync(TestUserId, id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((FolderDto?)null);

        // Act
        var result = await _controller.GetById(id, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region GetWithBookmarks Tests

    [Fact]
    public async Task GetWithBookmarks_ReturnsOk_WhenFolderExists()
    {
        // Arrange
        var id = Guid.NewGuid();
        var folder = new FolderWithBookmarksDto(
            id,
            "Test Folder",
            null,
            null,
            0,
            null,
            new List<BookmarkDto>(),
            new List<FolderDto>(),
            DateTime.UtcNow,
            DateTime.UtcNow
        );
        _mockService.Setup(s => s.GetWithBookmarksAsync(TestUserId, id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folder);

        // Act
        var result = await _controller.GetWithBookmarks(id, CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().Be(folder);
    }

    [Fact]
    public async Task GetWithBookmarks_ReturnsNotFound_WhenFolderDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();
        _mockService.Setup(s => s.GetWithBookmarksAsync(TestUserId, id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((FolderWithBookmarksDto?)null);

        // Act
        var result = await _controller.GetWithBookmarks(id, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region GetRootFolders Tests

    [Fact]
    public async Task GetRootFolders_ReturnsOk()
    {
        // Arrange
        var folders = new List<FolderDto>
        {
            CreateFolderDto(Guid.NewGuid(), "Root 1"),
            CreateFolderDto(Guid.NewGuid(), "Root 2")
        };
        _mockService.Setup(s => s.GetRootFoldersAsync(TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folders);

        // Act
        var result = await _controller.GetRootFolders(CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedFolders = okResult.Value.Should().BeAssignableTo<IEnumerable<FolderDto>>().Subject;
        returnedFolders.Should().HaveCount(2);
    }

    #endregion

    #region GetSubFolders Tests

    [Fact]
    public async Task GetSubFolders_ReturnsOk()
    {
        // Arrange
        var parentId = Guid.NewGuid();
        var folders = new List<FolderDto>
        {
            CreateFolderDto(Guid.NewGuid(), "Child 1", parentId: parentId)
        };
        _mockService.Setup(s => s.GetSubFoldersAsync(TestUserId, parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folders);

        // Act
        var result = await _controller.GetSubFolders(parentId, CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedFolders = okResult.Value.Should().BeAssignableTo<IEnumerable<FolderDto>>().Subject;
        returnedFolders.Should().ContainSingle();
    }

    #endregion

    #region Create Tests

    [Fact]
    public async Task Create_ReturnsCreatedAtAction()
    {
        // Arrange
        var dto = TestDataBuilder.CreateFolderDto(name: "New Folder");
        var createdFolder = CreateFolderDto(Guid.NewGuid(), "New Folder");
        _mockService.Setup(s => s.CreateAsync(TestUserId, dto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdFolder);

        // Act
        var result = await _controller.Create(dto, CancellationToken.None);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(FoldersController.GetById));
        createdResult.Value.Should().Be(createdFolder);
    }

    #endregion

    #region Update Tests

    [Fact]
    public async Task Update_ReturnsOk_WhenSuccessful()
    {
        // Arrange
        var id = Guid.NewGuid();
        var dto = new UpdateFolderDto("Updated", null, null, null);
        var updatedFolder = CreateFolderDto(id, "Updated");
        _mockService.Setup(s => s.UpdateAsync(TestUserId, id, dto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedFolder);

        // Act
        var result = await _controller.Update(id, dto, CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().Be(updatedFolder);
    }

    [Fact]
    public async Task Update_ThrowsEntityNotFoundException_WhenFolderDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();
        var dto = new UpdateFolderDto("Updated", null, null, null);
        _mockService.Setup(s => s.UpdateAsync(TestUserId, id, dto, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new EntityNotFoundException("Folder", id));

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
    public async Task Delete_ThrowsEntityNotFoundException_WhenFolderDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();
        _mockService.Setup(s => s.DeleteAsync(TestUserId, id, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new EntityNotFoundException("Folder", id));

        // Act & Assert - Exception propagates to middleware in production
        await Assert.ThrowsAsync<EntityNotFoundException>(
            () => _controller.Delete(id, CancellationToken.None));
    }

    #endregion

    #region Reorder Tests

    [Fact]
    public async Task Reorder_ReturnsNoContent()
    {
        // Arrange
        var dto = new ReorderFoldersDto(new List<FolderOrderItem>
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

    // Helper method to create FolderDto
    private static FolderDto CreateFolderDto(Guid id, string name, Guid? parentId = null)
    {
        return new FolderDto(
            id,
            name,
            null,
            null,
            0,
            parentId,
            0,
            DateTime.UtcNow,
            DateTime.UtcNow
        );
    }
}

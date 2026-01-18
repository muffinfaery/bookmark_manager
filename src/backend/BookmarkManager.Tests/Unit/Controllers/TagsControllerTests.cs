using BookmarkManager.Api.Controllers;
using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Interfaces;
using BookmarkManager.Tests.Helpers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BookmarkManager.Tests.Unit.Controllers;

public class TagsControllerTests
{
    private readonly Mock<ITagService> _mockService;
    private readonly TagsController _controller;
    private const string TestUserId = "test-user-id";

    public TagsControllerTests()
    {
        _mockService = new Mock<ITagService>();
        _controller = new TagsController(_mockService.Object);

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
    public async Task GetAll_ReturnsOkWithTags()
    {
        // Arrange
        var tags = new List<TagDto>
        {
            CreateTagDto(Guid.NewGuid(), "Tag 1"),
            CreateTagDto(Guid.NewGuid(), "Tag 2")
        };
        _mockService.Setup(s => s.GetAllAsync(TestUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tags);

        // Act
        var result = await _controller.GetAll(CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var returnedTags = okResult.Value.Should().BeAssignableTo<IEnumerable<TagDto>>().Subject;
        returnedTags.Should().HaveCount(2);
    }

    #endregion

    #region GetById Tests

    [Fact]
    public async Task GetById_ReturnsOk_WhenTagExists()
    {
        // Arrange
        var id = Guid.NewGuid();
        var tag = CreateTagDto(id, "Test Tag");
        _mockService.Setup(s => s.GetByIdAsync(TestUserId, id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tag);

        // Act
        var result = await _controller.GetById(id, CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().Be(tag);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenTagDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();
        _mockService.Setup(s => s.GetByIdAsync(TestUserId, id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TagDto?)null);

        // Act
        var result = await _controller.GetById(id, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    #region Create Tests

    [Fact]
    public async Task Create_ReturnsCreatedAtAction()
    {
        // Arrange
        var dto = TestDataBuilder.CreateTagDto(name: "New Tag", color: "#ff0000");
        var createdTag = CreateTagDto(Guid.NewGuid(), "New Tag", "#ff0000");
        _mockService.Setup(s => s.CreateAsync(TestUserId, dto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdTag);

        // Act
        var result = await _controller.Create(dto, CancellationToken.None);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.ActionName.Should().Be(nameof(TagsController.GetById));
        createdResult.Value.Should().Be(createdTag);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenTagAlreadyExists()
    {
        // Arrange
        var dto = TestDataBuilder.CreateTagDto(name: "ExistingTag");
        _mockService.Setup(s => s.CreateAsync(TestUserId, dto, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Tag already exists"));

        // Act
        var result = await _controller.Create(dto, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    #endregion

    #region Update Tests

    [Fact]
    public async Task Update_ReturnsOk_WhenSuccessful()
    {
        // Arrange
        var id = Guid.NewGuid();
        var dto = new UpdateTagDto("Updated", "#00ff00");
        var updatedTag = CreateTagDto(id, "Updated", "#00ff00");
        _mockService.Setup(s => s.UpdateAsync(TestUserId, id, dto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedTag);

        // Act
        var result = await _controller.Update(id, dto, CancellationToken.None);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().Be(updatedTag);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenTagDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();
        var dto = new UpdateTagDto("Updated", null);
        _mockService.Setup(s => s.UpdateAsync(TestUserId, id, dto, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Tag not found"));

        // Act
        var result = await _controller.Update(id, dto, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Update_ReturnsBadRequest_WhenNameAlreadyExists()
    {
        // Arrange
        var id = Guid.NewGuid();
        var dto = new UpdateTagDto("Duplicate", null);
        _mockService.Setup(s => s.UpdateAsync(TestUserId, id, dto, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Tag name already exists"));

        // Act
        var result = await _controller.Update(id, dto, CancellationToken.None);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
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
    public async Task Delete_ReturnsNotFound_WhenTagDoesNotExist()
    {
        // Arrange
        var id = Guid.NewGuid();
        _mockService.Setup(s => s.DeleteAsync(TestUserId, id, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Not found"));

        // Act
        var result = await _controller.Delete(id, CancellationToken.None);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    #endregion

    // Helper method to create TagDto
    private static TagDto CreateTagDto(Guid id, string name, string? color = null)
    {
        return new TagDto(
            id,
            name,
            color,
            0,
            DateTime.UtcNow
        );
    }
}

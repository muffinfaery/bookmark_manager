using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Implementations;
using BookmarkManager.Domain.Entities;
using BookmarkManager.Domain.Interfaces;
using BookmarkManager.Tests.Helpers;

namespace BookmarkManager.Tests.Unit.Services;

public class TagServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ITagRepository> _mockTagRepository;
    private readonly TagService _service;

    public TagServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockTagRepository = new Mock<ITagRepository>();

        _mockUnitOfWork.Setup(u => u.Tags).Returns(_mockTagRepository.Object);

        _service = new TagService(_mockUnitOfWork.Object);
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ReturnsTagsForUser()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var tags = TestDataBuilder.CreateTagList(userId, 3);

        _mockTagRepository.Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tags);

        // Act
        var result = await _service.GetAllAsync(userId);

        // Assert
        result.Should().HaveCount(3);
        _mockTagRepository.Verify(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsEmptyList_WhenNoTags()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;

        _mockTagRepository.Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Tag>());

        // Act
        var result = await _service.GetAllAsync(userId);

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_ReturnsTag_WhenFound()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var tag = TestDataBuilder.CreateTag(userId, name: "Important");

        _mockTagRepository.Setup(r => r.GetByIdAsync(tag.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tag);

        // Act
        var result = await _service.GetByIdAsync(userId, tag.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(tag.Id);
        result.Name.Should().Be("Important");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var id = Guid.NewGuid();

        _mockTagRepository.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tag?)null);

        // Act
        var result = await _service.GetByIdAsync(userId, id);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenUserDoesNotOwnTag()
    {
        // Arrange
        var tag = TestDataBuilder.CreateTag(TestDataBuilder.OtherUserId);

        _mockTagRepository.Setup(r => r.GetByIdAsync(tag.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tag);

        // Act
        var result = await _service.GetByIdAsync(TestDataBuilder.DefaultUserId, tag.Id);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_CreatesTagSuccessfully()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var dto = TestDataBuilder.CreateTagDto(name: "NewTag", color: "#ff0000");

        _mockTagRepository.Setup(r => r.GetByNameAsync(userId, "NewTag", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tag?)null);
        _mockTagRepository.Setup(r => r.AddAsync(It.IsAny<Tag>(), It.IsAny<CancellationToken>()))
            .Returns<Tag, CancellationToken>((t, _) => Task.FromResult(t));
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateAsync(userId, dto);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("NewTag");
        result.Color.Should().Be("#ff0000");

        _mockTagRepository.Verify(r => r.AddAsync(It.IsAny<Tag>(), It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ThrowsException_WhenTagAlreadyExists()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var existingTag = TestDataBuilder.CreateTag(userId, name: "ExistingTag");
        var dto = TestDataBuilder.CreateTagDto(name: "ExistingTag");

        _mockTagRepository.Setup(r => r.GetByNameAsync(userId, "ExistingTag", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingTag);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.CreateAsync(userId, dto));

        _mockTagRepository.Verify(r => r.AddAsync(It.IsAny<Tag>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_UpdatesTagSuccessfully()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var tag = TestDataBuilder.CreateTag(userId, name: "OldName");
        var dto = new UpdateTagDto("NewName", "#00ff00");

        _mockTagRepository.Setup(r => r.GetByIdAsync(tag.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tag);
        _mockTagRepository.Setup(r => r.GetByNameAsync(userId, "NewName", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tag?)null);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateAsync(userId, tag.Id, dto);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("NewName");
        result.Color.Should().Be("#00ff00");
    }

    [Fact]
    public async Task UpdateAsync_ThrowsException_WhenTagNotFound()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var id = Guid.NewGuid();
        var dto = new UpdateTagDto("Name", null);

        _mockTagRepository.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tag?)null);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.UpdateAsync(userId, id, dto));
    }

    [Fact]
    public async Task UpdateAsync_ThrowsException_WhenUserDoesNotOwnTag()
    {
        // Arrange
        var tag = TestDataBuilder.CreateTag(TestDataBuilder.OtherUserId);
        var dto = new UpdateTagDto("Name", null);

        _mockTagRepository.Setup(r => r.GetByIdAsync(tag.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tag);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.UpdateAsync(TestDataBuilder.DefaultUserId, tag.Id, dto));
    }

    [Fact]
    public async Task UpdateAsync_ThrowsException_WhenNewNameAlreadyExists()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var tag = TestDataBuilder.CreateTag(userId, name: "Original");
        var existingTag = TestDataBuilder.CreateTag(userId, name: "AlreadyExists");
        var dto = new UpdateTagDto("AlreadyExists", null);

        _mockTagRepository.Setup(r => r.GetByIdAsync(tag.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tag);
        _mockTagRepository.Setup(r => r.GetByNameAsync(userId, "AlreadyExists", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingTag);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.UpdateAsync(userId, tag.Id, dto));
    }

    [Fact]
    public async Task UpdateAsync_AllowsSameNameForSameTag()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var tag = TestDataBuilder.CreateTag(userId, name: "SameName");
        var dto = new UpdateTagDto("SameName", "#new-color");

        _mockTagRepository.Setup(r => r.GetByIdAsync(tag.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tag);
        _mockTagRepository.Setup(r => r.GetByNameAsync(userId, "SameName", It.IsAny<CancellationToken>()))
            .ReturnsAsync(tag); // Returns the same tag
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateAsync(userId, tag.Id, dto);

        // Assert
        result.Should().NotBeNull();
        result.Color.Should().Be("#new-color");
    }

    [Fact]
    public async Task UpdateAsync_OnlyUpdatesProvidedFields()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var tag = TestDataBuilder.CreateTag(userId, name: "Original", color: "#ff0000");
        var dto = new UpdateTagDto(null, "#00ff00");

        _mockTagRepository.Setup(r => r.GetByIdAsync(tag.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tag);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateAsync(userId, tag.Id, dto);

        // Assert
        result.Name.Should().Be("Original"); // Unchanged
        result.Color.Should().Be("#00ff00"); // Updated
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_DeletesTagSuccessfully()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var tag = TestDataBuilder.CreateTag(userId);

        _mockTagRepository.Setup(r => r.GetByIdAsync(tag.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tag);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _service.DeleteAsync(userId, tag.Id);

        // Assert
        _mockTagRepository.Verify(r => r.DeleteAsync(tag, It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ThrowsException_WhenTagNotFound()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var id = Guid.NewGuid();

        _mockTagRepository.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tag?)null);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.DeleteAsync(userId, id));
    }

    [Fact]
    public async Task DeleteAsync_ThrowsException_WhenUserDoesNotOwnTag()
    {
        // Arrange
        var tag = TestDataBuilder.CreateTag(TestDataBuilder.OtherUserId);

        _mockTagRepository.Setup(r => r.GetByIdAsync(tag.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tag);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.DeleteAsync(TestDataBuilder.DefaultUserId, tag.Id));
    }

    #endregion
}

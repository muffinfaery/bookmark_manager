using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Implementations;
using BookmarkManager.Domain.Entities;
using BookmarkManager.Domain.Exceptions;
using BookmarkManager.Domain.Interfaces;
using BookmarkManager.Tests.Helpers;

namespace BookmarkManager.Tests.Unit.Services;

public class FolderServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IFolderRepository> _mockFolderRepository;
    private readonly FolderService _service;

    public FolderServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockFolderRepository = new Mock<IFolderRepository>();

        _mockUnitOfWork.Setup(u => u.Folders).Returns(_mockFolderRepository.Object);

        _service = new FolderService(_mockUnitOfWork.Object);
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ReturnsFoldersForUser()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var folders = TestDataBuilder.CreateFolderList(userId, 3);

        _mockFolderRepository.Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folders);

        // Act
        var result = await _service.GetAllAsync(userId);

        // Assert
        result.Should().HaveCount(3);
        _mockFolderRepository.Verify(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsEmptyList_WhenNoFolders()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;

        _mockFolderRepository.Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Folder>());

        // Act
        var result = await _service.GetAllAsync(userId);

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_ReturnsFolder_WhenFound()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var folder = TestDataBuilder.CreateFolder(userId, name: "Work");

        _mockFolderRepository.Setup(r => r.GetByIdAsync(folder.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folder);

        // Act
        var result = await _service.GetByIdAsync(userId, folder.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(folder.Id);
        result.Name.Should().Be("Work");
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var id = Guid.NewGuid();

        _mockFolderRepository.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Folder?)null);

        // Act
        var result = await _service.GetByIdAsync(userId, id);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenUserDoesNotOwnFolder()
    {
        // Arrange
        var folder = TestDataBuilder.CreateFolder(TestDataBuilder.OtherUserId);

        _mockFolderRepository.Setup(r => r.GetByIdAsync(folder.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folder);

        // Act
        var result = await _service.GetByIdAsync(TestDataBuilder.DefaultUserId, folder.Id);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetWithBookmarksAsync Tests

    [Fact]
    public async Task GetWithBookmarksAsync_ReturnsFolderWithBookmarks()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var folder = TestDataBuilder.CreateFolder(userId, name: "Work");
        var bookmarks = TestDataBuilder.CreateBookmarkList(userId, 2);
        foreach (var b in bookmarks) folder.Bookmarks.Add(b);

        _mockFolderRepository.Setup(r => r.GetWithBookmarksAsync(folder.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folder);

        // Act
        var result = await _service.GetWithBookmarksAsync(userId, folder.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Bookmarks.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetWithBookmarksAsync_ReturnsNull_WhenUserDoesNotOwnFolder()
    {
        // Arrange
        var folder = TestDataBuilder.CreateFolder(TestDataBuilder.OtherUserId);

        _mockFolderRepository.Setup(r => r.GetWithBookmarksAsync(folder.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folder);

        // Act
        var result = await _service.GetWithBookmarksAsync(TestDataBuilder.DefaultUserId, folder.Id);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetRootFoldersAsync Tests

    [Fact]
    public async Task GetRootFoldersAsync_ReturnsOnlyRootFolders()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var rootFolders = TestDataBuilder.CreateFolderList(userId, 2);

        _mockFolderRepository.Setup(r => r.GetRootFoldersAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(rootFolders);

        // Act
        var result = await _service.GetRootFoldersAsync(userId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(f => f.ParentFolderId == null);
    }

    #endregion

    #region GetSubFoldersAsync Tests

    [Fact]
    public async Task GetSubFoldersAsync_ReturnsSubFoldersOfParent()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var parentId = Guid.NewGuid();
        var subFolders = TestDataBuilder.CreateFolderList(userId, 2)
            .Select(f => { f.ParentFolderId = parentId; return f; })
            .ToList();

        _mockFolderRepository.Setup(r => r.GetSubFoldersAsync(userId, parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(subFolders);

        // Act
        var result = await _service.GetSubFoldersAsync(userId, parentId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(f => f.ParentFolderId == parentId);
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_CreatesFolderSuccessfully()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var dto = TestDataBuilder.CreateFolderDto(name: "New Folder", color: "#ff0000");

        _mockFolderRepository.Setup(r => r.AddAsync(It.IsAny<Folder>(), It.IsAny<CancellationToken>()))
            .Returns<Folder, CancellationToken>((f, _) => Task.FromResult(f));
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateAsync(userId, dto);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("New Folder");
        result.Color.Should().Be("#ff0000");

        _mockFolderRepository.Verify(r => r.AddAsync(It.IsAny<Folder>(), It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_CreatesNestedFolder()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var parentId = Guid.NewGuid();
        var dto = TestDataBuilder.CreateFolderDto(name: "Subfolder", parentFolderId: parentId);

        _mockFolderRepository.Setup(r => r.AddAsync(It.IsAny<Folder>(), It.IsAny<CancellationToken>()))
            .Returns<Folder, CancellationToken>((f, _) => Task.FromResult(f));
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateAsync(userId, dto);

        // Assert
        result.ParentFolderId.Should().Be(parentId);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_UpdatesFolderSuccessfully()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var folder = TestDataBuilder.CreateFolder(userId, name: "Old Name");
        var dto = new UpdateFolderDto("New Name", "#00ff00", null, null);

        _mockFolderRepository.Setup(r => r.GetByIdAsync(folder.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folder);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateAsync(userId, folder.Id, dto);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("New Name");
        result.Color.Should().Be("#00ff00");
    }

    [Fact]
    public async Task UpdateAsync_ThrowsException_WhenFolderNotFound()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var id = Guid.NewGuid();
        var dto = new UpdateFolderDto("Name", null, null, null);

        _mockFolderRepository.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Folder?)null);

        // Act & Assert
        await Assert.ThrowsAsync<EntityNotFoundException>(
            () => _service.UpdateAsync(userId, id, dto));
    }

    [Fact]
    public async Task UpdateAsync_ThrowsException_WhenUserDoesNotOwnFolder()
    {
        // Arrange
        var folder = TestDataBuilder.CreateFolder(TestDataBuilder.OtherUserId);
        var dto = new UpdateFolderDto("Name", null, null, null);

        _mockFolderRepository.Setup(r => r.GetByIdAsync(folder.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folder);

        // Act & Assert
        await Assert.ThrowsAsync<EntityNotFoundException>(
            () => _service.UpdateAsync(TestDataBuilder.DefaultUserId, folder.Id, dto));
    }

    [Fact]
    public async Task UpdateAsync_OnlyUpdatesProvidedFields()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var folder = TestDataBuilder.CreateFolder(userId, name: "Original", color: "#ff0000");
        var dto = new UpdateFolderDto("Updated", null, null, null);

        _mockFolderRepository.Setup(r => r.GetByIdAsync(folder.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folder);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateAsync(userId, folder.Id, dto);

        // Assert
        result.Name.Should().Be("Updated");
        result.Color.Should().Be("#ff0000"); // Unchanged
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_DeletesFolderSuccessfully()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var folder = TestDataBuilder.CreateFolder(userId);

        _mockFolderRepository.Setup(r => r.GetByIdAsync(folder.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folder);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _service.DeleteAsync(userId, folder.Id);

        // Assert
        _mockFolderRepository.Verify(r => r.DeleteAsync(folder, It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ThrowsException_WhenFolderNotFound()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var id = Guid.NewGuid();

        _mockFolderRepository.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Folder?)null);

        // Act & Assert
        await Assert.ThrowsAsync<EntityNotFoundException>(
            () => _service.DeleteAsync(userId, id));
    }

    [Fact]
    public async Task DeleteAsync_ThrowsException_WhenUserDoesNotOwnFolder()
    {
        // Arrange
        var folder = TestDataBuilder.CreateFolder(TestDataBuilder.OtherUserId);

        _mockFolderRepository.Setup(r => r.GetByIdAsync(folder.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folder);

        // Act & Assert
        await Assert.ThrowsAsync<EntityNotFoundException>(
            () => _service.DeleteAsync(TestDataBuilder.DefaultUserId, folder.Id));
    }

    #endregion

    #region ReorderAsync Tests

    [Fact]
    public async Task ReorderAsync_UpdatesSortOrders()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var dto = new ReorderFoldersDto(new List<FolderOrderItem>
        {
            new FolderOrderItem(Guid.NewGuid(), 0),
            new FolderOrderItem(Guid.NewGuid(), 1),
            new FolderOrderItem(Guid.NewGuid(), 2)
        });

        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _service.ReorderAsync(userId, dto);

        // Assert
        _mockFolderRepository.Verify(
            r => r.UpdateSortOrderAsync(It.IsAny<IEnumerable<(Guid, int)>>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion
}

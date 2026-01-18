using BookmarkManager.Application.DTOs;
using BookmarkManager.Application.Services.Implementations;
using BookmarkManager.Domain.Entities;
using BookmarkManager.Domain.Interfaces;
using BookmarkManager.Tests.Helpers;

namespace BookmarkManager.Tests.Unit.Services;

public class BookmarkServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IBookmarkRepository> _mockBookmarkRepository;
    private readonly Mock<IFolderRepository> _mockFolderRepository;
    private readonly Mock<ITagRepository> _mockTagRepository;
    private readonly BookmarkService _service;

    public BookmarkServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockBookmarkRepository = new Mock<IBookmarkRepository>();
        _mockFolderRepository = new Mock<IFolderRepository>();
        _mockTagRepository = new Mock<ITagRepository>();

        _mockUnitOfWork.Setup(u => u.Bookmarks).Returns(_mockBookmarkRepository.Object);
        _mockUnitOfWork.Setup(u => u.Folders).Returns(_mockFolderRepository.Object);
        _mockUnitOfWork.Setup(u => u.Tags).Returns(_mockTagRepository.Object);

        _service = new BookmarkService(_mockUnitOfWork.Object);
    }

    #region GetAllAsync Tests

    [Fact]
    public async Task GetAllAsync_ReturnsBookmarksForUser()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var bookmarks = TestDataBuilder.CreateBookmarkList(userId, 3);

        _mockBookmarkRepository.Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmarks);

        // Act
        var result = await _service.GetAllAsync(userId);

        // Assert
        result.Should().HaveCount(3);
        _mockBookmarkRepository.Verify(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAllAsync_ReturnsEmptyList_WhenNoBookmarks()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;

        _mockBookmarkRepository.Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Bookmark>());

        // Act
        var result = await _service.GetAllAsync(userId);

        // Assert
        result.Should().BeEmpty();
    }

    #endregion

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_ReturnsBookmark_WhenFound()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var bookmark = TestDataBuilder.CreateBookmark(userId);

        _mockBookmarkRepository.Setup(r => r.GetByIdAsync(bookmark.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmark);

        // Act
        var result = await _service.GetByIdAsync(userId, bookmark.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(bookmark.Id);
        result.Url.Should().Be(bookmark.Url);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotFound()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var id = Guid.NewGuid();

        _mockBookmarkRepository.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Bookmark?)null);

        // Act
        var result = await _service.GetByIdAsync(userId, id);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenUserDoesNotOwnBookmark()
    {
        // Arrange
        var bookmark = TestDataBuilder.CreateBookmark(TestDataBuilder.OtherUserId);

        _mockBookmarkRepository.Setup(r => r.GetByIdAsync(bookmark.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmark);

        // Act
        var result = await _service.GetByIdAsync(TestDataBuilder.DefaultUserId, bookmark.Id);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetByFolderAsync Tests

    [Fact]
    public async Task GetByFolderAsync_ReturnsBookmarksInFolder()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var folderId = Guid.NewGuid();
        var bookmarks = TestDataBuilder.CreateBookmarkList(userId, 2)
            .Select(b => { b.FolderId = folderId; return b; })
            .ToList();

        _mockBookmarkRepository.Setup(r => r.GetByFolderIdAsync(userId, folderId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmarks);

        // Act
        var result = await _service.GetByFolderAsync(userId, folderId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(b => b.FolderId == folderId);
    }

    [Fact]
    public async Task GetByFolderAsync_ReturnsUncategorizedBookmarks_WhenFolderIdIsNull()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var bookmarks = TestDataBuilder.CreateBookmarkList(userId, 2);

        _mockBookmarkRepository.Setup(r => r.GetByFolderIdAsync(userId, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmarks);

        // Act
        var result = await _service.GetByFolderAsync(userId, null);

        // Assert
        result.Should().HaveCount(2);
    }

    #endregion

    #region GetFavoritesAsync Tests

    [Fact]
    public async Task GetFavoritesAsync_ReturnsOnlyFavorites()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var favorites = TestDataBuilder.CreateBookmarkList(userId, 2)
            .Select(b => { b.IsFavorite = true; return b; })
            .ToList();

        _mockBookmarkRepository.Setup(r => r.GetFavoritesAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(favorites);

        // Act
        var result = await _service.GetFavoritesAsync(userId);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(b => b.IsFavorite);
    }

    #endregion

    #region SearchAsync Tests

    [Fact]
    public async Task SearchAsync_ReturnsMatchingBookmarks()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var searchTerm = "test";
        var bookmarks = new List<Bookmark>
        {
            TestDataBuilder.CreateBookmark(userId, title: "Test Bookmark"),
            TestDataBuilder.CreateBookmark(userId, title: "Another Test")
        };

        _mockBookmarkRepository.Setup(r => r.SearchAsync(userId, searchTerm, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmarks);

        // Act
        var result = await _service.SearchAsync(userId, searchTerm);

        // Assert
        result.Should().HaveCount(2);
    }

    #endregion

    #region GetMostUsedAsync Tests

    [Fact]
    public async Task GetMostUsedAsync_ReturnsTopBookmarksByClickCount()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var bookmarks = new List<Bookmark>
        {
            TestDataBuilder.CreateBookmark(userId, clickCount: 100),
            TestDataBuilder.CreateBookmark(userId, clickCount: 50)
        };

        _mockBookmarkRepository.Setup(r => r.GetMostUsedAsync(userId, 10, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmarks);

        // Act
        var result = await _service.GetMostUsedAsync(userId, 10);

        // Assert
        result.Should().HaveCount(2);
        result.First().ClickCount.Should().Be(100);
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_CreatesBookmarkSuccessfully()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var dto = TestDataBuilder.CreateBookmarkDto(
            url: "https://example.com",
            title: "New Bookmark"
        );

        _mockBookmarkRepository.Setup(r => r.AddAsync(It.IsAny<Bookmark>(), It.IsAny<CancellationToken>()))
            .Returns<Bookmark, CancellationToken>((b, _) => Task.FromResult(b));
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.CreateAsync(userId, dto);

        // Assert
        result.Should().NotBeNull();
        result.Url.Should().Be(dto.Url);
        result.Title.Should().Be(dto.Title);
        result.IsFavorite.Should().BeFalse();
        result.ClickCount.Should().Be(0);

        _mockBookmarkRepository.Verify(r => r.AddAsync(It.IsAny<Bookmark>(), It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_CreatesTagsIfNotExist()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var newTag = TestDataBuilder.CreateTag(userId, name: "NewTag");
        Bookmark? capturedBookmark = null;
        var dto = TestDataBuilder.CreateBookmarkDto(
            tags: new List<string> { "NewTag" }
        );

        _mockTagRepository.Setup(r => r.GetByNameAsync(userId, "NewTag", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Tag?)null);
        _mockTagRepository.Setup(r => r.AddAsync(It.IsAny<Tag>(), It.IsAny<CancellationToken>()))
            .Returns<Tag, CancellationToken>((t, _) => {
                // Simulate what EF would do - assign an ID and return the tag
                t.Id = newTag.Id;
                return Task.FromResult(t);
            });
        _mockBookmarkRepository.Setup(r => r.AddAsync(It.IsAny<Bookmark>(), It.IsAny<CancellationToken>()))
            .Returns<Bookmark, CancellationToken>((b, _) => {
                capturedBookmark = b;
                return Task.FromResult(b);
            });
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns<CancellationToken>(_ => {
                // Populate the Tag navigation property in BookmarkTags after all tags are added
                if (capturedBookmark != null)
                {
                    foreach (var bt in capturedBookmark.BookmarkTags)
                    {
                        bt.Tag = newTag;
                    }
                }
                return Task.FromResult(1);
            });

        // Act
        var result = await _service.CreateAsync(userId, dto);

        // Assert
        _mockTagRepository.Verify(r => r.AddAsync(It.Is<Tag>(t => t.Name == "NewTag"), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_UsesExistingTags()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var existingTag = TestDataBuilder.CreateTag(userId, name: "ExistingTag");
        Bookmark? capturedBookmark = null;
        var dto = TestDataBuilder.CreateBookmarkDto(
            tags: new List<string> { "ExistingTag" }
        );

        _mockTagRepository.Setup(r => r.GetByNameAsync(userId, "ExistingTag", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingTag);
        _mockBookmarkRepository.Setup(r => r.AddAsync(It.IsAny<Bookmark>(), It.IsAny<CancellationToken>()))
            .Returns<Bookmark, CancellationToken>((b, _) => {
                capturedBookmark = b;
                return Task.FromResult(b);
            });
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Returns<CancellationToken>(_ => {
                // Populate the Tag navigation property in BookmarkTags after all tags are added
                if (capturedBookmark != null)
                {
                    foreach (var bt in capturedBookmark.BookmarkTags)
                    {
                        bt.Tag = existingTag;
                    }
                }
                return Task.FromResult(1);
            });

        // Act
        var result = await _service.CreateAsync(userId, dto);

        // Assert
        _mockTagRepository.Verify(r => r.AddAsync(It.IsAny<Tag>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_UpdatesBookmarkSuccessfully()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var bookmark = TestDataBuilder.CreateBookmark(userId);
        var dto = TestDataBuilder.CreateUpdateBookmarkDto(
            title: "Updated Title",
            isFavorite: true
        );

        _mockBookmarkRepository.Setup(r => r.GetByIdAsync(bookmark.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmark);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateAsync(userId, bookmark.Id, dto);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be("Updated Title");
        result.IsFavorite.Should().BeTrue();
    }

    [Fact]
    public async Task UpdateAsync_ThrowsException_WhenBookmarkNotFound()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var id = Guid.NewGuid();
        var dto = TestDataBuilder.CreateUpdateBookmarkDto();

        _mockBookmarkRepository.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Bookmark?)null);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.UpdateAsync(userId, id, dto));
    }

    [Fact]
    public async Task UpdateAsync_ThrowsException_WhenUserDoesNotOwnBookmark()
    {
        // Arrange
        var bookmark = TestDataBuilder.CreateBookmark(TestDataBuilder.OtherUserId);
        var dto = TestDataBuilder.CreateUpdateBookmarkDto();

        _mockBookmarkRepository.Setup(r => r.GetByIdAsync(bookmark.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmark);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.UpdateAsync(TestDataBuilder.DefaultUserId, bookmark.Id, dto));
    }

    [Fact]
    public async Task UpdateAsync_OnlyUpdatesProvidedFields()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var bookmark = TestDataBuilder.CreateBookmark(userId, title: "Original Title", url: "https://original.com");
        var dto = new UpdateBookmarkDto(null, "New Title", null, null, null, null, null);

        _mockBookmarkRepository.Setup(r => r.GetByIdAsync(bookmark.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmark);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.UpdateAsync(userId, bookmark.Id, dto);

        // Assert
        result.Title.Should().Be("New Title");
        result.Url.Should().Be("https://original.com"); // Should remain unchanged
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_DeletesBookmarkSuccessfully()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var bookmark = TestDataBuilder.CreateBookmark(userId);

        _mockBookmarkRepository.Setup(r => r.GetByIdAsync(bookmark.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmark);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _service.DeleteAsync(userId, bookmark.Id);

        // Assert
        _mockBookmarkRepository.Verify(r => r.DeleteAsync(bookmark, It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ThrowsException_WhenBookmarkNotFound()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var id = Guid.NewGuid();

        _mockBookmarkRepository.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Bookmark?)null);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.DeleteAsync(userId, id));
    }

    [Fact]
    public async Task DeleteAsync_ThrowsException_WhenUserDoesNotOwnBookmark()
    {
        // Arrange
        var bookmark = TestDataBuilder.CreateBookmark(TestDataBuilder.OtherUserId);

        _mockBookmarkRepository.Setup(r => r.GetByIdAsync(bookmark.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmark);

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(
            () => _service.DeleteAsync(TestDataBuilder.DefaultUserId, bookmark.Id));
    }

    #endregion

    #region CheckDuplicateAsync Tests

    [Fact]
    public async Task CheckDuplicateAsync_ReturnsTrue_WhenDuplicateExists()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var url = "https://example.com";
        var existingBookmark = TestDataBuilder.CreateBookmark(userId, url: url);

        _mockBookmarkRepository.Setup(r => r.GetByUrlAsync(userId, url, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingBookmark);

        // Act
        var result = await _service.CheckDuplicateAsync(userId, url);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task CheckDuplicateAsync_ReturnsFalse_WhenNoDuplicate()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var url = "https://new-url.com";

        _mockBookmarkRepository.Setup(r => r.GetByUrlAsync(userId, url, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Bookmark?)null);

        // Act
        var result = await _service.CheckDuplicateAsync(userId, url);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region TrackClickAsync Tests

    [Fact]
    public async Task TrackClickAsync_IncrementsClickCount()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var bookmark = TestDataBuilder.CreateBookmark(userId);

        _mockBookmarkRepository.Setup(r => r.GetByIdAsync(bookmark.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmark);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _service.TrackClickAsync(userId, bookmark.Id);

        // Assert
        _mockBookmarkRepository.Verify(r => r.IncrementClickCountAsync(bookmark.Id, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task TrackClickAsync_DoesNothing_WhenBookmarkNotFound()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var id = Guid.NewGuid();

        _mockBookmarkRepository.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Bookmark?)null);

        // Act
        await _service.TrackClickAsync(userId, id);

        // Assert
        _mockBookmarkRepository.Verify(r => r.IncrementClickCountAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task TrackClickAsync_DoesNothing_WhenUserDoesNotOwnBookmark()
    {
        // Arrange
        var bookmark = TestDataBuilder.CreateBookmark(TestDataBuilder.OtherUserId);

        _mockBookmarkRepository.Setup(r => r.GetByIdAsync(bookmark.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmark);

        // Act
        await _service.TrackClickAsync(TestDataBuilder.DefaultUserId, bookmark.Id);

        // Assert
        _mockBookmarkRepository.Verify(r => r.IncrementClickCountAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    #endregion

    #region ReorderAsync Tests

    [Fact]
    public async Task ReorderAsync_UpdatesSortOrders()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var dto = new ReorderBookmarksDto(new List<BookmarkOrderItem>
        {
            new BookmarkOrderItem(Guid.NewGuid(), 0),
            new BookmarkOrderItem(Guid.NewGuid(), 1),
            new BookmarkOrderItem(Guid.NewGuid(), 2)
        });

        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _service.ReorderAsync(userId, dto);

        // Assert
        _mockBookmarkRepository.Verify(
            r => r.UpdateSortOrderAsync(It.IsAny<IEnumerable<(Guid, int)>>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    #endregion

    #region BulkImportAsync Tests

    [Fact]
    public async Task BulkImportAsync_ImportsNonDuplicateBookmarks()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var dto = new BulkImportDto(new List<CreateBookmarkDto>
        {
            TestDataBuilder.CreateBookmarkDto(url: "https://new1.com"),
            TestDataBuilder.CreateBookmarkDto(url: "https://new2.com"),
            TestDataBuilder.CreateBookmarkDto(url: "https://existing.com")
        });

        _mockBookmarkRepository.Setup(r => r.GetByUrlAsync(userId, "https://new1.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Bookmark?)null);
        _mockBookmarkRepository.Setup(r => r.GetByUrlAsync(userId, "https://new2.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Bookmark?)null);
        _mockBookmarkRepository.Setup(r => r.GetByUrlAsync(userId, "https://existing.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(TestDataBuilder.CreateBookmark(userId, url: "https://existing.com"));
        _mockBookmarkRepository.Setup(r => r.AddAsync(It.IsAny<Bookmark>(), It.IsAny<CancellationToken>()))
            .Returns<Bookmark, CancellationToken>((b, _) => Task.FromResult(b));
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _service.BulkImportAsync(userId, dto);

        // Assert
        result.Should().HaveCount(2);
        result.Should().OnlyContain(b => b.Url != "https://existing.com");
    }

    #endregion

    #region ExportAsync Tests

    [Fact]
    public async Task ExportAsync_ReturnsAllUserData()
    {
        // Arrange
        var userId = TestDataBuilder.DefaultUserId;
        var bookmarks = TestDataBuilder.CreateBookmarkList(userId, 2);
        var folders = TestDataBuilder.CreateFolderList(userId, 2);
        var tags = TestDataBuilder.CreateTagList(userId, 2);

        _mockBookmarkRepository.Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookmarks);
        _mockFolderRepository.Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(folders);
        _mockTagRepository.Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(tags);

        // Act
        var result = await _service.ExportAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.Bookmarks.Should().HaveCount(2);
        result.Folders.Should().HaveCount(2);
        result.Tags.Should().HaveCount(2);
        result.ExportedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    #endregion
}

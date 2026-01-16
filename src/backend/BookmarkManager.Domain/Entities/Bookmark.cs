namespace BookmarkManager.Domain.Entities;

public class Bookmark : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Favicon { get; set; }
    public bool IsFavorite { get; set; }
    public int ClickCount { get; set; }
    public int SortOrder { get; set; }

    // Navigation properties
    public Guid? FolderId { get; set; }
    public Folder? Folder { get; set; }

    public ICollection<BookmarkTag> BookmarkTags { get; set; } = new List<BookmarkTag>();
}

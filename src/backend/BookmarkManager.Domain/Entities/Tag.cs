namespace BookmarkManager.Domain.Entities;

public class Tag : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }

    // Navigation properties
    public ICollection<BookmarkTag> BookmarkTags { get; set; } = new List<BookmarkTag>();
}

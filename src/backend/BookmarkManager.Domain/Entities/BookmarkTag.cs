namespace BookmarkManager.Domain.Entities;

// Join table for many-to-many relationship between Bookmarks and Tags
public class BookmarkTag
{
    public Guid BookmarkId { get; set; }
    public Bookmark Bookmark { get; set; } = null!;

    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}

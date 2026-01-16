namespace BookmarkManager.Domain.Entities;

public class Folder : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Color { get; set; }
    public string? Icon { get; set; }
    public int SortOrder { get; set; }

    // Self-referencing for nested folders
    public Guid? ParentFolderId { get; set; }
    public Folder? ParentFolder { get; set; }

    // Navigation properties
    public ICollection<Folder> SubFolders { get; set; } = new List<Folder>();
    public ICollection<Bookmark> Bookmarks { get; set; } = new List<Bookmark>();
}

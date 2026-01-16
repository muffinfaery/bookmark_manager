using BookmarkManager.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BookmarkManager.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Bookmark> Bookmarks => Set<Bookmark>();
    public DbSet<Folder> Folders => Set<Folder>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<BookmarkTag> BookmarkTags => Set<BookmarkTag>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Bookmark configuration
        modelBuilder.Entity<Bookmark>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Url).IsRequired().HasMaxLength(2048);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Favicon).HasMaxLength(2048);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(255);

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.UserId, e.Url }).IsUnique();

            entity.HasOne(e => e.Folder)
                .WithMany(f => f.Bookmarks)
                .HasForeignKey(e => e.FolderId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Folder configuration
        modelBuilder.Entity<Folder>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Color).HasMaxLength(50);
            entity.Property(e => e.Icon).HasMaxLength(100);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(255);

            entity.HasIndex(e => e.UserId);

            entity.HasOne(e => e.ParentFolder)
                .WithMany(f => f.SubFolders)
                .HasForeignKey(e => e.ParentFolderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Tag configuration
        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Color).HasMaxLength(50);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(255);

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.UserId, e.Name }).IsUnique();
        });

        // BookmarkTag configuration (many-to-many join table)
        modelBuilder.Entity<BookmarkTag>(entity =>
        {
            entity.HasKey(e => new { e.BookmarkId, e.TagId });

            entity.HasOne(e => e.Bookmark)
                .WithMany(b => b.BookmarkTags)
                .HasForeignKey(e => e.BookmarkId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Tag)
                .WithMany(t => t.BookmarkTags)
                .HasForeignKey(e => e.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();
        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}

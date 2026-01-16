using BookmarkManager.Application.Services.Interfaces;
using BookmarkManager.Domain.Interfaces;
using BookmarkManager.Infrastructure.Data;
using BookmarkManager.Infrastructure.Repositories;
using BookmarkManager.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BookmarkManager.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // Repositories
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IBookmarkRepository, BookmarkRepository>();
        services.AddScoped<IFolderRepository, FolderRepository>();
        services.AddScoped<ITagRepository, TagRepository>();

        // External services
        services.AddHttpClient<IMetadataService, MetadataService>();

        return services;
    }
}

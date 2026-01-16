using BookmarkManager.Application.Services.Implementations;
using BookmarkManager.Application.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace BookmarkManager.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IBookmarkService, BookmarkService>();
        services.AddScoped<IFolderService, FolderService>();
        services.AddScoped<ITagService, TagService>();

        return services;
    }
}

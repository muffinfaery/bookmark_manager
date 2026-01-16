# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files
COPY ["BookmarkManager.Domain/BookmarkManager.Domain.csproj", "BookmarkManager.Domain/"]
COPY ["BookmarkManager.Application/BookmarkManager.Application.csproj", "BookmarkManager.Application/"]
COPY ["BookmarkManager.Infrastructure/BookmarkManager.Infrastructure.csproj", "BookmarkManager.Infrastructure/"]
COPY ["BookmarkManager.Api/BookmarkManager.Api.csproj", "BookmarkManager.Api/"]

# Restore dependencies
RUN dotnet restore "BookmarkManager.Api/BookmarkManager.Api.csproj"

# Copy all source code
COPY . .

# Build the application
WORKDIR "/src/BookmarkManager.Api"
RUN dotnet build "BookmarkManager.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "BookmarkManager.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 80

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BookmarkManager.Api.dll"]

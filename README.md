# Bookmark Manager

A full-stack bookmark management application with local storage fallback and cloud sync capabilities. Features authentication via Clerk, comprehensive test suites, and PWA support.

## Features

### Core Features
- Add, edit, and delete bookmarks
- Auto-fetch page title and favicon from URLs
- Organize bookmarks into folders
- Tag system for flexible organization
- Search and filter by title, tag, or folder
- Favorites/pin functionality

### Enhanced Features
- Drag-and-drop reordering
- Import/export bookmarks as JSON
- Duplicate link detection
- Grid view vs. list view toggle
- Click tracking for most-used bookmarks
- Dark/light theme toggle
- PWA support - installable on mobile devices

### Data Storage
- **Local Storage**: Works without an account, data stored in browser
- **Cloud Sync**: Sign in with Clerk to sync across devices
- **Migration**: Seamless transfer of demo data when signing up

## Tech Stack

### Backend
- .NET 8.0 with Clean Architecture
- PostgreSQL database
- Entity Framework Core
- JWT authentication via Clerk
- **Testing**: xUnit + Moq + FluentAssertions

### Frontend
- Next.js 16 (React 19)
- Material-UI (MUI) v6
- Clerk for authentication
- TypeScript
- Feature-based component organization with barrel exports
- **Testing**: Vitest + React Testing Library

## Project Structure

```
bookmark_manager/
├── src/
│   ├── backend/
│   │   ├── BookmarkManager.Domain/         # Entities and interfaces
│   │   ├── BookmarkManager.Application/    # Services and DTOs
│   │   ├── BookmarkManager.Infrastructure/ # EF Core, repositories
│   │   ├── BookmarkManager.Api/            # Controllers and config
│   │   └── BookmarkManager.Tests/          # xUnit test project
│   │       ├── BookmarkServiceTests.cs
│   │       ├── FolderServiceTests.cs
│   │       ├── TagServiceTests.cs
│   │       ├── BookmarksControllerTests.cs
│   │       └── TestDataBuilder.cs
│   └── frontend/
│       ├── app/                            # Next.js pages
│       ├── components/                     # Feature-based components
│       │   ├── bookmarks/                  # Bookmark components
│       │   ├── folders/                    # Folder components
│       │   ├── tags/                       # Tag components
│       │   ├── layout/                     # Layout components
│       │   ├── common/                     # Shared components
│       │   └── index.ts                    # Barrel exports
│       ├── hooks/                          # Custom hooks
│       │   ├── useBookmarks.ts
│       │   ├── useFolders.ts
│       │   ├── useTags.ts
│       │   └── index.ts
│       ├── lib/                            # API clients and utilities
│       ├── types/                          # TypeScript types
│       ├── __tests__/                      # Component tests
│       └── public/                         # Static assets and PWA icons
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- A Clerk account (for authentication)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/muffinfaery/bookmark_manager.git
cd bookmark_manager
```

2. Create a `.env` file from the example:
```bash
cp .env.example .env
```

3. Add your Clerk credentials to `.env`:
```
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_DOMAIN=your-app.clerk.accounts.dev
```

4. Start the application:
```bash
docker-compose up -d
```

5. Access the application:
- Frontend: http://localhost:3003
- API: http://localhost:5001
- API Docs: http://localhost:5001/swagger

## Testing

### Backend Tests

The backend includes comprehensive unit tests using xUnit, Moq, and FluentAssertions:

```bash
cd src/backend

# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

| Test File | Tests | Coverage |
|-----------|-------|----------|
| BookmarkServiceTests | 12 | CRUD operations, favorites, click tracking |
| FolderServiceTests | 8 | Folder management, hierarchy |
| TagServiceTests | 6 | Tag operations |
| BookmarksControllerTests | 10 | API endpoints, authorization |

### Frontend Tests

The frontend includes component tests using Vitest and React Testing Library:

```bash
cd src/frontend

# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

| Test File | Tests | Coverage |
|-----------|-------|----------|
| BookmarkCard | 8 | Rendering, actions, favorites |
| BookmarkForm | 6 | Form validation, submission |
| FolderTree | 5 | Tree rendering, selection |
| TagSelector | 4 | Tag selection, creation |
| SearchBar | 5 | Search input, filtering |

## API Endpoints

### Bookmarks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookmarks` | Get all bookmarks |
| POST | `/api/bookmarks` | Create bookmark |
| PUT | `/api/bookmarks/{id}` | Update bookmark |
| DELETE | `/api/bookmarks/{id}` | Delete bookmark |
| GET | `/api/bookmarks/search?q=query` | Search bookmarks |
| GET | `/api/bookmarks/favorites` | Get favorites |
| POST | `/api/bookmarks/{id}/click` | Track click |
| POST | `/api/bookmarks/reorder` | Reorder bookmarks |
| GET | `/api/bookmarks/export` | Export all data |
| POST | `/api/bookmarks/import` | Import bookmarks |

### Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/folders` | Get all folders |
| POST | `/api/folders` | Create folder |
| PUT | `/api/folders/{id}` | Update folder |
| DELETE | `/api/folders/{id}` | Delete folder |

### Tags
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tags` | Get all tags |
| POST | `/api/tags` | Create tag |
| PUT | `/api/tags/{id}` | Update tag |
| DELETE | `/api/tags/{id}` | Delete tag |

### Metadata
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/metadata/fetch` | Fetch URL metadata |

## PWA Support

The Bookmark Manager is installable as a Progressive Web App:

- Custom bookmark-themed SVG icons
- Web manifest with standalone display
- Install prompt for supported browsers
- Works offline with localStorage

## Architecture Highlights

### Dual Storage Mode
- **Anonymous users**: Full functionality with localStorage
- **Authenticated users**: Cloud sync with PostgreSQL
- **Migration**: One-click transfer of demo data on sign-up

### Clean Architecture
- Domain layer with entities and interfaces
- Application layer with services and DTOs
- Infrastructure layer with EF Core repositories
- API layer with controllers and middleware

## License

MIT

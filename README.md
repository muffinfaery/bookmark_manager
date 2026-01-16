# Bookmark Manager

A full-stack bookmark management application with local storage fallback and cloud sync capabilities.

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

### Data Storage
- **Local Storage**: Works without an account, data stored in browser
- **Cloud Sync**: Sign in with Clerk to sync across devices

## Tech Stack

### Backend
- .NET 8.0 with Onion Architecture
- PostgreSQL database
- Entity Framework Core
- JWT authentication via Clerk

### Frontend
- Next.js 14 (React)
- Material-UI (MUI)
- Clerk for authentication
- TypeScript

## Getting Started

### Prerequisites
- Docker and Docker Compose
- A Clerk account (for authentication)

### Setup

1. Clone the repository:
```bash
git clone <repo-url>
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
- Frontend: http://localhost:3002
- API: http://localhost:5000
- API Docs: http://localhost:5000/swagger

## Project Structure

```
bookmark_manager/
├── src/
│   ├── backend/
│   │   ├── BookmarkManager.Domain/       # Entities and interfaces
│   │   ├── BookmarkManager.Application/  # Services and DTOs
│   │   ├── BookmarkManager.Infrastructure/ # EF Core, repositories
│   │   └── BookmarkManager.Api/          # Controllers and config
│   └── frontend/
│       ├── app/                          # Next.js pages
│       ├── components/                   # React components
│       ├── hooks/                        # Custom hooks
│       ├── lib/                          # API and utilities
│       └── types/                        # TypeScript types
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Bookmarks
- `GET /api/bookmarks` - Get all bookmarks
- `POST /api/bookmarks` - Create bookmark
- `PUT /api/bookmarks/{id}` - Update bookmark
- `DELETE /api/bookmarks/{id}` - Delete bookmark
- `GET /api/bookmarks/search?q=query` - Search bookmarks
- `GET /api/bookmarks/favorites` - Get favorites
- `POST /api/bookmarks/{id}/click` - Track click
- `POST /api/bookmarks/reorder` - Reorder bookmarks
- `GET /api/bookmarks/export` - Export all data
- `POST /api/bookmarks/import` - Import bookmarks

### Folders
- `GET /api/folders` - Get all folders
- `POST /api/folders` - Create folder
- `PUT /api/folders/{id}` - Update folder
- `DELETE /api/folders/{id}` - Delete folder

### Tags
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create tag
- `PUT /api/tags/{id}` - Update tag
- `DELETE /api/tags/{id}` - Delete tag

### Metadata
- `POST /api/metadata/fetch` - Fetch URL metadata

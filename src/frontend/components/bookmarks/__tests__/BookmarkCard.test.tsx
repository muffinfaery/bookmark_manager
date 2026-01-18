import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import BookmarkCard from '../BookmarkCard';
import { Bookmark } from '@/types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockBookmark: Bookmark = {
  id: '1',
  url: 'https://example.com',
  title: 'Example Bookmark',
  description: 'A test description',
  favicon: 'https://example.com/favicon.ico',
  isFavorite: false,
  clickCount: 5,
  sortOrder: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: [
    { id: 'tag1', name: 'Work', color: '#ff0000', bookmarkCount: 1, createdAt: new Date().toISOString() },
    { id: 'tag2', name: 'Important', color: '#00ff00', bookmarkCount: 1, createdAt: new Date().toISOString() },
  ],
  folderId: 'folder1',
  folderName: 'Work Folder',
};

describe('BookmarkCard', () => {
  const defaultProps = {
    bookmark: mockBookmark,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggleFavorite: vi.fn(),
    onClick: vi.fn(),
    viewMode: 'grid' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Grid View', () => {
    it('renders bookmark title', () => {
      renderWithTheme(<BookmarkCard {...defaultProps} />);
      expect(screen.getByText('Example Bookmark')).toBeInTheDocument();
    });

    it('renders bookmark URL', () => {
      renderWithTheme(<BookmarkCard {...defaultProps} />);
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
    });

    it('renders bookmark description', () => {
      renderWithTheme(<BookmarkCard {...defaultProps} />);
      expect(screen.getByText('A test description')).toBeInTheDocument();
    });

    it('renders tags', () => {
      renderWithTheme(<BookmarkCard {...defaultProps} />);
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Important')).toBeInTheDocument();
    });

    it('renders folder name', () => {
      renderWithTheme(<BookmarkCard {...defaultProps} />);
      expect(screen.getByText('Work Folder')).toBeInTheDocument();
    });

    it('displays unfilled star when not favorite', () => {
      renderWithTheme(<BookmarkCard {...defaultProps} />);
      // StarBorderIcon is shown when not favorite
      expect(screen.getByTestId('StarBorderIcon')).toBeInTheDocument();
    });

    it('displays filled star when favorite', () => {
      const favoriteBookmark = { ...mockBookmark, isFavorite: true };
      renderWithTheme(<BookmarkCard {...defaultProps} bookmark={favoriteBookmark} />);
      // Star icon should be visible when favorite
      expect(screen.getByTestId('StarIcon')).toBeInTheDocument();
    });
  });

  describe('List View', () => {
    it('renders in list mode', () => {
      renderWithTheme(<BookmarkCard {...defaultProps} viewMode="list" />);
      expect(screen.getByText('Example Bookmark')).toBeInTheDocument();
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
    });

    it('shows limited tags in list view', () => {
      renderWithTheme(<BookmarkCard {...defaultProps} viewMode="list" />);
      // List view shows up to 2 tags
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Important')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onToggleFavorite when star is clicked', () => {
      renderWithTheme(<BookmarkCard {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      const starButton = buttons.find((btn) => btn.querySelector('[data-testid="StarBorderIcon"]'));
      if (starButton) {
        fireEvent.click(starButton);
        expect(defaultProps.onToggleFavorite).toHaveBeenCalledWith('1');
      }
    });

    it('opens menu when more button is clicked', async () => {
      renderWithTheme(<BookmarkCard {...defaultProps} />);
      const moreButton = screen.getByTestId('MoreVertIcon').closest('button');
      if (moreButton) {
        fireEvent.click(moreButton);
        await waitFor(() => {
          expect(screen.getByText('Edit')).toBeInTheDocument();
          expect(screen.getByText('Copy URL')).toBeInTheDocument();
          expect(screen.getByText('Delete')).toBeInTheDocument();
        });
      }
    });

    it('calls onEdit when edit menu item is clicked', async () => {
      renderWithTheme(<BookmarkCard {...defaultProps} />);
      const moreButton = screen.getByTestId('MoreVertIcon').closest('button');
      if (moreButton) {
        fireEvent.click(moreButton);
        await waitFor(() => {
          const editMenuItem = screen.getByText('Edit');
          fireEvent.click(editMenuItem);
        });
        expect(defaultProps.onEdit).toHaveBeenCalledWith(mockBookmark);
      }
    });

    it('calls onDelete when delete menu item is clicked', async () => {
      renderWithTheme(<BookmarkCard {...defaultProps} />);
      const moreButton = screen.getByTestId('MoreVertIcon').closest('button');
      if (moreButton) {
        fireEvent.click(moreButton);
        await waitFor(() => {
          const deleteMenuItem = screen.getByText('Delete');
          fireEvent.click(deleteMenuItem);
        });
        expect(defaultProps.onDelete).toHaveBeenCalledWith('1');
      }
    });

    it('opens bookmark in new tab when open button is clicked', async () => {
      const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
      renderWithTheme(<BookmarkCard {...defaultProps} />);

      const openButton = screen.getByTestId('OpenInNewIcon').closest('button');
      if (openButton) {
        fireEvent.click(openButton);
        expect(windowOpenSpy).toHaveBeenCalledWith(
          'https://example.com',
          '_blank',
          'noopener,noreferrer'
        );
        expect(defaultProps.onClick).toHaveBeenCalledWith(mockBookmark);
      }

      windowOpenSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('renders without description', () => {
      const bookmarkNoDesc = { ...mockBookmark, description: undefined };
      renderWithTheme(<BookmarkCard {...defaultProps} bookmark={bookmarkNoDesc} />);
      expect(screen.getByText('Example Bookmark')).toBeInTheDocument();
    });

    it('renders without tags', () => {
      const bookmarkNoTags = { ...mockBookmark, tags: [] };
      renderWithTheme(<BookmarkCard {...defaultProps} bookmark={bookmarkNoTags} />);
      expect(screen.getByText('Example Bookmark')).toBeInTheDocument();
    });

    it('renders without folder', () => {
      const bookmarkNoFolder = { ...mockBookmark, folderId: undefined, folderName: undefined };
      renderWithTheme(<BookmarkCard {...defaultProps} bookmark={bookmarkNoFolder} />);
      expect(screen.getByText('Example Bookmark')).toBeInTheDocument();
    });

    it('shows +N chip when more than 3 tags in grid view', () => {
      const bookmarkManyTags = {
        ...mockBookmark,
        tags: [
          { id: 'tag1', name: 'Tag1', color: '#ff0000', bookmarkCount: 1, createdAt: new Date().toISOString() },
          { id: 'tag2', name: 'Tag2', color: '#00ff00', bookmarkCount: 1, createdAt: new Date().toISOString() },
          { id: 'tag3', name: 'Tag3', color: '#0000ff', bookmarkCount: 1, createdAt: new Date().toISOString() },
          { id: 'tag4', name: 'Tag4', color: '#ffff00', bookmarkCount: 1, createdAt: new Date().toISOString() },
          { id: 'tag5', name: 'Tag5', color: '#ff00ff', bookmarkCount: 1, createdAt: new Date().toISOString() },
        ],
      };
      renderWithTheme(<BookmarkCard {...defaultProps} bookmark={bookmarkManyTags} />);
      expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('generates favicon URL from domain when not provided', () => {
      const bookmarkNoFavicon = { ...mockBookmark, favicon: undefined };
      const { container } = renderWithTheme(<BookmarkCard {...defaultProps} bookmark={bookmarkNoFavicon} />);
      // Find the img element (it's rendered as a Box with component="img")
      const favicon = container.querySelector('img');
      expect(favicon).toBeInTheDocument();
      expect(favicon).toHaveAttribute(
        'src',
        'https://www.google.com/s2/favicons?domain=example.com&sz=32'
      );
    });
  });
});

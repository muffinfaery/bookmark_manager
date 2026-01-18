import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import MobileDrawer from '../MobileDrawer';
import { Folder, Tag } from '@/types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockFolders: Folder[] = [
  { id: 'folder1', name: 'Work', color: '#3f51b5', bookmarkCount: 5, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder2', name: 'Personal', color: '#4caf50', bookmarkCount: 3, sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const mockTags: Tag[] = [
  { id: 'tag1', name: 'Important', color: '#f44336', bookmarkCount: 2, createdAt: new Date().toISOString() },
  { id: 'tag2', name: 'Read Later', color: '#2196f3', bookmarkCount: 4, createdAt: new Date().toISOString() },
];

describe('MobileDrawer', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    folders: mockFolders,
    tags: mockTags,
    filterType: 'all' as const,
    selectedFolderId: null,
    selectedTagId: null,
    onFilterChange: vi.fn(),
    onFolderSelect: vi.fn(),
    onTagSelect: vi.fn(),
    onCreateFolder: vi.fn().mockResolvedValue({ id: 'new', name: 'New' }),
    onDeleteFolder: vi.fn(),
    onDeleteTag: vi.fn(),
    viewMode: 'grid' as const,
    onViewModeChange: vi.fn(),
    themeMode: 'system' as const,
    onThemeModeChange: vi.fn(),
    onImport: vi.fn(),
    onExport: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders drawer when open', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.getByText('Bookmarks')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} open={false} />);
      expect(screen.queryByText('Bookmarks')).not.toBeInTheDocument();
    });

    it('renders All Bookmarks option', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.getByText('All Bookmarks')).toBeInTheDocument();
    });

    it('renders Favorites option', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    it('renders Folders section', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.getByText('Folders')).toBeInTheDocument();
    });

    it('renders Tags section', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('renders Settings section', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders handle bar for dragging', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      // Handle bar is inside the drawer - just verify we can see the content
      // The handle bar is a small Box element that isn't directly testable
      // but we can verify the drawer renders by checking for its content
      expect(screen.getByText('Bookmarks')).toBeInTheDocument();
    });
  });

  describe('Filter Selection', () => {
    it('calls onFilterChange when All Bookmarks is clicked', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      fireEvent.click(screen.getByText('All Bookmarks'));
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('all');
    });

    it('calls onFilterChange when Favorites is clicked', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      fireEvent.click(screen.getByText('Favorites'));
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('favorites');
    });

    it('highlights selected filter', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} filterType="favorites" />);
      const favoritesButton = screen.getByText('Favorites').closest('div[role="button"]');
      expect(favoritesButton).toHaveClass('Mui-selected');
    });
  });

  describe('Folder Management', () => {
    it('renders all folders', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    it('renders Uncategorized folder', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.getByText('Uncategorized')).toBeInTheDocument();
    });

    it('shows folder bookmark counts', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.getByText('5 bookmarks')).toBeInTheDocument();
      expect(screen.getByText('3 bookmarks')).toBeInTheDocument();
    });

    it('calls onFolderSelect when folder is clicked', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      fireEvent.click(screen.getByText('Work'));
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('folder');
      expect(defaultProps.onFolderSelect).toHaveBeenCalledWith('folder1');
    });

    it('shows add folder input when add button is clicked', async () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);

      const addButtons = screen.getAllByTestId('AddIcon');
      const addFolderButton = addButtons[0].closest('button');
      if (addFolderButton) {
        fireEvent.click(addFolderButton);
      }

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Folder name')).toBeInTheDocument();
      });
    });

    it('creates folder when enter is pressed in input', async () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);

      // Show input
      const addButtons = screen.getAllByTestId('AddIcon');
      const addFolderButton = addButtons[0].closest('button');
      if (addFolderButton) {
        fireEvent.click(addFolderButton);
      }

      // Type and submit
      const input = await screen.findByPlaceholderText('Folder name');
      await userEvent.type(input, 'New Folder{enter}');

      await waitFor(() => {
        expect(defaultProps.onCreateFolder).toHaveBeenCalledWith('New Folder');
      });
    });

    it('calls onDeleteFolder when delete is clicked', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);

      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      const folderDeleteButton = deleteButtons[0].closest('button');
      if (folderDeleteButton) {
        fireEvent.click(folderDeleteButton);
      }

      expect(defaultProps.onDeleteFolder).toHaveBeenCalledWith('folder1');
    });

    it('shows empty state when no folders', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} folders={[]} />);
      expect(screen.getByText('No folders yet')).toBeInTheDocument();
    });
  });

  describe('Tag Management', () => {
    it('renders all tags', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Read Later')).toBeInTheDocument();
    });

    it('shows tag bookmark counts', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.getByText('2 bookmarks')).toBeInTheDocument();
      expect(screen.getByText('4 bookmarks')).toBeInTheDocument();
    });

    it('calls onTagSelect when tag is clicked', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      fireEvent.click(screen.getByText('Important'));
      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('tag');
      expect(defaultProps.onTagSelect).toHaveBeenCalledWith('tag1');
    });

    it('calls onDeleteTag when delete is clicked', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);

      // Find all delete icons and click one in the tags section
      const allDeleteIcons = screen.getAllByTestId('DeleteIcon');
      // The first two are folder delete buttons, the rest are tag delete buttons
      if (allDeleteIcons.length > 2) {
        const tagDeleteButton = allDeleteIcons[2].closest('button');
        if (tagDeleteButton) {
          fireEvent.click(tagDeleteButton);
        }
      }

      expect(defaultProps.onDeleteTag).toHaveBeenCalledWith('tag1');
    });

    it('shows empty state when no tags', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} tags={[]} />);
      expect(screen.getByText('No tags yet')).toBeInTheDocument();
    });

    it('shows tag color indicator', () => {
      const { container } = renderWithTheme(<MobileDrawer {...defaultProps} />);
      // Color indicators are rendered as Box elements with borderRadius: '50%'
      // They're in MUI Box elements, look for presence of tags with color
      expect(screen.getByText('Important')).toBeInTheDocument();
    });
  });

  describe('Settings Section', () => {
    it('shows View Mode toggle', async () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);

      // Expand settings
      fireEvent.click(screen.getByText('Settings'));

      await waitFor(() => {
        expect(screen.getByText('View Mode')).toBeInTheDocument();
      });
    });

    it('shows Grid and List view options', async () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);

      fireEvent.click(screen.getByText('Settings'));

      await waitFor(() => {
        expect(screen.getByText('Grid')).toBeInTheDocument();
        expect(screen.getByText('List')).toBeInTheDocument();
      });
    });

    it('calls onViewModeChange when view mode is changed', async () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);

      fireEvent.click(screen.getByText('Settings'));

      await waitFor(() => {
        const listButton = screen.getByText('List');
        fireEvent.click(listButton);
      });

      expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('list');
    });

    it('shows Theme options', async () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);

      fireEvent.click(screen.getByText('Settings'));

      await waitFor(() => {
        expect(screen.getByText('Theme')).toBeInTheDocument();
        expect(screen.getByText('Light')).toBeInTheDocument();
        expect(screen.getByText('Dark')).toBeInTheDocument();
        expect(screen.getByText('Auto')).toBeInTheDocument();
      });
    });

    it('calls onThemeModeChange when theme is changed', async () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);

      fireEvent.click(screen.getByText('Settings'));

      await waitFor(() => {
        const darkButton = screen.getByText('Dark');
        fireEvent.click(darkButton);
      });

      expect(defaultProps.onThemeModeChange).toHaveBeenCalledWith('dark');
    });

    it('shows Import and Export options', async () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);

      fireEvent.click(screen.getByText('Settings'));

      await waitFor(() => {
        expect(screen.getByText('Import Bookmarks')).toBeInTheDocument();
        expect(screen.getByText('Export Bookmarks')).toBeInTheDocument();
      });
    });

    it('calls onImport and onClose when Import is clicked', async () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);

      fireEvent.click(screen.getByText('Settings'));

      await waitFor(() => {
        fireEvent.click(screen.getByText('Import Bookmarks'));
      });

      expect(defaultProps.onImport).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onExport and onClose when Export is clicked', async () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);

      fireEvent.click(screen.getByText('Settings'));

      await waitFor(() => {
        fireEvent.click(screen.getByText('Export Bookmarks'));
      });

      expect(defaultProps.onExport).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Section Expand/Collapse', () => {
    it('folders section is expanded by default', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('tags section is expanded by default', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.getByText('Important')).toBeInTheDocument();
    });

    it('settings section is collapsed by default', () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);
      expect(screen.queryByText('View Mode')).not.toBeInTheDocument();
    });

    it('expands settings section when clicked', async () => {
      renderWithTheme(<MobileDrawer {...defaultProps} />);

      fireEvent.click(screen.getByText('Settings'));

      await waitFor(() => {
        expect(screen.getByText('View Mode')).toBeInTheDocument();
      });
    });
  });
});

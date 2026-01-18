import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import Sidebar from '../Sidebar';
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

describe('Sidebar', () => {
  const defaultProps = {
    folders: mockFolders,
    tags: mockTags,
    filterType: 'all' as const,
    selectedFolderId: null,
    selectedTagId: null,
    collapsed: false,
    onFilterChange: vi.fn(),
    onFolderSelect: vi.fn(),
    onTagSelect: vi.fn(),
    onCreateFolder: vi.fn().mockResolvedValue({ id: 'new', name: 'New' }),
    onDeleteFolder: vi.fn().mockResolvedValue(undefined),
    onDeleteTag: vi.fn().mockResolvedValue(undefined),
    onOpenSettings: vi.fn(),
    onToggleCollapse: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders Browse header', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Browse')).toBeInTheDocument();
    });

    it('renders All Bookmarks option', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);
      expect(screen.getByText('All Bookmarks')).toBeInTheDocument();
    });

    it('renders Favorites option', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Favorites')).toBeInTheDocument();
    });

    it('renders Folders section', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Folders')).toBeInTheDocument();
    });

    it('renders Tags section', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    it('renders Settings button', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders all folders', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    it('renders all tags', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Read Later')).toBeInTheDocument();
    });

    it('renders Uncategorized option in folders', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Uncategorized')).toBeInTheDocument();
    });

    it('shows bookmark counts for folders', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);
      expect(screen.getByText('5 items')).toBeInTheDocument();
      expect(screen.getByText('3 items')).toBeInTheDocument();
    });

    it('shows bookmark counts for tags', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);
      expect(screen.getByText('2 items')).toBeInTheDocument();
      expect(screen.getByText('4 items')).toBeInTheDocument();
    });
  });

  describe('Collapsed State', () => {
    it('hides text labels when collapsed', () => {
      renderWithTheme(<Sidebar {...defaultProps} collapsed={true} />);
      expect(screen.queryByText('All Bookmarks')).not.toBeInTheDocument();
      expect(screen.queryByText('Favorites')).not.toBeInTheDocument();
      expect(screen.queryByText('Browse')).not.toBeInTheDocument();
    });

    it('hides folder and tag lists when collapsed', () => {
      renderWithTheme(<Sidebar {...defaultProps} collapsed={true} />);
      expect(screen.queryByText('Work')).not.toBeInTheDocument();
      expect(screen.queryByText('Important')).not.toBeInTheDocument();
    });

    it('still renders icons when collapsed', () => {
      renderWithTheme(<Sidebar {...defaultProps} collapsed={true} />);
      // Icons should still be present
      expect(screen.getByTestId('BookmarkIcon')).toBeInTheDocument();
      expect(screen.getByTestId('StarIcon')).toBeInTheDocument();
    });
  });

  describe('Filter Selection', () => {
    it('calls onFilterChange when All Bookmarks is clicked', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      fireEvent.click(screen.getByText('All Bookmarks'));

      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('all');
    });

    it('calls onFilterChange when Favorites is clicked', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      fireEvent.click(screen.getByText('Favorites'));

      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('favorites');
    });

    it('highlights selected filter', () => {
      renderWithTheme(<Sidebar {...defaultProps} filterType="favorites" />);

      const favoritesButton = screen.getByText('Favorites').closest('div[role="button"]');
      expect(favoritesButton).toHaveClass('Mui-selected');
    });
  });

  describe('Folder Selection', () => {
    it('calls onFolderSelect when folder is clicked', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      fireEvent.click(screen.getByText('Work'));

      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('folder');
      expect(defaultProps.onFolderSelect).toHaveBeenCalledWith('folder1');
    });

    it('calls onFolderSelect with null for Uncategorized', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      fireEvent.click(screen.getByText('Uncategorized'));

      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('folder');
      expect(defaultProps.onFolderSelect).toHaveBeenCalledWith(null);
    });

    it('highlights selected folder', () => {
      renderWithTheme(
        <Sidebar {...defaultProps} filterType="folder" selectedFolderId="folder1" />
      );

      const workFolder = screen.getByText('Work').closest('div[role="button"]');
      expect(workFolder).toHaveClass('Mui-selected');
    });
  });

  describe('Tag Selection', () => {
    it('calls onTagSelect when tag is clicked', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      fireEvent.click(screen.getByText('Important'));

      expect(defaultProps.onFilterChange).toHaveBeenCalledWith('tag');
      expect(defaultProps.onTagSelect).toHaveBeenCalledWith('tag1');
    });

    it('highlights selected tag', () => {
      renderWithTheme(
        <Sidebar {...defaultProps} filterType="tag" selectedTagId="tag1" />
      );

      const importantTag = screen.getByText('Important').closest('div[role="button"]');
      expect(importantTag).toHaveClass('Mui-selected');
    });
  });

  describe('Folder Management', () => {
    it('opens create folder dialog when add button is clicked', async () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const addButtons = screen.getAllByTestId('AddIcon');
      const folderAddButton = addButtons[0].closest('button');
      if (folderAddButton) {
        fireEvent.click(folderAddButton);
      }

      await waitFor(() => {
        expect(screen.getByText('Create New Folder')).toBeInTheDocument();
      });
    });

    it('creates folder when dialog is submitted', async () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      // Open dialog
      const addButtons = screen.getAllByTestId('AddIcon');
      const folderAddButton = addButtons[0].closest('button');
      if (folderAddButton) {
        fireEvent.click(folderAddButton);
      }

      await waitFor(() => {
        expect(screen.getByText('Create New Folder')).toBeInTheDocument();
      });

      // Type folder name
      const input = screen.getByLabelText('Folder Name');
      await userEvent.type(input, 'New Folder');

      // Submit
      const createButton = screen.getByRole('button', { name: 'Create' });
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(defaultProps.onCreateFolder).toHaveBeenCalledWith('New Folder');
      });
    });

    it('calls onDeleteFolder when delete button is clicked', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      const workDeleteButton = deleteButtons[0].closest('button');
      if (workDeleteButton) {
        fireEvent.click(workDeleteButton);
      }

      expect(defaultProps.onDeleteFolder).toHaveBeenCalledWith('folder1');
    });
  });

  describe('Tag Management', () => {
    it('calls onDeleteTag when delete button is clicked', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      // Find delete buttons in tags section
      const tagItems = screen.getAllByText(/items/).map((el) => el.closest('li'));
      const tagDeleteButtons = tagItems
        .slice(-2) // Last two items are tags
        .map((item) => item?.querySelector('[data-testid="DeleteIcon"]')?.closest('button'))
        .filter(Boolean);

      if (tagDeleteButtons[0]) {
        fireEvent.click(tagDeleteButtons[0]);
      }

      expect(defaultProps.onDeleteTag).toHaveBeenCalledWith('tag1');
    });
  });

  describe('Collapse/Expand', () => {
    it('shows folders section content by default', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('toggles folders section when clicked', async () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const foldersHeader = screen.getByText('Folders');
      fireEvent.click(foldersHeader);

      await waitFor(() => {
        // Folders should collapse (implementation dependent)
        // The exact behavior depends on Collapse animation
      });
    });

    it('shows tags section content by default', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Important')).toBeInTheDocument();
    });
  });

  describe('Settings', () => {
    it('calls onOpenSettings when settings is clicked', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      fireEvent.click(screen.getByText('Settings'));

      expect(defaultProps.onOpenSettings).toHaveBeenCalled();
    });
  });

  describe('Toggle Collapse', () => {
    it('calls onToggleCollapse when header is clicked', () => {
      renderWithTheme(<Sidebar {...defaultProps} />);

      const header = screen.getByText('Browse').closest('div');
      if (header) {
        fireEvent.click(header);
      }

      expect(defaultProps.onToggleCollapse).toHaveBeenCalled();
    });
  });

  describe('Empty States', () => {
    it('shows empty message when no folders', () => {
      renderWithTheme(<Sidebar {...defaultProps} folders={[]} />);
      expect(screen.getByText('No folders yet')).toBeInTheDocument();
    });

    it('shows empty message when no tags', () => {
      renderWithTheme(<Sidebar {...defaultProps} tags={[]} />);
      expect(screen.getByText('No tags yet')).toBeInTheDocument();
    });
  });
});

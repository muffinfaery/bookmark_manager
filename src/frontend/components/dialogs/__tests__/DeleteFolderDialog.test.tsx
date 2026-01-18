import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import DeleteFolderDialog from '../DeleteFolderDialog';
import { Folder, Bookmark } from '@/types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockFolder: Folder = {
  id: 'folder1',
  name: 'Work Documents',
  color: '#3f51b5',
  bookmarkCount: 5,
  sortOrder: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockFolders: Folder[] = [
  mockFolder,
  { id: 'folder2', name: 'Personal', color: '#4caf50', bookmarkCount: 3, sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder3', name: 'Archive', color: '#ff9800', bookmarkCount: 10, sortOrder: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const mockBookmarks: Bookmark[] = [
  {
    id: '1',
    url: 'https://example1.com',
    title: 'Example 1',
    folderId: 'folder1',
    isFavorite: false,
    clickCount: 0,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
  },
  {
    id: '2',
    url: 'https://example2.com',
    title: 'Example 2',
    folderId: 'folder1',
    isFavorite: false,
    clickCount: 0,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
  },
  {
    id: '3',
    url: 'https://example3.com',
    title: 'Example 3',
    folderId: 'folder2',
    isFavorite: false,
    clickCount: 0,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
  },
];

describe('DeleteFolderDialog', () => {
  const defaultProps = {
    open: true,
    folder: mockFolder,
    folders: mockFolders,
    bookmarks: mockBookmarks,
    onClose: vi.fn(),
    onConfirm: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders dialog with title', () => {
      renderWithTheme(<DeleteFolderDialog {...defaultProps} />);
      // Use role to find the dialog title heading specifically
      expect(screen.getByRole('heading', { name: /Delete Folder/i })).toBeInTheDocument();
    });

    it('shows warning icon', () => {
      renderWithTheme(<DeleteFolderDialog {...defaultProps} />);
      expect(screen.getByTestId('WarningIcon')).toBeInTheDocument();
    });

    it('displays folder name in confirmation text', () => {
      renderWithTheme(<DeleteFolderDialog {...defaultProps} />);
      expect(screen.getByText(/Work Documents/)).toBeInTheDocument();
    });

    it('shows affected bookmarks count in alert', () => {
      renderWithTheme(<DeleteFolderDialog {...defaultProps} />);
      // 2 bookmarks in folder1
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/2/)).toBeInTheDocument();
    });

    it('shows move bookmarks checkbox', () => {
      renderWithTheme(<DeleteFolderDialog {...defaultProps} />);
      expect(screen.getByText(/Move bookmarks to another folder/i)).toBeInTheDocument();
    });

    it('renders cancel and delete buttons', () => {
      renderWithTheme(<DeleteFolderDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete Folder/i })).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      renderWithTheme(<DeleteFolderDialog {...defaultProps} open={false} />);
      expect(screen.queryByText('Delete Folder')).not.toBeInTheDocument();
    });

    it('does not render when folder is null', () => {
      renderWithTheme(<DeleteFolderDialog {...defaultProps} folder={null} />);
      expect(screen.queryByText('Delete Folder')).not.toBeInTheDocument();
    });
  });

  describe('No Affected Bookmarks', () => {
    it('shows empty message when no bookmarks use this folder', () => {
      const emptyFolder = { ...mockFolder, id: 'empty', bookmarkCount: 0 };
      renderWithTheme(
        <DeleteFolderDialog
          {...defaultProps}
          folder={emptyFolder}
          bookmarks={mockBookmarks}
        />
      );
      expect(screen.getByText(/This folder is empty/i)).toBeInTheDocument();
    });

    it('does not show move checkbox when no bookmarks affected', () => {
      const emptyFolder = { ...mockFolder, id: 'empty', bookmarkCount: 0 };
      renderWithTheme(
        <DeleteFolderDialog
          {...defaultProps}
          folder={emptyFolder}
          bookmarks={mockBookmarks}
        />
      );
      expect(screen.queryByText(/Move bookmarks to another folder/i)).not.toBeInTheDocument();
    });
  });

  describe('Move Bookmarks Option', () => {
    it('shows folder selector when move checkbox is checked by default', () => {
      renderWithTheme(<DeleteFolderDialog {...defaultProps} />);
      // Checkbox is checked by default, so selector should be visible
      expect(screen.getByLabelText(/Move to folder/i)).toBeInTheDocument();
    });

    it('hides folder selector when move checkbox is unchecked', async () => {
      renderWithTheme(<DeleteFolderDialog {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox); // Uncheck

      await waitFor(() => {
        expect(screen.queryByLabelText(/Move to folder/i)).not.toBeInTheDocument();
      });
    });

    it('shows warning when not moving bookmarks', async () => {
      renderWithTheme(<DeleteFolderDialog {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox); // Uncheck

      await waitFor(() => {
        expect(screen.getByText(/Bookmarks will remain but will become uncategorized/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when cancel is clicked', () => {
      renderWithTheme(<DeleteFolderDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onConfirm with folder id and null when delete is clicked', async () => {
      renderWithTheme(<DeleteFolderDialog {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /Delete Folder/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        // With move checkbox checked but no folder selected, moveToFolderId is null
        expect(defaultProps.onConfirm).toHaveBeenCalledWith('folder1', null);
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading state when deleting', async () => {
      const slowConfirm = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );
      renderWithTheme(<DeleteFolderDialog {...defaultProps} onConfirm={slowConfirm} />);

      const deleteButton = screen.getByRole('button', { name: /Delete Folder/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/Deleting.../i)).toBeInTheDocument();
      });
    });

    it('disables buttons while deleting', async () => {
      const slowConfirm = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );
      renderWithTheme(<DeleteFolderDialog {...defaultProps} onConfirm={slowConfirm} />);

      const deleteButton = screen.getByRole('button', { name: /Delete Folder/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Deleting.../i })).toBeDisabled();
      });
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material';
import AddBookmarkDialog from '../AddBookmarkDialog';
import { Bookmark, Folder, Tag } from '@/types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockFolders: Folder[] = [
  { id: 'folder1', name: 'Work', color: '#ff0000', bookmarkCount: 5, sortOrder: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'folder2', name: 'Personal', color: '#00ff00', bookmarkCount: 3, sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const mockTags: Tag[] = [
  { id: 'tag1', name: 'Important', color: '#ff0000', bookmarkCount: 2, createdAt: new Date().toISOString() },
  { id: 'tag2', name: 'Read Later', color: '#0000ff', bookmarkCount: 4, createdAt: new Date().toISOString() },
];

const mockEditingBookmark: Bookmark = {
  id: '1',
  url: 'https://example.com',
  title: 'Example',
  description: 'Test description',
  isFavorite: false,
  clickCount: 0,
  sortOrder: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: [{ id: 'tag1', name: 'Important', color: '#ff0000', bookmarkCount: 2, createdAt: new Date().toISOString() }],
  folderId: 'folder1',
};

describe('AddBookmarkDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSave: vi.fn().mockResolvedValue(undefined),
    folders: mockFolders,
    tags: mockTags,
    editingBookmark: null,
    onCreateFolder: vi.fn().mockResolvedValue({ id: 'new', name: 'New Folder', bookmarkCount: 0, sortOrder: 2 }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Add Mode', () => {
    it('renders dialog with correct title for adding', () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} />);
      expect(screen.getByText('Add New Bookmark')).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} />);
      expect(screen.getByLabelText(/URL/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Folder/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();
    });

    it('validates URL format', async () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} />);
      const urlInput = screen.getByLabelText(/URL/i);

      await userEvent.type(urlInput, 'invalid-url');
      fireEvent.blur(urlInput);

      await waitFor(() => {
        expect(
          screen.getByText(/Please enter a valid URL/i)
        ).toBeInTheDocument();
      });
    });

    it('accepts valid URLs', async () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} />);
      const urlInput = screen.getByLabelText(/URL/i);

      await userEvent.type(urlInput, 'https://example.com');
      fireEvent.blur(urlInput);

      await waitFor(() => {
        expect(
          screen.queryByText(/Please enter a valid URL/i)
        ).not.toBeInTheDocument();
      });
    });

    it('shows error when saving without URL', async () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} />);
      const titleInput = screen.getByLabelText(/Title/i);
      await userEvent.type(titleInput, 'Test Title');

      const saveButton = screen.getByRole('button', { name: /Add Bookmark/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/URL is required/i)).toBeInTheDocument();
      });
    });

    it('shows error when saving without title', async () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} />);
      const urlInput = screen.getByLabelText(/URL/i);
      await userEvent.type(urlInput, 'https://example.com');

      const saveButton = screen.getByRole('button', { name: /Add Bookmark/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      });
    });

    it('calls onSave with correct data', async () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/URL/i), 'https://example.com');
      await userEvent.type(screen.getByLabelText(/Title/i), 'Test Title');
      await userEvent.type(screen.getByLabelText(/Description/i), 'Test Description');

      const saveButton = screen.getByRole('button', { name: /Add Bookmark/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(defaultProps.onSave).toHaveBeenCalledWith({
          url: 'https://example.com',
          title: 'Test Title',
          description: 'Test Description',
          favicon: undefined,
          folderId: undefined,
          tags: undefined,
        });
      });
    });

    it('calls onClose when cancel is clicked', () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} />);
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    it('renders dialog with correct title for editing', () => {
      renderWithTheme(
        <AddBookmarkDialog {...defaultProps} editingBookmark={mockEditingBookmark} />
      );
      expect(screen.getByText('Edit Bookmark')).toBeInTheDocument();
    });

    it('pre-fills form with bookmark data', () => {
      renderWithTheme(
        <AddBookmarkDialog {...defaultProps} editingBookmark={mockEditingBookmark} />
      );

      expect(screen.getByLabelText(/URL/i)).toHaveValue('https://example.com');
      expect(screen.getByLabelText(/Title/i)).toHaveValue('Example');
      expect(screen.getByLabelText(/Description/i)).toHaveValue('Test description');
    });

    it('disables URL field when editing', () => {
      renderWithTheme(
        <AddBookmarkDialog {...defaultProps} editingBookmark={mockEditingBookmark} />
      );

      expect(screen.getByLabelText(/URL/i)).toBeDisabled();
    });

    it('shows Save Changes button when editing', () => {
      renderWithTheme(
        <AddBookmarkDialog {...defaultProps} editingBookmark={mockEditingBookmark} />
      );

      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    it('shows existing tags when editing', () => {
      renderWithTheme(
        <AddBookmarkDialog {...defaultProps} editingBookmark={mockEditingBookmark} />
      );

      expect(screen.getByText('Important')).toBeInTheDocument();
    });
  });

  describe('Tag Management', () => {
    it('allows adding new tags', async () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} />);

      const tagsInput = screen.getByLabelText(/Tags/i);
      await userEvent.type(tagsInput, 'NewTag{enter}');

      await waitFor(() => {
        expect(screen.getByText('NewTag')).toBeInTheDocument();
      });
    });

    it('allows selecting existing tags', async () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} />);

      const tagsInput = screen.getByLabelText(/Tags/i);
      await userEvent.click(tagsInput);
      await userEvent.type(tagsInput, 'Important');

      await waitFor(() => {
        const option = screen.getByRole('option', { name: 'Important' });
        fireEvent.click(option);
      });

      await waitFor(() => {
        expect(screen.getByText('Important')).toBeInTheDocument();
      });
    });
  });

  describe('Folder Selection', () => {
    it('allows selecting existing folder', async () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} />);

      const folderInput = screen.getByLabelText(/Folder/i);
      await userEvent.click(folderInput);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Work' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Personal' })).toBeInTheDocument();
      });
    });

    it('shows create folder option when typing new name', async () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} />);

      const folderInput = screen.getByLabelText(/Folder/i);
      await userEvent.type(folderInput, 'Brand New Folder');

      await waitFor(() => {
        expect(screen.getByText(/Create "Brand New Folder"/i)).toBeInTheDocument();
      });
    });

    it('creates new folder when selecting create option', async () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} />);

      const folderInput = screen.getByLabelText(/Folder/i);
      await userEvent.type(folderInput, 'Brand New Folder');

      await waitFor(async () => {
        const createOption = screen.getByText(/Create "Brand New Folder"/i);
        await userEvent.click(createOption);
      });

      await waitFor(() => {
        expect(defaultProps.onCreateFolder).toHaveBeenCalledWith('Brand New Folder');
      });
    });
  });

  describe('Dialog State', () => {
    it('does not render when closed', () => {
      renderWithTheme(<AddBookmarkDialog {...defaultProps} open={false} />);
      expect(screen.queryByText('Add New Bookmark')).not.toBeInTheDocument();
    });

    it('resets form when reopened', async () => {
      const { rerender } = renderWithTheme(<AddBookmarkDialog {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/URL/i), 'https://test.com');

      rerender(
        <ThemeProvider theme={theme}>
          <AddBookmarkDialog {...defaultProps} open={false} />
        </ThemeProvider>
      );

      rerender(
        <ThemeProvider theme={theme}>
          <AddBookmarkDialog {...defaultProps} open={true} />
        </ThemeProvider>
      );

      // Form should be reset (this behavior depends on implementation)
      expect(screen.getByLabelText(/URL/i)).toHaveValue('');
    });

    it('shows loading state when saving', async () => {
      const slowSave = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));
      renderWithTheme(<AddBookmarkDialog {...defaultProps} onSave={slowSave} />);

      await userEvent.type(screen.getByLabelText(/URL/i), 'https://example.com');
      await userEvent.type(screen.getByLabelText(/Title/i), 'Test');

      const saveButton = screen.getByRole('button', { name: /Add Bookmark/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });
  });
});

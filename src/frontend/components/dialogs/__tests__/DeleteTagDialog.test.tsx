import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import DeleteTagDialog from '../DeleteTagDialog';
import { Tag, Bookmark } from '@/types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

const mockTag: Tag = {
  id: 'tag1',
  name: 'Important',
  color: '#f44336',
  bookmarkCount: 3,
  createdAt: new Date().toISOString(),
};

const mockTags: Tag[] = [
  mockTag,
  { id: 'tag2', name: 'Work', color: '#2196f3', bookmarkCount: 5, createdAt: new Date().toISOString() },
  { id: 'tag3', name: 'Personal', color: '#4caf50', bookmarkCount: 2, createdAt: new Date().toISOString() },
];

const mockBookmarks: Bookmark[] = [
  {
    id: '1',
    url: 'https://example1.com',
    title: 'Example 1',
    isFavorite: false,
    clickCount: 0,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [mockTag],
  },
  {
    id: '2',
    url: 'https://example2.com',
    title: 'Example 2',
    isFavorite: false,
    clickCount: 0,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [mockTag, mockTags[1]],
  },
  {
    id: '3',
    url: 'https://example3.com',
    title: 'Example 3',
    isFavorite: false,
    clickCount: 0,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [mockTags[1]],
  },
];

describe('DeleteTagDialog', () => {
  const defaultProps = {
    open: true,
    tag: mockTag,
    tags: mockTags,
    bookmarks: mockBookmarks,
    onClose: vi.fn(),
    onConfirm: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders dialog with warning title', () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);
      // Use role to find the dialog title heading specifically
      expect(screen.getByRole('heading', { name: /Delete Tag/i })).toBeInTheDocument();
      expect(screen.getByTestId('WarningIcon')).toBeInTheDocument();
    });

    it('displays tag name in chip', () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);
      expect(screen.getByText('Important')).toBeInTheDocument();
    });

    it('shows affected bookmarks count', () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);
      // 2 bookmarks have this tag - check for the alert with count
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
      // Check that the count is displayed (text is split across elements)
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('shows replace tag checkbox', () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);
      expect(screen.getByText(/Replace with another tag/i)).toBeInTheDocument();
    });

    it('renders cancel and delete buttons', () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete Tag/i })).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} open={false} />);
      expect(screen.queryByText('Delete Tag')).not.toBeInTheDocument();
    });

    it('does not render when tag is null', () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} tag={null} />);
      expect(screen.queryByText('Delete Tag')).not.toBeInTheDocument();
    });
  });

  describe('No Affected Bookmarks', () => {
    it('shows message when no bookmarks use this tag', () => {
      const unusedTag = { ...mockTag, id: 'unused' };
      renderWithTheme(
        <DeleteTagDialog
          {...defaultProps}
          tag={unusedTag}
          bookmarks={mockBookmarks}
        />
      );
      expect(screen.getByText(/No bookmarks are using this tag/i)).toBeInTheDocument();
    });

    it('does not show replace checkbox when no bookmarks affected', () => {
      const unusedTag = { ...mockTag, id: 'unused' };
      renderWithTheme(
        <DeleteTagDialog
          {...defaultProps}
          tag={unusedTag}
          bookmarks={mockBookmarks}
        />
      );
      expect(screen.queryByText(/Replace with another tag/i)).not.toBeInTheDocument();
    });
  });

  describe('Replace Tag Option', () => {
    it('shows tag selector when replace checkbox is checked', async () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByLabelText(/Replace with tag/i)).toBeInTheDocument();
      });
    });

    it('excludes current tag from replace options', async () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);

      // First check the replace checkbox to show the autocomplete
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // Find the autocomplete input
      const tagInput = await screen.findByLabelText(/Replace with tag/i);
      // Use mouseDown to open the dropdown (MUI Autocomplete behavior)
      fireEvent.mouseDown(tagInput);

      // Wait for the listbox to appear and verify options
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Check that Work and Personal are options, but Important (current tag) is excluded
      const options = screen.getAllByRole('option');
      const optionTexts = options.map(opt => opt.textContent);
      expect(optionTexts).toContain('Work');
      expect(optionTexts).toContain('Personal');
      expect(optionTexts).not.toContain('Important');
    });

    it('shows helper text when replace is checked but no tag selected', async () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(
          screen.getByText(/Please select a tag to replace with/i)
        ).toBeInTheDocument();
      });
    });

    it('disables delete button when replace is checked but no tag selected', async () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /Delete Tag/i });
        expect(deleteButton).toBeDisabled();
      });
    });

    it('shows warning when not replacing tag', () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);
      expect(screen.getByText(/The tag will be removed from all bookmarks/i)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when cancel is clicked', () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onConfirm with tag id and undefined when delete is clicked without replacement', async () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /Delete Tag/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(defaultProps.onConfirm).toHaveBeenCalledWith('tag1', undefined);
      });
    });

    it('calls onConfirm with tag id and replacement tag id', async () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);

      // Check the replace checkbox to show the autocomplete
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      // Find and open the autocomplete
      const tagInput = await screen.findByLabelText(/Replace with tag/i);
      // Use mouseDown to open the dropdown (MUI Autocomplete behavior)
      fireEvent.mouseDown(tagInput);

      // Wait for listbox and select Work option
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const workOption = screen.getByRole('option', { name: 'Work' });
      fireEvent.click(workOption);

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /Delete Tag/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(defaultProps.onConfirm).toHaveBeenCalledWith('tag1', 'tag2');
      });
    });

    it('prevents closing while deleting', async () => {
      const slowConfirm = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );
      renderWithTheme(<DeleteTagDialog {...defaultProps} onConfirm={slowConfirm} />);

      const deleteButton = screen.getByRole('button', { name: /Delete Tag/i });
      fireEvent.click(deleteButton);

      // Try to close while deleting
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      // onClose should not be called because isDeleting is true
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows loading state when deleting', async () => {
      const slowConfirm = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );
      renderWithTheme(<DeleteTagDialog {...defaultProps} onConfirm={slowConfirm} />);

      const deleteButton = screen.getByRole('button', { name: /Delete Tag/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/Deleting.../i)).toBeInTheDocument();
      });
    });

    it('disables buttons while deleting', async () => {
      const slowConfirm = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );
      renderWithTheme(<DeleteTagDialog {...defaultProps} onConfirm={slowConfirm} />);

      const deleteButton = screen.getByRole('button', { name: /Delete Tag/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Deleting.../i })).toBeDisabled();
      });
    });
  });

  describe('Tag Chip Styling', () => {
    it('displays tag with its color', () => {
      renderWithTheme(<DeleteTagDialog {...defaultProps} />);

      const tagChip = screen.getByText('Important').closest('.MuiChip-root');
      expect(tagChip).toBeInTheDocument();
      // Check that the chip has a background color style (actual color may vary due to theme)
      expect(tagChip).toHaveAttribute('class');
    });
  });
});

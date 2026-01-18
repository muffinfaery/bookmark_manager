import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import ImportDialog from '../ImportDialog';

const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

// Sample browser bookmarks HTML
const sampleBookmarksHtml = `
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><A HREF="https://example.com" ADD_DATE="1234567890">Example Site</A>
    <DT><A HREF="https://test.com" ADD_DATE="1234567891">Test Site</A>
    <DT><H3>Work</H3>
    <DL><p>
        <DT><A HREF="https://work.com" ADD_DATE="1234567892">Work Site</A>
    </DL><p>
</DL><p>
`;

// Sample JSON bookmarks
const sampleBookmarksJson = JSON.stringify({
  bookmarks: [
    { url: 'https://example.com', title: 'Example Site' },
    { url: 'https://test.com', title: 'Test Site' },
  ],
  folders: [{ name: 'Work', color: '#ff0000' }],
});

describe('ImportDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onImport: vi.fn().mockResolvedValue(undefined),
    existingUrls: ['https://existing.com'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders dialog with title', () => {
      renderWithTheme(<ImportDialog {...defaultProps} />);
      expect(screen.getByText('Import Bookmarks')).toBeInTheDocument();
    });

    it('renders format selection', () => {
      renderWithTheme(<ImportDialog {...defaultProps} />);
      expect(screen.getByText('Select Import Format')).toBeInTheDocument();
    });

    it('shows JSON and Chrome format options', () => {
      renderWithTheme(<ImportDialog {...defaultProps} />);
      expect(screen.getByText('Bookmark Manager JSON')).toBeInTheDocument();
      expect(screen.getByText('Chrome HTML Export')).toBeInTheDocument();
    });

    it('renders Choose File button', () => {
      renderWithTheme(<ImportDialog {...defaultProps} />);
      expect(screen.getByText('Choose File')).toBeInTheDocument();
    });

    it('renders cancel button', () => {
      renderWithTheme(<ImportDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      renderWithTheme(<ImportDialog {...defaultProps} open={false} />);
      expect(screen.queryByText('Import Bookmarks')).not.toBeInTheDocument();
    });
  });

  describe('Format Selection', () => {
    it('defaults to JSON format', () => {
      renderWithTheme(<ImportDialog {...defaultProps} />);
      const jsonButton = screen.getByText('Bookmark Manager JSON').closest('button');
      expect(jsonButton).toHaveClass('Mui-selected');
    });

    it('can switch to Chrome format', () => {
      renderWithTheme(<ImportDialog {...defaultProps} />);
      const chromeButton = screen.getByText('Chrome HTML Export').closest('button');
      if (chromeButton) {
        fireEvent.click(chromeButton);
        expect(chromeButton).toHaveClass('Mui-selected');
      }
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when cancel is clicked', () => {
      renderWithTheme(<ImportDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('disables import button initially', () => {
      renderWithTheme(<ImportDialog {...defaultProps} />);
      // The import button shows "Import 0 Bookmarks" when no file is selected
      const buttons = screen.getAllByRole('button');
      const importButton = buttons.find(btn => btn.textContent?.includes('Import'));
      if (importButton) {
        expect(importButton).toBeDisabled();
      }
    });
  });

  describe('File Input', () => {
    it('has a file input element', () => {
      renderWithTheme(<ImportDialog {...defaultProps} />);
      // The file input is hidden but exists in the document
      const fileInput = document.querySelector('#import-file-input');
      expect(fileInput).toBeInTheDocument();
    });

    it('accepts JSON files when in JSON format', () => {
      renderWithTheme(<ImportDialog {...defaultProps} />);
      const fileInput = document.querySelector('#import-file-input');
      expect(fileInput).toHaveAttribute('accept', '.json');
    });

    it('accepts HTML files when in Chrome format', async () => {
      renderWithTheme(<ImportDialog {...defaultProps} />);

      // Switch to Chrome format
      const chromeButton = screen.getByText('Chrome HTML Export').closest('button');
      if (chromeButton) {
        fireEvent.click(chromeButton);
      }

      await waitFor(() => {
        const fileInput = document.querySelector('#import-file-input');
        expect(fileInput).toHaveAttribute('accept', '.html,.htm');
      });
    });
  });
});

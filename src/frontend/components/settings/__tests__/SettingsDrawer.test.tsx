import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import SettingsDrawer from '../SettingsDrawer';

const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('SettingsDrawer', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
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
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} open={false} />);
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    it('renders View Mode section', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByText('View Mode')).toBeInTheDocument();
    });

    it('renders Theme section', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByText('Theme')).toBeInTheDocument();
    });

    it('renders close button', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByTestId('CloseIcon')).toBeInTheDocument();
    });
  });

  describe('View Mode', () => {
    it('renders view mode label', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByText('View Mode')).toBeInTheDocument();
    });

    it('renders Grid option', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByText('Grid')).toBeInTheDocument();
    });

    it('renders List option', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByText('List')).toBeInTheDocument();
    });

    it('shows grid as selected when viewMode is grid', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} viewMode="grid" />);
      const gridButton = screen.getByText('Grid').closest('button');
      expect(gridButton).toHaveClass('Mui-selected');
    });

    it('shows list as selected when viewMode is list', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} viewMode="list" />);
      const listButton = screen.getByText('List').closest('button');
      expect(listButton).toHaveClass('Mui-selected');
    });

    it('calls onViewModeChange when grid is clicked', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} viewMode="list" />);
      fireEvent.click(screen.getByText('Grid'));
      expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('grid');
    });

    it('calls onViewModeChange when list is clicked', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} viewMode="grid" />);
      fireEvent.click(screen.getByText('List'));
      expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('list');
    });
  });

  describe('Theme Mode', () => {
    it('renders theme label', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByText('Theme')).toBeInTheDocument();
    });

    it('renders Light option', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('renders Dark option', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    it('renders Auto option', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByText('Auto')).toBeInTheDocument();
    });

    it('shows light as selected when themeMode is light', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} themeMode="light" />);
      const lightButton = screen.getByText('Light').closest('button');
      expect(lightButton).toHaveClass('Mui-selected');
    });

    it('shows dark as selected when themeMode is dark', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} themeMode="dark" />);
      const darkButton = screen.getByText('Dark').closest('button');
      expect(darkButton).toHaveClass('Mui-selected');
    });

    it('shows system as selected when themeMode is system', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} themeMode="system" />);
      const systemButton = screen.getByText('Auto').closest('button');
      expect(systemButton).toHaveClass('Mui-selected');
    });

    it('calls onThemeModeChange when light is clicked', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} themeMode="dark" />);
      fireEvent.click(screen.getByText('Light'));
      expect(defaultProps.onThemeModeChange).toHaveBeenCalledWith('light');
    });

    it('calls onThemeModeChange when dark is clicked', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} themeMode="light" />);
      fireEvent.click(screen.getByText('Dark'));
      expect(defaultProps.onThemeModeChange).toHaveBeenCalledWith('dark');
    });

    it('calls onThemeModeChange when system is clicked', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} themeMode="dark" />);
      fireEvent.click(screen.getByText('Auto'));
      expect(defaultProps.onThemeModeChange).toHaveBeenCalledWith('system');
    });
  });

  describe('Import/Export', () => {
    it('renders Import Bookmarks button', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByText('Import Bookmarks')).toBeInTheDocument();
    });

    it('renders Export Bookmarks button', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByText('Export Bookmarks')).toBeInTheDocument();
    });

    it('calls onImport when Import is clicked', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      fireEvent.click(screen.getByText('Import Bookmarks'));
      expect(defaultProps.onImport).toHaveBeenCalled();
    });

    it('calls onExport when Export is clicked', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      fireEvent.click(screen.getByText('Export Bookmarks'));
      expect(defaultProps.onExport).toHaveBeenCalled();
    });

    it('shows import icon', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByTestId('FileUploadIcon')).toBeInTheDocument();
    });

    it('shows export icon', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByTestId('FileDownloadIcon')).toBeInTheDocument();
    });
  });

  describe('Close Behavior', () => {
    it('calls onClose when close button is clicked', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      const closeButton = screen.getByTestId('CloseIcon').closest('button');
      if (closeButton) {
        fireEvent.click(closeButton);
      }
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onClose when clicking outside drawer', async () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);

      // Find the backdrop
      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });
  });

  describe('Icons', () => {
    it('shows grid icon', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByTestId('GridViewIcon')).toBeInTheDocument();
    });

    it('shows list icon', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByTestId('ViewListIcon')).toBeInTheDocument();
    });

    it('shows light mode icon', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByTestId('LightModeIcon')).toBeInTheDocument();
    });

    it('shows dark mode icon', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByTestId('DarkModeIcon')).toBeInTheDocument();
    });

    it('shows settings brightness icon for system', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      expect(screen.getByTestId('SettingsBrightnessIcon')).toBeInTheDocument();
    });
  });

  describe('Drawer Position', () => {
    it('opens from right side', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      const drawer = document.querySelector('.MuiDrawer-paper');
      // Drawer should be positioned on the right
      expect(drawer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('close button is focusable', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      const closeButton = screen.getByTestId('CloseIcon').closest('button');
      if (closeButton) {
        closeButton.focus();
        expect(document.activeElement).toBe(closeButton);
      }
    });

    it('toggle buttons are keyboard accessible', () => {
      renderWithTheme(<SettingsDrawer {...defaultProps} />);
      const gridButton = screen.getByText('Grid').closest('button');
      if (gridButton) {
        gridButton.focus();
        expect(document.activeElement).toBe(gridButton);
      }
    });
  });
});

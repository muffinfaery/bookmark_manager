import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import InstallPrompt from '../InstallPrompt';

const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('InstallPrompt', () => {
  const originalLocalStorage = window.localStorage;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    vi.useFakeTimers();
    mockLocalStorage = {};

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('renders nothing initially', () => {
      const { container } = renderWithTheme(<InstallPrompt />);
      // Component renders null when no beforeinstallprompt event
      expect(container.firstChild).toBeNull();
    });

    it('does not show prompt when recently dismissed', () => {
      // Set dismissed timestamp to recent
      mockLocalStorage['pwa-install-dismissed'] = new Date().toISOString();

      const { container } = renderWithTheme(<InstallPrompt />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('When Install Prompt Event Fires', () => {
    it('shows snackbar after beforeinstallprompt event', async () => {
      renderWithTheme(<InstallPrompt />);

      // Simulate beforeinstallprompt event
      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
      };

      await act(async () => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      // Fast forward past the delay (3000ms in component)
      await act(async () => {
        vi.advanceTimersByTime(3500);
      });

      // Now the snackbar should be visible (there are two - one for desktop, one for mobile)
      const messages = screen.getAllByText(/Install Bookmarks for quick access/i);
      expect(messages.length).toBeGreaterThan(0);
    });

    it('shows Install button', async () => {
      renderWithTheme(<InstallPrompt />);

      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
      };

      await act(async () => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await act(async () => {
        vi.advanceTimersByTime(3500);
      });

      const installButtons = screen.getAllByText('Install');
      expect(installButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Dismiss Behavior', () => {
    it('saves dismiss timestamp when closed', async () => {
      renderWithTheme(<InstallPrompt />);

      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
      };

      await act(async () => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await act(async () => {
        vi.advanceTimersByTime(3500);
      });

      // Snackbar should be visible (there are two - one for desktop, one for mobile)
      const messages = screen.getAllByText(/Install Bookmarks for quick access/i);
      expect(messages.length).toBeGreaterThan(0);

      // Click close button
      const closeButtons = screen.getAllByTestId('CloseIcon');
      if (closeButtons.length > 0) {
        fireEvent.click(closeButtons[0].closest('button')!);
      }

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'pwa-install-dismissed',
        expect.any(String)
      );
    });
  });

  describe('Install Action', () => {
    it('calls prompt when Install is clicked', async () => {
      renderWithTheme(<InstallPrompt />);

      const mockPrompt = vi.fn().mockResolvedValue(undefined);
      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: mockPrompt,
        userChoice: Promise.resolve({ outcome: 'accepted' as const }),
      };

      await act(async () => {
        const event = new Event('beforeinstallprompt');
        Object.assign(event, mockEvent);
        window.dispatchEvent(event);
      });

      await act(async () => {
        vi.advanceTimersByTime(3500);
      });

      const installButtons = screen.getAllByText('Install');
      expect(installButtons.length).toBeGreaterThan(0);

      await act(async () => {
        fireEvent.click(installButtons[0]);
      });

      expect(mockPrompt).toHaveBeenCalled();
    });
  });

  describe('Event Listener Cleanup', () => {
    it('removes event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderWithTheme(<InstallPrompt />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});

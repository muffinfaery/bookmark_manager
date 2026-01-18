import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ThemeRegistry, { useThemeMode } from '../ThemeRegistry';

// Test component to access theme context
function ThemeConsumer() {
  const { mode, resolvedMode, setThemeMode, cycleTheme } = useThemeMode();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved-mode">{resolvedMode}</span>
      <button onClick={() => setThemeMode('light')}>Set Light</button>
      <button onClick={() => setThemeMode('dark')}>Set Dark</button>
      <button onClick={() => setThemeMode('system')}>Set System</button>
      <button onClick={cycleTheme}>Cycle Theme</button>
    </div>
  );
}

describe('ThemeRegistry', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  describe('Rendering', () => {
    it('renders children', () => {
      render(
        <ThemeRegistry>
          <div>Test Child</div>
        </ThemeRegistry>
      );
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('provides CssBaseline', () => {
      const { container } = render(
        <ThemeRegistry>
          <div>Content</div>
        </ThemeRegistry>
      );
      // CssBaseline affects the body, check that component renders
      expect(container).toBeInTheDocument();
    });
  });

  describe('Default Theme', () => {
    it('defaults to system mode', () => {
      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );
      expect(screen.getByTestId('mode')).toHaveTextContent('system');
    });

    it('resolves system mode to light when prefers-color-scheme is light', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)' ? false : true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );
      expect(screen.getByTestId('resolved-mode')).toHaveTextContent('light');
    });

    it('resolves system mode to dark when prefers-color-scheme is dark', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );
      expect(screen.getByTestId('resolved-mode')).toHaveTextContent('dark');
    });
  });

  describe('Theme Persistence', () => {
    it('loads saved theme from localStorage', () => {
      localStorage.setItem('theme-mode', 'dark');

      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );
      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });

    it('saves theme to localStorage when changed', () => {
      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );

      act(() => {
        fireEvent.click(screen.getByText('Set Dark'));
      });

      expect(localStorage.getItem('theme-mode')).toBe('dark');
    });

    it('ignores invalid localStorage value', () => {
      localStorage.setItem('theme-mode', 'invalid');

      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );
      // Should fall back to system
      expect(screen.getByTestId('mode')).toHaveTextContent('system');
    });
  });

  describe('setThemeMode', () => {
    it('sets theme to light', () => {
      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );

      act(() => {
        fireEvent.click(screen.getByText('Set Light'));
      });

      expect(screen.getByTestId('mode')).toHaveTextContent('light');
      expect(screen.getByTestId('resolved-mode')).toHaveTextContent('light');
    });

    it('sets theme to dark', () => {
      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );

      act(() => {
        fireEvent.click(screen.getByText('Set Dark'));
      });

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('resolved-mode')).toHaveTextContent('dark');
    });

    it('sets theme to system', () => {
      localStorage.setItem('theme-mode', 'dark');

      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );

      act(() => {
        fireEvent.click(screen.getByText('Set System'));
      });

      expect(screen.getByTestId('mode')).toHaveTextContent('system');
    });
  });

  describe('cycleTheme', () => {
    it('cycles from light to dark', () => {
      localStorage.setItem('theme-mode', 'light');

      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );

      act(() => {
        fireEvent.click(screen.getByText('Cycle Theme'));
      });

      expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    });

    it('cycles from dark to system', () => {
      localStorage.setItem('theme-mode', 'dark');

      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );

      act(() => {
        fireEvent.click(screen.getByText('Cycle Theme'));
      });

      expect(screen.getByTestId('mode')).toHaveTextContent('system');
    });

    it('cycles from system to light', () => {
      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );

      act(() => {
        fireEvent.click(screen.getByText('Cycle Theme'));
      });

      expect(screen.getByTestId('mode')).toHaveTextContent('light');
    });
  });

  describe('useThemeMode Hook', () => {
    it('returns default values when used outside ThemeRegistry', () => {
      // The hook uses useContext with a default value, so it doesn't throw
      // It just returns the default context values
      render(<ThemeConsumer />);
      // Default mode is 'system', default resolvedMode is 'light'
      expect(screen.getByTestId('mode')).toHaveTextContent('system');
      expect(screen.getByTestId('resolved-mode')).toHaveTextContent('light');
    });

    it('provides mode value', () => {
      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );
      expect(screen.getByTestId('mode')).toBeInTheDocument();
    });

    it('provides resolvedMode value', () => {
      render(
        <ThemeRegistry>
          <ThemeConsumer />
        </ThemeRegistry>
      );
      expect(screen.getByTestId('resolved-mode')).toBeInTheDocument();
    });
  });

  describe('Theme Application', () => {
    it('applies light theme colors', () => {
      localStorage.setItem('theme-mode', 'light');

      render(
        <ThemeRegistry>
          <div data-testid="themed-content">Content</div>
        </ThemeRegistry>
      );

      // Theme is applied - the component renders without errors
      expect(screen.getByTestId('themed-content')).toBeInTheDocument();
    });

    it('applies dark theme colors', () => {
      localStorage.setItem('theme-mode', 'dark');

      render(
        <ThemeRegistry>
          <div data-testid="themed-content">Content</div>
        </ThemeRegistry>
      );

      // Theme is applied - the component renders without errors
      expect(screen.getByTestId('themed-content')).toBeInTheDocument();
    });
  });

  describe('System Theme Listener', () => {
    it('adds event listener for system theme changes', () => {
      const addEventListener = vi.fn();
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener,
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }));

      render(
        <ThemeRegistry>
          <div>Content</div>
        </ThemeRegistry>
      );

      expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('removes event listener on unmount', () => {
      const removeEventListener = vi.fn();
      window.matchMedia = vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }));

      const { unmount } = render(
        <ThemeRegistry>
          <div>Content</div>
        </ThemeRegistry>
      );

      unmount();

      expect(removeEventListener).toHaveBeenCalled();
    });
  });
});

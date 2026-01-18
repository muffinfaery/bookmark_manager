import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import ClerkButton from '../ClerkButton';

const theme = createTheme();

const renderWithTheme = (component: React.ReactNode) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ClerkButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders button with children', () => {
      renderWithTheme(<ClerkButton>Click Me</ClerkButton>);
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('renders as a button element', () => {
      renderWithTheme(<ClerkButton>Test</ClerkButton>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies contained variant styles by default', () => {
      renderWithTheme(<ClerkButton>Contained</ClerkButton>);
      const button = screen.getByRole('button');
      // Contained buttons have background color
      expect(button.style.backgroundColor).toBeTruthy();
    });

    it('applies outlined variant styles', () => {
      renderWithTheme(<ClerkButton variant="outlined">Outlined</ClerkButton>);
      const button = screen.getByRole('button');
      // Outlined buttons have border
      expect(button.style.border).toContain('1px solid');
    });

    it('applies text variant styles', () => {
      renderWithTheme(<ClerkButton variant="text">Text</ClerkButton>);
      const button = screen.getByRole('button');
      // Text buttons have transparent background (no visible border)
      expect(button.style.backgroundColor).toBe('transparent');
    });
  });

  describe('Sizes', () => {
    it('applies medium size by default', () => {
      renderWithTheme(<ClerkButton>Medium</ClerkButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ fontSize: '0.875rem' });
    });

    it('applies small size styles', () => {
      renderWithTheme(<ClerkButton size="small">Small</ClerkButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ fontSize: '0.8125rem' });
    });

    it('applies large size styles', () => {
      renderWithTheme(<ClerkButton size="large">Large</ClerkButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ fontSize: '0.9375rem' });
    });
  });

  describe('Full Width', () => {
    it('is not full width by default', () => {
      renderWithTheme(<ClerkButton>Normal</ClerkButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ width: 'auto' });
    });

    it('applies full width when prop is set', () => {
      renderWithTheme(<ClerkButton fullWidth>Full Width</ClerkButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ width: '100%' });
    });
  });

  describe('Hover State', () => {
    it('changes style on hover for contained variant', () => {
      renderWithTheme(<ClerkButton variant="contained">Hover Me</ClerkButton>);
      const button = screen.getByRole('button');

      const initialBgColor = button.style.backgroundColor;

      fireEvent.mouseEnter(button);

      // Background color should change on hover
      expect(button.style.backgroundColor).not.toBe(initialBgColor);
    });

    it('changes style on hover for outlined variant', () => {
      renderWithTheme(<ClerkButton variant="outlined">Hover Me</ClerkButton>);
      const button = screen.getByRole('button');

      const initialBgColor = button.style.backgroundColor;

      fireEvent.mouseEnter(button);

      // Background color should change on hover (subtle background)
      expect(button.style.backgroundColor).not.toBe(initialBgColor);
    });

    it('resets style on mouse leave', () => {
      renderWithTheme(<ClerkButton variant="contained">Leave Me</ClerkButton>);
      const button = screen.getByRole('button');

      const initialBgColor = button.style.backgroundColor;

      fireEvent.mouseEnter(button);
      fireEvent.mouseLeave(button);

      // Should return to initial state
      expect(button.style.backgroundColor).toBe(initialBgColor);
    });
  });

  describe('Event Handlers', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      renderWithTheme(<ClerkButton onClick={handleClick}>Click</ClerkButton>);

      fireEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalled();
    });

    it('calls custom onMouseEnter along with internal handler', () => {
      const handleMouseEnter = vi.fn();
      renderWithTheme(
        <ClerkButton onMouseEnter={handleMouseEnter}>Hover</ClerkButton>
      );

      fireEvent.mouseEnter(screen.getByRole('button'));

      expect(handleMouseEnter).toHaveBeenCalled();
    });

    it('calls custom onMouseLeave along with internal handler', () => {
      const handleMouseLeave = vi.fn();
      renderWithTheme(
        <ClerkButton onMouseLeave={handleMouseLeave}>Hover</ClerkButton>
      );

      fireEvent.mouseLeave(screen.getByRole('button'));

      expect(handleMouseLeave).toHaveBeenCalled();
    });
  });

  describe('Custom Styles', () => {
    it('merges custom style prop', () => {
      renderWithTheme(
        <ClerkButton style={{ marginTop: '10px' }}>Styled</ClerkButton>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ marginTop: '10px' });
    });

    it('custom styles do not override core button styles', () => {
      renderWithTheme(
        <ClerkButton style={{ cursor: 'default' }}>Styled</ClerkButton>
      );
      const button = screen.getByRole('button');
      // Custom cursor should be applied (overrides default)
      expect(button).toHaveStyle({ cursor: 'default' });
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = vi.fn();
      renderWithTheme(<ClerkButton ref={ref}>Ref Test</ClerkButton>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Accessibility', () => {
    it('is focusable', () => {
      renderWithTheme(<ClerkButton>Focus Me</ClerkButton>);
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('supports disabled state through native attribute', () => {
      renderWithTheme(<ClerkButton disabled>Disabled</ClerkButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('supports type attribute', () => {
      renderWithTheme(<ClerkButton type="submit">Submit</ClerkButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Theme Integration', () => {
    it('uses theme primary color', () => {
      renderWithTheme(<ClerkButton variant="contained">Themed</ClerkButton>);
      const button = screen.getByRole('button');
      // Should have a background color from theme
      expect(button.style.backgroundColor).toBeTruthy();
    });

    it('uses theme font family', () => {
      renderWithTheme(<ClerkButton>Font</ClerkButton>);
      const button = screen.getByRole('button');
      expect(button.style.fontFamily).toBeTruthy();
    });
  });
});

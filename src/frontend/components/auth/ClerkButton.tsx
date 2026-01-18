'use client';

import { forwardRef, useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';

interface ClerkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

const ClerkButton = forwardRef<HTMLButtonElement, ClerkButtonProps>(
  ({ variant = 'contained', size = 'medium', fullWidth = false, children, style, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const theme = useTheme();
    const [isHovered, setIsHovered] = useState(false);

    const baseStyles: React.CSSProperties = {
      fontFamily: theme.typography.fontFamily,
      fontWeight: 500,
      borderRadius: '4px',
      cursor: 'pointer',
      textTransform: 'uppercase',
      letterSpacing: '0.02857em',
      transition: 'background-color 250ms, box-shadow 250ms, border-color 250ms',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: fullWidth ? '100%' : 'auto',
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      small: { padding: '4px 10px', fontSize: '0.8125rem' },
      medium: { padding: '6px 16px', fontSize: '0.875rem' },
      large: { padding: '8px 22px', fontSize: '0.9375rem' },
    };

    const getVariantStyles = (): React.CSSProperties => {
      switch (variant) {
        case 'contained':
          return {
            backgroundColor: isHovered ? theme.palette.primary.dark : theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            border: 'none',
            boxShadow: isHovered
              ? '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)'
              : '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
          };
        case 'outlined':
          return {
            backgroundColor: isHovered ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
            color: theme.palette.primary.main,
            border: `1px solid ${isHovered ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.5)}`,
          };
        case 'text':
          return {
            backgroundColor: isHovered ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
            color: theme.palette.primary.main,
            border: 'none',
          };
        default:
          return {};
      }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(true);
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(false);
      onMouseLeave?.(e);
    };

    return (
      <button
        ref={ref}
        style={{
          ...baseStyles,
          ...sizeStyles[size],
          ...getVariantStyles(),
          ...style,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ClerkButton.displayName = 'ClerkButton';

export default ClerkButton;

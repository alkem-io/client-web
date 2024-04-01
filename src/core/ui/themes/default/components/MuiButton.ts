import { Components, Theme } from '@mui/material/styles';
import { ButtonProps } from '@mui/material';

const getFocusVisibleStyle = (
  theme: Theme,
  { color, variant }: { color?: ButtonProps['color']; variant?: ButtonProps['variant'] }
) => {
  if (color === 'primary' && variant === 'contained') {
    return {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.highlight.main,
    };
  }

  return {
    backgroundColor: theme.palette.highlight.main,
  };
};

const PADDING: Record<'small' | 'medium' | 'large', { x: number; y: number }> = {
  small: {
    y: 0,
    x: 1,
  },
  medium: {
    y: 0.5,
    x: 1.5,
  },
  large: {
    y: 1,
    x: 2,
  },
};

const MuiButton: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    root: ({ theme, ownerState }) => {
      const { size = 'medium', variant } = ownerState;

      const padding = PADDING[size];

      const borderWidth = variant === 'outlined' ? 0.1 : 0;

      return {
        display: 'inline-flex',
        width: 'auto',
        padding: theme.spacing(padding.y - borderWidth, padding.x),
        '&.Mui-focusVisible': getFocusVisibleStyle(theme, ownerState),
      };
    },
  },
  defaultProps: {
    disableRipple: true,
  },
};

export default MuiButton;

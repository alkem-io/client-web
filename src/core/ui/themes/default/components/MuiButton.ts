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

const MuiButton: Components<Theme>['MuiButton'] = {
  styleOverrides: {
    root: ({ theme, ownerState }) => ({
      display: 'inline-flex',
      width: 'auto',
      padding: theme.spacing(0.5, 1.5),
      '&.Mui-focusVisible': getFocusVisibleStyle(theme, ownerState),
    }),
  },
  defaultProps: {
    disableRipple: true,
  },
};

export default MuiButton;

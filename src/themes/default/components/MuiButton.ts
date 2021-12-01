import { alpha, Components, Theme } from '@mui/material/styles';

const MuiButton = (theme: Theme): Components['MuiButton'] | undefined => {
  if (!theme) {
    return undefined;
  }

  return {
    variants: [
      {
        props: { variant: 'contained', color: 'grey' },
        style: {
          color: theme.palette.getContrastText(theme.palette.grey[300]),
        },
      },
      {
        props: { variant: 'outlined', color: 'grey' },
        style: {
          color: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
          '&.Mui-disabled': {
            border: `1px solid ${theme.palette.action.disabledBackground}`,
          },
          '&:hover': {
            color: theme.palette.neutralLight.main,
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.7),
          },
        },
      },
      {
        props: { color: 'grey', variant: 'text' },
        style: {
          color: theme.palette.text.primary,
          '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, theme.palette.action.hoverOpacity),
          },
        },
      },
    ],

    styleOverrides: {
      root: {
        display: 'inline-flex',
        width: 'auto',
      },
    },
    defaultProps: {
      disableRipple: true,
    },
  };
};

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    grey: true;
  }
}

export default MuiButton;

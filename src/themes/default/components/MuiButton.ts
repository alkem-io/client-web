import { alpha, Components, Theme } from '@mui/material/styles';
import hexToRGBA from '../../../utils/hexToRGBA';

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
        padding: theme.spacing(1.5, 2),
        display: 'inline-flex',
        width: 'auto',
        flexDirection: 'row',
        borderRadius: theme.shape.borderRadius,
        borderWidth: 1,
        transition: 'background-color 0.5s ease-out',
        borderStyle: 'double',
        fontWeight: 700,

        '&.inset': {
          borderRightColor: 'transparent',
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRadius: 0,
        },
        '&.small': {
          padding: theme.spacing(0.5, 1),
        },

        '&.block': {
          display: 'block',
          width: '100%',
        },

        '&:hover': {
          textDecoration: 'none',
        },
        '&:focus': {
          outline: 'none',
        },
      },
      outlinedPrimary: {
        padding: theme.spacing(1.5, 2),
        color: theme.palette.neutralLight.main,
        borderColor: theme.palette.primary.main,
        background: theme.palette.primary.main,

        '&:hover': {
          color: theme.palette.neutralLight.main,

          backgroundColor: hexToRGBA(theme.palette.primary.main, 0.7),
        },

        '&.inset': {
          borderColor: theme.palette.neutralLight.main,
          borderRightColor: 'transparent',
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',

          '&:hover': {
            color: theme.palette.primary.main,
            background: theme.palette.background.paper,
            cursor: 'pointer',
          },

          '&:focus': {
            outline: 'none',
          },
        },
      },
      outlined: {
        padding: theme.spacing(1.5, 2),
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        background: theme.palette.background.paper,

        '&:hover': {
          color: theme.palette.neutralLight.main,
          background: theme.palette.primary.main,
        },

        '&:focus': {
          outline: `1px auto ${theme.palette.primary.main}`,

          '&.inset': {
            outline: 'none',
          },
        },
      },
    },
  };
};

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    grey: true;
  }
}

export default MuiButton;

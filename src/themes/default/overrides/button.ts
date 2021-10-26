import { Theme } from '@material-ui/core';
import { Overrides } from '@material-ui/core/styles/overrides';
import hexToRGBA from '../../../utils/hexToRGBA';

const buttonOverrides = (theme: Theme): Overrides | undefined => {
  if (!theme) {
    return undefined;
  }

  return {
    MuiButton: {
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
      label: { lineHeight: 1.5 },
    },
    MuiButtonBase: {
      root: {
        '&$disabled': {
          color: theme.palette.background.paper,
          borderColor: theme.palette.neutralLight.main,
          background: theme.palette.neutralLight.main,
          opacity: 0.8,
          cursor: 'default',

          '&:hover': {
            color: theme.palette.background.paper,
            background: hexToRGBA(theme.palette.neutralMedium.main, 0.7),
            cursor: 'not-allowed',
          },

          '&:focus': {
            '&.inset': {
              outline: 'none',
            },
          },
        },
      },
    },
  };
};
export default buttonOverrides;

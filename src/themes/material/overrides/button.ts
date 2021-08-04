import { Overrides } from '@material-ui/core/styles/overrides';
import { defaultPalette, defaultShape } from '../../defaults';
import hexToRGBA from '../../../utils/hexToRGBA';

export const buttonOverrides: Overrides = {
  MuiButton: {
    root: {
      padding: `${defaultShape.spacing(1.5)}px ${defaultShape.spacing(2)}px`,
      display: 'inline-flex',
      width: 'auto',
      flexDirection: 'row',
      borderRadius: defaultShape.borderRadius,
      borderWidth: 1,
      transition: 'background-color 0.5s ease-out',
      borderStyle: 'double',

      '&.inset': {
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRadius: 0,
      },
      '&.small': {
        padding: `${defaultShape.spacing(0.5)}px ${defaultShape.spacing(1)}px`,
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
      padding: `${defaultShape.spacing(1.5)}px ${defaultShape.spacing(2)}px`,
      color: defaultPalette.neutralLight,
      borderColor: defaultPalette.primary,
      background: defaultPalette.primary,

      '&:hover': {
        color: defaultPalette.neutralLight,
        backgroundColor: hexToRGBA(defaultPalette.primary, 0.7),
      },

      '&.inset': {
        borderColor: defaultPalette.neutralLight,
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',

        '&:hover': {
          color: defaultPalette.primary,
          background: defaultPalette.background,
          cursor: 'pointer',
        },

        '&:focus': {
          outline: 'none',
        },
      },
    },
    outlined: {
      padding: `${defaultShape.spacing(1.5)}px ${defaultShape.spacing(2)}px`,
      color: defaultPalette.primary,
      borderColor: defaultPalette.primary,
      background: defaultPalette.background,

      '&:hover': {
        color: defaultPalette.neutralLight,
        background: defaultPalette.primary,
      },

      '&:focus': {
        outline: `1px auto ${defaultPalette.primary}`,

        '&.inset': {
          outline: 'none',
        },
      },
    },
  },
  MuiButtonBase: {
    root: {
      '&$disabled': {
        color: defaultPalette.background,
        borderColor: defaultPalette.neutralLight,
        background: defaultPalette.neutralMedium,
        opacity: 0.8,
        cursor: 'default',

        '&:hover': {
          color: defaultPalette.background,
          background: hexToRGBA(defaultPalette.neutralMedium, 0.7),
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

import { Overrides } from '@material-ui/core/styles/overrides';
import { SimplePaletteColorOptions, ThemeOptions } from '@material-ui/core';
import { TypeBackground } from '@material-ui/core/styles/createPalette';
import hexToRGBA from '../../../utils/hexToRGBA';

export const buttonOverrides = (theme: ThemeOptions): Overrides | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    MuiButton: {
      root: {
        padding: `${(theme?.spacing as Function)(1.5)}px ${(theme?.spacing as Function)(2)}px`,
        display: 'inline-flex',
        width: 'auto',
        flexDirection: 'row',
        borderRadius: theme?.shape?.borderRadius,
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
          padding: `${(theme?.spacing as Function)(0.5)}px ${(theme?.spacing as Function)(1)}px`,
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
        padding: `${(theme?.spacing as Function)(1.5)}px ${(theme?.spacing as Function)(2)}px`,
        color: (theme?.palette?.neutralLight as SimplePaletteColorOptions)?.main,
        borderColor: (theme?.palette?.primary as SimplePaletteColorOptions)?.main,
        background: (theme?.palette?.primary as SimplePaletteColorOptions)?.main,

        '&:hover': {
          color: (theme?.palette?.neutralLight as SimplePaletteColorOptions)?.main,
          backgroundColor: hexToRGBA((theme?.palette?.primary as SimplePaletteColorOptions)?.main, 0.7),
        },

        '&.inset': {
          borderColor: (theme?.palette?.neutralLight as SimplePaletteColorOptions)?.main,
          borderRightColor: 'transparent',
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',

          '&:hover': {
            color: (theme?.palette?.primary as SimplePaletteColorOptions)?.main,
            background: (theme?.palette?.background as TypeBackground)?.paper,
            cursor: 'pointer',
          },

          '&:focus': {
            outline: 'none',
          },
        },
      },
      outlined: {
        padding: `${(theme?.spacing as Function)(1.5)}px ${(theme?.spacing as Function)(2)}px`,
        color: (theme?.palette?.primary as SimplePaletteColorOptions)?.main,
        borderColor: (theme?.palette?.primary as SimplePaletteColorOptions)?.main,
        background: (theme?.palette?.background as TypeBackground)?.paper,

        '&:hover': {
          color: (theme?.palette?.neutralLight as SimplePaletteColorOptions)?.main,
          background: (theme?.palette?.primary as SimplePaletteColorOptions)?.main,
        },

        '&:focus': {
          outline: `1px auto ${(theme?.palette?.primary as SimplePaletteColorOptions)?.main}`,

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
          color: (theme?.palette?.background as TypeBackground)?.paper,
          borderColor: (theme?.palette?.neutralLight as SimplePaletteColorOptions)?.main,
          background: (theme?.palette?.neutralLight as SimplePaletteColorOptions)?.main,
          opacity: 0.8,
          cursor: 'default',

          '&:hover': {
            color: (theme?.palette?.background as TypeBackground)?.paper,
            background: hexToRGBA((theme?.palette?.neutralMedium as SimplePaletteColorOptions)?.main, 0.7),
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

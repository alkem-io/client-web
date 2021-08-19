import { createTheme, SimplePaletteColorOptions, ThemeOptions } from '@material-ui/core';
import { paletteOptions } from './palette';
import { typographyOptions } from './typography';
import { buttonOverrides } from './overrides/button';

const space = 10;

export const theme: ThemeOptions = {
  palette: paletteOptions,
  typography: typographyOptions,
  shape: { borderRadius: 5 },
  space: space,
  spacing: times => times * space,
  breakpoints: {
    values: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
    },
  },
  earlyAccessAlert: { height: 40 },
  sidebar: {
    maxWidth: 280,
    minWidth: 90,
  },
  props: {
    MuiButtonBase: {
      disableRipple: true, // No more ripple, on the whole application!
    },
  },
};

theme.overrides = {
  ...theme.overrides,
  ...buttonOverrides(theme),
  MuiDialogContent: {
    dividers: {
      borderTopColor: (theme?.palette?.neutralMedium as SimplePaletteColorOptions).main,
      borderBottomColor: (theme?.palette?.neutralMedium as SimplePaletteColorOptions).main,
    },
  },
};

declare module '@material-ui/core/styles/createTheme' {
  interface Theme {
    space: number;
    sidebar: {
      maxWidth: number;
      minWidth: number;
    };
    earlyAccessAlert: {
      height: number;
    };
  }
  interface ThemeOptions {
    space: number;
    sidebar: {
      maxWidth: number;
      minWidth: number;
    };
    earlyAccessAlert: {
      height: number;
    };
  }
}

export const defaultTheme = createTheme(theme);

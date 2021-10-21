import { createTheme, ThemeOptions } from '@material-ui/core';
import { paletteOptions } from './palette';
import { typographyOptions } from './typography';
import buttonOverrides from './overrides/button';
import dialogOverrides from './overrides/dialog';
import chipOverrides from './overrides/chip';
import iconOverrides from './overrides/icon';
import cardOverrides from './overrides/card';

export const theme: ThemeOptions = {
  palette: paletteOptions,
  typography: typographyOptions,
  shape: { borderRadius: 5 },
  spacing: 10,
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

const currentTheme = createTheme(theme);

theme.overrides = {
  ...currentTheme.overrides,
  ...buttonOverrides(currentTheme),
  ...dialogOverrides(currentTheme),
  ...chipOverrides(currentTheme),
  ...iconOverrides(currentTheme),
  ...cardOverrides(currentTheme),
};

declare module '@material-ui/core/styles/createTheme' {
  interface Theme {
    sidebar: {
      maxWidth: number;
      minWidth: number;
    };
    earlyAccessAlert: {
      height: number;
    };
  }
  interface ThemeOptions {
    sidebar?: {
      maxWidth?: number;
      minWidth?: number;
    };
    earlyAccessAlert?: {
      height?: number;
    };
  }
}

export const defaultTheme = createTheme(theme);

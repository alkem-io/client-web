import { createTheme } from '@mui/material';
import { ThemeOptions } from '@mui/material/styles';
import componentsOverride from './components';
import { paletteOptions } from './palette';
import { typographyOptions } from './typography';

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
};

const defaultMUITheme = createTheme(theme);
theme.components = componentsOverride(defaultMUITheme);

declare module '@mui/material/styles' {
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

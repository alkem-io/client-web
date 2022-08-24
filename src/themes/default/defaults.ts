import { createTheme } from '@mui/material';
import { ThemeOptions } from '@mui/material/styles';
import componentsOverride from './components';
import { paletteOptions } from './palette';
import { typographyOptions } from './typography';
import type {} from '@mui/lab/themeAugmentation';

export const theme: ThemeOptions = {
  palette: paletteOptions,
  typography: typographyOptions,
  shape: { borderRadius: 4 },
  spacing: 8,
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
  cards: {
    simpleCard: {
      width: 32,
      height: 18,
    },
    contributionCard: {
      width: 32,
      height: 18,
    },
  },
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
    cards: {
      simpleCard: {
        width: number;
        height: number;
      };
      contributionCard: {
        width: number;
        height: number;
      };
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
    cards: {
      simpleCard: {
        width: number;
        height: number;
      };
      contributionCard: {
        width: number;
        height: number;
      };
    };
  }
}

declare module '@mui/material' {
  interface Color {
    main: string;
    dark: string;
  }
}

export const defaultTheme = createTheme(theme);

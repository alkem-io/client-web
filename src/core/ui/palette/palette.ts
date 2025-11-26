import { PaletteColor, PaletteColorOptions, PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const COLOR_POSITIVE_CONTAINER = '#CDE7ED';
const COLOR_DIVIDER = '#D3D3D3';

export const paletteOptions: PaletteOptions = {
  primary: { main: '#1D384A' },
  secondary: { main: '#2f3434ff' },
  muted: { main: '#A8A8A8', contrastText: '#595959' },
  text: {
    primary: '#181828',
  },
  positive: { main: '#00D4B4' },
  negative: { main: '#D32F2F' },
  neutral: { main: '#181828', light: '#646464' },
  neutralMedium: {
    light: grey[200],
    main: grey[500],
    dark: grey[600],
  },
  neutralLight: { main: '#F9F9F9' },
  background: { default: '#F1F4F5', paper: '#FFFFFF' },
  divider: COLOR_DIVIDER,
  mode: 'light',
  grey: {
    main: grey[300],
    dark: grey[400],
  },
  highlight: {
    main: COLOR_POSITIVE_CONTAINER,
    dark: '#1D384A',
    contrastText: '#1D384A',
    light: '#DEEFF6',
  },
  space: {
    dark: '#152A37',
  },
  icons: {
    dark: '#1C1B1F',
  },
  markdownTable: {
    border: COLOR_DIVIDER,
    borderCollapse: 'collapse',
    headerBackground: '#FFFFFF',
    rowBackgroundEven: '#FAFAFA',
    rowBackgroundOdd: '#FFFFFF',
  },
};

declare module '@mui/material/styles/createPalette' {
  interface PaletteOptions {
    positive: PaletteColorOptions;
    negative: PaletteColorOptions;
    neutral: PaletteColorOptions;
    muted: PaletteColorOptions;
    neutralMedium: PaletteColorOptions;
    neutralLight: PaletteColorOptions;
    highlight: PaletteColorOptions;
    space: PaletteColorOptions;
    icons: PaletteColorOptions;
    markdownTable: {
      border: string;
      borderCollapse: string;
      headerBackground: string;
      rowBackgroundEven: string;
      rowBackgroundOdd: string;
    };
  }

  interface Palette {
    positive: PaletteColor;
    negative: PaletteColor;
    neutral: PaletteColor;
    muted: PaletteColor;
    neutralMedium: PaletteColor;
    neutralLight: PaletteColor;
    highlight: PaletteColor;
    space: PaletteColor;
    icons: PaletteColor;
    markdownTable: {
      border: string;
      borderCollapse: string;
      headerBackground: string;
      rowBackgroundEven: string;
      rowBackgroundOdd: string;
    };
  }
}

import { PaletteColor, PaletteColorOptions, PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const COLOR_POSITIVE_CONTAINER = '#CDE7ED';

export const paletteOptions: PaletteOptions = {
  primary: { main: '#1D384A' },
  secondary: { main: '#00a88f' },
  muted: { main: '#A8A8A8' },
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
  divider: '#D3D3D3',
  mode: 'light',
  grey: {
    main: grey[300],
    dark: grey[400],
  },
  highlight: {
    main: COLOR_POSITIVE_CONTAINER,
    dark: '#09BCD4',
    contrastText: '#1D384A',
    light: '#DEEFF6',
  },
  space: {
    dark: '#152A37',
  },
  icons: {
    dark: '#1C1B1F',
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
    icons: PaletteColorOptions;
  }
}

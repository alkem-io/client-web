import { PaletteColor, PaletteColorOptions, PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

const COLOR_POSITIVE_CONTAINER = '#CDE7ED';

export const COLOR_HUB = '#1D384A';

export const paletteOptions: PaletteOptions = {
  primary: { main: '#065F6B' },
  secondary: { main: '#00a88f' },
  muted: { main: '#A8A8A8' },
  text: {
    primary: '#000000',
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
    contrastText: '#1D384A',
    light: '#DEEFF6',
  },
  space: {
    main: '#1D384A',
  },
  challenge: {
    main: '#065F6B',
  },
  opportunity: {
    main: '#A2D2DB',
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
    challenge: PaletteColorOptions;
    opportunity: PaletteColorOptions;
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
    challenge: PaletteColor;
    opportunity: PaletteColor;
  }
}

import { PaletteColor, PaletteColorOptions, PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

export const paletteOptions: PaletteOptions = {
  primary: { main: '#068293' },
  secondary: { main: '#00a88f' },
  text: {
    primary: '#181828',
  },
  positive: { main: '#00D4B4' },
  negative: { main: '#D40062' },
  neutral: { main: '#181828' },
  neutralMedium: {
    light: grey[200],
    main: grey[500],
    dark: grey[600],
  },
  neutralLight: { main: '#F9F9F9' },
  background: { default: '#ffffff', paper: '#F9F9F9' },
  divider: '#00BCD440',
  mode: 'light',
  grey: {
    main: grey[300],
    dark: grey[400],
  },
};

declare module '@mui/material/styles/createPalette' {
  interface PaletteOptions {
    positive: PaletteColorOptions;
    negative: PaletteColorOptions;
    neutral: PaletteColorOptions;
    neutralMedium: PaletteColorOptions;
    neutralLight: PaletteColorOptions;
  }
  interface Palette {
    positive: PaletteColor;
    negative: PaletteColor;
    neutral: PaletteColor;
    neutralMedium: PaletteColor;
    neutralLight: PaletteColor;
  }
}

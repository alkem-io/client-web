import { PaletteColor, PaletteColorOptions, PaletteOptions } from '@mui/material/styles';

export const paletteOptions: PaletteOptions = {
  primary: { main: '#00BCD4' },
  positive: { main: '#00D4B4' },
  negative: { main: '#D40062' },
  neutral: { main: '#181828' },
  neutralMedium: { main: '#B8BAC8' },
  neutralLight: { main: '#F9F9F9' },
  background: { paper: '#FFF' },
  divider: '#00BCD440',
  mode: 'light',
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

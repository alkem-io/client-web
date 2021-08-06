import { PaletteColor, PaletteColorOptions, PaletteOptions } from '@material-ui/core/styles/createPalette';

export const paletteOptions: PaletteOptions = {
  primary: { main: '#00BCD4' },
  positive: { main: '#00D4B4' },
  negative: { main: '#D40062' },
  neutral: { main: '#181828' },
  neutralMedium: { main: '#B8BAC8' },
  neutralLight: { main: '#F9F9F9' },
  background: { paper: '#F9F9F9' },
  divider: '#00BCD440',
};

declare module '@material-ui/core/styles/createPalette' {
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

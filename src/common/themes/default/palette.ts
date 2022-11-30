import { PaletteColor, PaletteColorOptions, PaletteOptions } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

export const paletteOptions: PaletteOptions = {
  primary: { main: '#068293' },
  primaryDark: { main: '#1D384A', contrastText: '#fff' },
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
  divider: grey[400],
  mode: 'light',
  grey: {
    main: grey[300],
    dark: grey[400],
  },
  highlight: {
    main: '#DEEFF6',
    contrastText: '#1D384A',
  },
  hub: {
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
    primaryDark: PaletteColorOptions;
    positive: PaletteColorOptions;
    negative: PaletteColorOptions;
    neutral: PaletteColorOptions;
    neutralMedium: PaletteColorOptions;
    neutralLight: PaletteColorOptions;
    highlight: PaletteColorOptions;
    hub: PaletteColorOptions;
    challenge: PaletteColorOptions;
    opportunity: PaletteColorOptions;
  }
  interface Palette {
    primaryDark: PaletteColor;
    positive: PaletteColor;
    negative: PaletteColor;
    neutral: PaletteColor;
    neutralMedium: PaletteColor;
    neutralLight: PaletteColor;
    highlight: PaletteColor;
    hub: PaletteColor;
    challenge: PaletteColor;
    opportunity: PaletteColor;
  }
}

// Taken from https://mui.com/material-ui/customization/palette/
// But does not seem to work
declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    primaryDark: true;
    hub: true;
  }
}

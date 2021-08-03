import { Breakpoints, EarlyAccessAlert, Media, Palette, Shape, Sidebar, Theme, Typography } from './theme';

export const defaultEarlyAccessAlert: EarlyAccessAlert = {
  height: 40,
};

export const defaultPalette: Palette = {
  primary: '#00BCD4',
  positive: '#00D4B4',
  negative: '#D40062',
  neutral: '#181828',
  neutralMedium: '#B8BAC8',
  neutralLight: '#F9F9F9',
  background: '#FFFFFF',
  divider: '#00BCD440',
};

export const monserrat = '"MONTSERRAT"';
export const sourceSansPro = '"Source Sans Pro"';

export const defaultTypography: Typography = {
  caption: { font: monserrat, size: 12 },
  button: { font: monserrat, size: 14 },
  body: { font: sourceSansPro, size: 16 },
  h5: { font: sourceSansPro, size: 18 },
  h4: { font: monserrat, size: 22 },
  h3: { font: sourceSansPro, size: 24 },
  h2: { font: monserrat, size: 36 },
  h1: { font: monserrat, size: 48 },
};

export const defaultShape: Shape = {
  borderRadius: 5,
  space: 10,
  spacing: function (times) {
    return times * this.space;
  },
};

// as defined in bootstrap
export const defaultMedia: Media = {
  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
  },
  up: function (key: keyof Breakpoints) {
    return `@media (min-width: ${this.breakpoints[key]}px)`;
  },
  down: function (key: keyof Breakpoints) {
    return `@media (max-width: ${this.breakpoints[key]}px)`;
  },
};

export const defaultSidebar: Sidebar = {
  maxWidth: 280,
  minWidth: 90,
};

export const defaultTheme: Theme = {
  palette: defaultPalette,
  typography: defaultTypography,
  shape: defaultShape,
  media: defaultMedia,
  sidebar: defaultSidebar,
  earlyAccessAlert: defaultEarlyAccessAlert,
};

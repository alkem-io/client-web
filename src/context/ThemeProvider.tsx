import { createMuiTheme, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import React, { FC } from 'react';

export interface Palette {
  primary: string;
  positive: string;
  negative: string;
  neutralLight: string;
  neutralMedium: string;
  neutral: string;
  divider: string;
  background: string;
}

export interface TextDefinition {
  font: string;
  size: number;
}

export interface Typography {
  h1: TextDefinition;
  h2: TextDefinition;
  h3: TextDefinition;
  h4: TextDefinition;
  h5: TextDefinition;
  caption: TextDefinition;
  body: TextDefinition;
  button: TextDefinition;
}

export interface Shape {
  borderRadius: number;
  space: number;
  spacing: (x: number) => number;
}

export interface Sidebar {
  maxWidth: number;
  minWidth: number;
}

export interface EarlyAccessAlert {
  height: number;
}

export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface Media {
  breakpoints: Breakpoints;
  up: (val: keyof Breakpoints) => string;
  down: (val: keyof Breakpoints) => string;
}

export interface Theme {
  palette: Palette;
  typography: Typography;
  shape: Shape;
  media: Media;
  sidebar: Sidebar;
  earlyAccessAlert: EarlyAccessAlert;
}

const defaultPalette: Palette = {
  primary: '#00BCD4',
  positive: '#00D4B4',
  negative: '#D40062',
  neutral: '#181828',
  neutralMedium: '#B8BAC8',
  neutralLight: '#F9F9F9',
  background: '#FFFFFF',
  divider: '#00BCD440',
};

const monserrat = '"MONTSERRAT"';
const sourceSansPro = '"Source Sans Pro"';

const defaultTypography: Typography = {
  caption: { font: monserrat, size: 12 },
  button: { font: monserrat, size: 14 },
  body: { font: sourceSansPro, size: 16 },
  h5: { font: sourceSansPro, size: 18 },
  h4: { font: monserrat, size: 22 },
  h3: { font: sourceSansPro, size: 24 },
  h2: { font: monserrat, size: 36 },
  h1: { font: monserrat, size: 48 },
};

const defaultShape: Shape = {
  borderRadius: 5,
  space: 10,
  spacing: function (times) {
    return times * this.space;
  },
};

// as defined in bootstrap
const defaultMedia: Media = {
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

const defaultSidebar: Sidebar = {
  maxWidth: 280,
  minWidth: 90,
};

const defaultEarlyAccessAlert: EarlyAccessAlert = {
  height: 40,
};

export const defaultTheme: Theme = {
  palette: defaultPalette,
  typography: defaultTypography,
  shape: defaultShape,
  media: defaultMedia,
  sidebar: defaultSidebar,
  earlyAccessAlert: defaultEarlyAccessAlert,
};

const defaultMuiTheme = createMuiTheme({
  palette: {
    primary: {
      main: defaultTheme.palette.primary,
    },
    background: {
      paper: defaultTheme.palette.neutralLight,
    },
  },
  typography: {
    fontFamily: '"MONTSERRAT"',
  },
  props: {
    MuiButtonBase: {
      disableRipple: true, // No more ripple, on the whole application!
    },
  },
});

const ThemeContext = React.createContext<Theme>(defaultTheme);

const ThemeProvider: FC<{}> = ({ children }) => {
  // can merge external configuration for the theme and pass it to the provider
  return (
    <ThemeContext.Provider value={defaultTheme}>
      <MuiThemeProvider theme={defaultMuiTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export { ThemeProvider, ThemeContext, defaultMuiTheme };

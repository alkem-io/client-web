import { StyledEngineProvider, Theme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import React, { FC } from 'react';
import { defaultTheme } from '../themes/default';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const ThemeProvider: FC<{}> = ({ children }) => {
  // can merge external configuration for the theme and pass it to the provider
  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={defaultTheme}>{children}</MuiThemeProvider>
    </StyledEngineProvider>
  );
};

export { ThemeProvider };

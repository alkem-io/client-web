import { createTheme, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import React, { FC } from 'react';
import { defaultTheme } from '../themes/default';

const ThemeProvider: FC<{}> = ({ children }) => {
  // can merge external configuration for the theme and pass it to the provider
  return <MuiThemeProvider theme={defaultTheme}>{children}</MuiThemeProvider>;
};

const ThemeProviderV2: FC<{}> = ({ children }) => {
  return (
    <MuiThemeProvider
      theme={theme =>
        createTheme({
          ...theme,
          spacing: 8,
        })
      }
    >
      {children}
    </MuiThemeProvider>
  );
};

export { ThemeProvider, ThemeProviderV2 };

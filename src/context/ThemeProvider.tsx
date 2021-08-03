import React, { FC } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { defaultTheme, Theme } from '../themes';
import { defaultMuiTheme } from '../themes/material';

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

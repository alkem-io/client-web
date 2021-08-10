import React, { FC } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { defaultTheme } from '../themes/default';

const ThemeProvider: FC<{}> = ({ children }) => {
  // can merge external configuration for the theme and pass it to the provider
  return <MuiThemeProvider theme={defaultTheme}>{children}</MuiThemeProvider>;
};

export { ThemeProvider };

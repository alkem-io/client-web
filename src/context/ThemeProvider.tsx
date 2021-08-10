import React, { FC } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { defaultMuiTheme } from '../themes/default';

const ThemeProvider: FC<{}> = ({ children }) => {
  // can merge external configuration for the theme and pass it to the provider
  return <MuiThemeProvider theme={defaultMuiTheme}>{children}</MuiThemeProvider>;
};

export { ThemeProvider };

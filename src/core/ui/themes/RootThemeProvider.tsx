import React, { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { theme } from './default/Theme';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const RootThemeProvider = ({ children }: PropsWithChildren<{}>) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default RootThemeProvider;

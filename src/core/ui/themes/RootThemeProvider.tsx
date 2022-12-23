import React, { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { defaultTheme } from './default/defaultTheme';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const RootThemeProvider = ({ children }: PropsWithChildren<{}>) => {
  return <ThemeProvider theme={defaultTheme}>{children}</ThemeProvider>;
};

export default RootThemeProvider;

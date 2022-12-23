import React, { FC } from 'react';
import { StyledEngineProvider, Theme } from '@mui/material/styles';
import DefaultThemed from './DefaultThemed';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const RootThemeProvider: FC<{}> = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <DefaultThemed>{children}</DefaultThemed>
    </StyledEngineProvider>
  );
};

export default RootThemeProvider;

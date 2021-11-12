import {
  createTheme,
  Theme,
  ThemeProvider as MuiThemeProvider,
  StyledEngineProvider,
  adaptV4Theme,
} from '@mui/material/styles';
import React, { FC } from 'react';
import { defaultTheme } from '../themes/default';
import { typographyOptionsV2 } from '../themes/defaultV2/typography';

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

const ThemeProviderV2: FC<{}> = ({ children }) => {
  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider
        theme={(theme: Theme) =>
          createTheme(
            adaptV4Theme({
              ...theme,
              spacing: 8,
              typography: {
                ...typographyOptionsV2,
              },
            })
          )
        }
      >
        {children}
      </MuiThemeProvider>
    </StyledEngineProvider>
  );
};

export { ThemeProvider, ThemeProviderV2 };

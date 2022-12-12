import React, { PropsWithChildren } from 'react';
import { Theme } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material';
import { identity } from 'lodash';

const swapColors = (theme: Theme): Theme => {
  const primaryColor = theme.palette.primary.main;
  const backgroundColor = theme.palette.background.paper;

  return createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      primary: {
        ...theme.palette.primary,
        main: backgroundColor,
      },
      background: {
        ...theme.palette.background,
        paper: primaryColor,
      },
      text: {
        primary: backgroundColor,
      },
    },
  });
};

interface SwapColorsProps {
  swap?: boolean;
}

const SwapColors = ({ swap = true, children }: PropsWithChildren<SwapColorsProps>) => {
  return <ThemeProvider theme={swap ? swapColors : identity}>{children}</ThemeProvider>;
};

export default SwapColors;

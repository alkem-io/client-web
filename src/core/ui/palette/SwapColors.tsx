import React, { PropsWithChildren } from 'react';
import { Theme } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material';
import { identity } from 'lodash';

const swapColors = (theme: Theme): Theme => {
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  const backgroundColorPaper = theme.palette.background.paper;
  const backgroundColorDefault = theme.palette.background.default;

  return createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      primary: {
        main: backgroundColorPaper,
      },
      secondary: {
        main: backgroundColorDefault,
      },
      background: {
        paper: primaryColor,
        default: secondaryColor,
      },
      text: {
        primary: backgroundColorPaper,
      },
    },
    components: {
      ...theme.components,
      MuiButton: {
        styleOverrides: {
          contained: {
            ':hover': {
              backgroundColor: theme.palette.highlight.main,
            },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '&.Mui-focusVisible': {
              backgroundColor: theme.palette.highlight.main,
              color: theme.palette.highlight.contrastText,
              '.MuiListItemIcon-root': {
                color: theme.palette.highlight.contrastText,
              },
              '.MuiListItemText-root': {
                color: theme.palette.highlight.contrastText,
              },
            },
            '&:focus-visible': {
              backgroundColor: theme.palette.highlight.main,
              color: theme.palette.highlight.contrastText,
              outline: `2px solid ${theme.palette.highlight.light}`,
              outlineOffset: '-2px',
            },
          },
        },
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

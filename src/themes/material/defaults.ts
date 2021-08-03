import { createTheme } from '@material-ui/core';
import { paletteOptions } from './palette';
import { typographyOptions } from './typography';

export const defaultMuiTheme = createTheme({
  palette: paletteOptions,
  typography: typographyOptions,
  overrides: {},
  props: {
    MuiButtonBase: {
      disableRipple: true, // No more ripple, on the whole application!
    },
  },
});

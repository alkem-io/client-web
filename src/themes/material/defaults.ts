import { createTheme } from '@material-ui/core';
import { paletteOptions } from './palette';
import { typographyOptions } from './typography';
import { buttonOverrides } from './overrides';
import { defaultShape } from '../defaults';

export const defaultMuiTheme = createTheme({
  palette: paletteOptions,
  typography: typographyOptions,
  shape: {
    borderRadius: defaultShape.borderRadius,
  },
  spacing: times => times * 10,
  overrides: {
    ...buttonOverrides,
  },
  props: {
    MuiButtonBase: {
      disableRipple: true, // No more ripple, on the whole application!
    },
  },
});

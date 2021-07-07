import { createMuiTheme } from '@material-ui/core/styles';
import { defaultTheme } from '../context/ThemeProvider';

export const defaultMuiTheme = createMuiTheme({
  palette: {
    primary: {
      main: defaultTheme.palette.primary,
    },
  },
  typography: {
    fontFamily: '"MONTSERRAT"',
  },
  props: {
    MuiButtonBase: {
      disableRipple: true, // No more ripple, on the whole application!
    },
  },
});

import { PaletteOptions } from '@material-ui/core/styles/createPalette';
import { defaultPalette } from '../defaults';

// todo: how to insert the rest of the palette here?
export const paletteOptions: PaletteOptions = {
  primary: {
    main: defaultPalette.primary,
  },
  secondary: {
    main: defaultPalette.neutralMedium,
  },
  success: {
    main: defaultPalette.positive,
  },
  error: {
    main: defaultPalette.negative,
  },
  background: {
    paper: defaultPalette.neutralLight,
  },
  divider: defaultPalette.divider,
};

import { PaletteOptions } from '@material-ui/core/styles/createPalette';
import { defaultPalette } from '../defaults';

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

import { SimplePaletteColorOptions, ThemeOptions } from '@material-ui/core';
import { Overrides } from '@material-ui/core/styles/overrides';

const dialogOverrides = (theme: ThemeOptions): Overrides | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    MuiDialogContent: {
      dividers: {
        borderTopColor: (theme?.palette?.neutralMedium as SimplePaletteColorOptions).main,
        borderBottomColor: (theme?.palette?.neutralMedium as SimplePaletteColorOptions).main,
      },
    },
  };
};
export default dialogOverrides;

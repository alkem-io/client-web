import { emphasize, SimplePaletteColorOptions, ThemeOptions } from '@material-ui/core';
import { Overrides } from '@material-ui/core/styles/overrides';

const chipOverrides = (theme: ThemeOptions): Overrides | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    MuiChip: {
      colorPrimary: {
        color: (theme?.palette?.neutralLight as SimplePaletteColorOptions).main,
        fontWeight: 'bold',
      },
      deleteIconColorPrimary: {
        color: (theme?.palette?.neutralLight as SimplePaletteColorOptions).main,

        '&:hover': {
          // coefficient from material UI code base for hover effects
          color: emphasize((theme?.palette?.neutralLight as SimplePaletteColorOptions).main, 0.08),
        },
      },
    },
  };
};
export default chipOverrides;

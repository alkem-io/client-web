import { ThemeOptions } from '@material-ui/core';
import { Overrides } from '@material-ui/core/styles/overrides';

const iconOverrides = (theme: ThemeOptions): Overrides | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    MuiIcon: {
      fontSizeSmall: { fontSize: 24 },
      fontSizeLarge: { fontSize: 36 },
    },
  };
};
export default iconOverrides;

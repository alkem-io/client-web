import { emphasize, Theme } from '@material-ui/core';
import { Overrides } from '@material-ui/core/styles/overrides';

const chipOverrides = (theme: Theme): Overrides | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    MuiChip: {
      colorPrimary: {
        color: theme.palette.neutralLight.main,
        fontWeight: 'bold',
      },
      deleteIconColorPrimary: {
        color: theme.palette.neutralLight.main,

        '&:hover': {
          // coefficient from material UI code base for hover effects
          color: emphasize(theme.palette.neutralLight.main, 0.08),
        },
      },
    },
  };
};
export default chipOverrides;

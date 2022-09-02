import { Components, Theme } from '@mui/material/styles';
import type {} from '@mui/lab/themeAugmentation';

const MuiTabPanel = (theme: Theme): Components['MuiTabPanel'] | undefined => {
  if (!theme) {
    return undefined;
  }

  return {
    styleOverrides: {
      root: {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
  };
};
export default MuiTabPanel;

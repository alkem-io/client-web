import { Components, Theme } from '@mui/material/styles';
const MuiButtonBase = (theme: Theme): Components['MuiButtonBase'] | undefined => {
  if (!theme) {
    return undefined;
  }

  return {
    defaultProps: {
      disableRipple: true,
    },
  };
};
export default MuiButtonBase;

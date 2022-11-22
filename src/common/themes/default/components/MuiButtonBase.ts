import { Components, Theme } from '@mui/material/styles';
const MuiButtonBase = (_theme: Theme): Components['MuiButtonBase'] | undefined => {
  return {
    defaultProps: {
      disableRipple: true,
    },
  };
};
export default MuiButtonBase;

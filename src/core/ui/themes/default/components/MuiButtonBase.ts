import { Components, Theme } from '@mui/material/styles';

const MuiButtonBase = (_theme: Theme): Components['MuiButtonBase'] => {
  return {
    defaultProps: {
      disableRipple: true,
    },
  };
};

export default MuiButtonBase;

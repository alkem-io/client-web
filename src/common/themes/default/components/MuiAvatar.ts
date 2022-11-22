import { Components, Theme } from '@mui/material/styles';

const MuiAvatar = (_theme: Theme): Components['MuiAvatar'] => {
  return {
    defaultProps: {
      variant: 'rounded',
    },
  };
};

export default MuiAvatar;

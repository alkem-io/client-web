import { Components, Theme } from '@mui/material/styles';

const MuiAvatar = (theme: Theme): Components['MuiAvatar'] | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    defaultProps: {
      variant: 'rounded',
    },
  };
};
export default MuiAvatar;

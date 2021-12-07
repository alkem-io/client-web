import { Components, Theme } from '@mui/material/styles';

const MuiSkeleton = (theme: Theme): Components['MuiSkeleton'] | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    defaultProps: {
      animation: 'wave',
    },
  };
};
export default MuiSkeleton;

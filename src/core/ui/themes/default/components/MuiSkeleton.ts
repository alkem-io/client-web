import { Components, Theme } from '@mui/material/styles';

const MuiSkeleton = (_theme: Theme): Components['MuiSkeleton'] => {
  return {
    defaultProps: {
      animation: 'wave',
    },
  };
};

export default MuiSkeleton;

import { Components, Theme } from '@mui/material/styles';

const MuiTooltip = (_theme: Theme): Components['MuiTooltip'] | undefined => {
  return {
    defaultProps: {
      arrow: true,
    },
  };
};
export default MuiTooltip;

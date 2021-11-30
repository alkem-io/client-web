import { Components, Theme } from '@mui/material/styles';

const MuiTooltip = (theme: Theme): Components['MuiTooltip'] | undefined => {
  if (!theme) {
    return undefined;
  }

  return {
    defaultProps: {
      arrow: true,
    },
  };
};
export default MuiTooltip;

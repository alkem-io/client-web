import { Components } from '@mui/material/styles';

const MuiTab: Components['MuiTab'] = {
  styleOverrides: {
    root: {
      padding: 0,
      minWidth: 'auto',
      minHeight: 48,
    },
    textColorInherit: {
      opacity: 1,
    },
  },
  defaultProps: {
    color: 'inherit',
  },
};

export default MuiTab;

import { Components } from '@mui/material/styles';
import type {} from '@mui/lab/themeAugmentation';

const MuiTabPanel: Components['MuiTabPanel'] = {
  styleOverrides: {
    root: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
};

export default MuiTabPanel;

import { Components } from '@mui/material/styles';

const MuiPaper: Components['MuiPaper'] = {
  styleOverrides: {
    rounded: {
      overflow: 'hidden',
    },
  },
};

export default MuiPaper;

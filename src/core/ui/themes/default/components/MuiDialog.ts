import { Components } from '@mui/material/styles';

const MuiDialog: Components['MuiDialog'] = {
  styleOverrides: {
    paper: {
      minHeight: '100px',
    },
  },
};

export default MuiDialog;

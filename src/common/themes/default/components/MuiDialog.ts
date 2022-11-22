import { Components, Theme } from '@mui/material/styles';

const MuiDialog = (_theme: Theme): Components['MuiDialog'] => {
  return {
    styleOverrides: {
      paper: {
        minHeight: '100px',
      },
    },
  };
};

export default MuiDialog;

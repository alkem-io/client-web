import { Components, Theme } from '@mui/material/styles';

const MuiDialog = (_theme: Theme): Components['MuiDialog'] | undefined => {
  return {
    styleOverrides: {
      paper: {
        minHeight: '100px',
      },
    },
  };
};
export default MuiDialog;

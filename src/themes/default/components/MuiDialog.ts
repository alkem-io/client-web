import { Components, Theme } from '@mui/material/styles';

const MuiDialog = (theme: Theme): Components['MuiDialog'] | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    styleOverrides: {
      paper: {
        minHeight: '100px',
      },
    },
  };
};
export default MuiDialog;

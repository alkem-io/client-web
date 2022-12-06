import { Components, Theme } from '@mui/material/styles';

const MuiDialogContent = (theme: Theme): Components['MuiDialogContent'] => {
  return {
    styleOverrides: {
      dividers: {
        borderTopColor: theme.palette.neutralMedium.main,
        borderBottomColor: theme.palette.neutralMedium.main,
      },
    },
  };
};

export default MuiDialogContent;

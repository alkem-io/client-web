import { Components, Theme } from '@mui/material/styles';

const MuiDialogContent: Components<Theme>['MuiDialogContent'] = {
  styleOverrides: {
    dividers: ({ theme }) => ({
      borderTopColor: theme.palette.neutralMedium.main,
      borderBottomColor: theme.palette.neutralMedium.main,
    }),
  },
};

export default MuiDialogContent;

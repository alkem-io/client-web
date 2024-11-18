import { Components, Theme } from '@mui/material/styles';
import { gutters } from '@/core/ui/grid/utils';

const MuiDialogContent: Components<Theme>['MuiDialogContent'] = {
  styleOverrides: {
    dividers: ({ theme }) => ({
      borderTopColor: theme.palette.neutralMedium.main,
      borderBottomColor: theme.palette.neutralMedium.main,
    }),
    root: ({ theme }) => ({
      padding: gutters()(theme),
    }),
  },
};

export default MuiDialogContent;

import { Components, Theme } from '@mui/material/styles';
import { gutters } from '../../../grid/utils';

const MuiDialogActions: Components<Theme>['MuiDialogActions'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: gutters()(theme),
    }),
  },
};

export default MuiDialogActions;

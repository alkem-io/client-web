import { Components, Theme } from '@mui/material/styles';
import { gutters } from '../../../grid/utils';

const MuiDialogActions: Components<Theme>['MuiDialogActions'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: gutters(0.5)(theme),
    }),
  },
};

export default MuiDialogActions;

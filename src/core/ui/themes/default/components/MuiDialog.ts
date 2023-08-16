import { Components, Theme } from '@mui/material/styles';
import { gutters } from '../../../grid/utils';
import { TopBarHeightGutters } from '../../../../../main/ui/layout/topBar/TopBar';

const MuiDialog: Components<Theme>['MuiDialog'] = {
  styleOverrides: {
    paper: ({ theme }) => ({
      minHeight: '100px',
      maxHeight: `calc(100vh - ${gutters(TopBarHeightGutters)(theme)} - ${gutters(2)(theme)})`,
    }),
  },
};

export default MuiDialog;

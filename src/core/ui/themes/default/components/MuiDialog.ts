import { Components, Theme } from '@mui/material/styles';
import { gutters } from '../../../grid/utils';
import { NAVIGATION_CONTAINER_HEIGHT_GUTTERS } from '../../../navigation/NavigationBar';

const MuiDialog: Components<Theme>['MuiDialog'] = {
  styleOverrides: {
    paper: ({ theme }) => ({
      minHeight: '100px',
      maxHeight: `calc(100vh - ${gutters(NAVIGATION_CONTAINER_HEIGHT_GUTTERS)(theme)} - ${gutters(2)(theme)})`,
    }),
  },
};

export default MuiDialog;

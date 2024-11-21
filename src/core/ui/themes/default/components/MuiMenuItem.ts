import { Components, Theme } from '@mui/material/styles';
import { gutters } from '@/core/ui/grid/utils';

const MuiMenuItem: Components<Theme>['MuiMenuItem'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: gutters(0.5)(theme),
      textTransform: 'uppercase',
      '.MuiListItemIcon-root': {
        minWidth: gutters(1.5)(theme),
      },
    }),
  },
};

export default MuiMenuItem;

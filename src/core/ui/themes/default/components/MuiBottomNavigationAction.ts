import { Components, Theme } from '@mui/material/styles';

const MuiBottomNavigationAction: Components<Theme>['MuiBottomNavigationAction'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: 0,
      minWidth: theme.spacing(8),
    }),
  },
};

export default MuiBottomNavigationAction;

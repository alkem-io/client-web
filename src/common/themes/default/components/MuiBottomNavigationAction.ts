import { Components, Theme } from '@mui/material/styles';

const MuiBottomNavigationAction = (theme: Theme): Components['MuiBottomNavigationAction'] | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    styleOverrides: {
      root: {
        padding: 0,
        minWidth: theme.spacing(8),
      },
    },
  };
};
export default MuiBottomNavigationAction;

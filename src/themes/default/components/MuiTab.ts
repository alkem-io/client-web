import { Components, Theme } from '@mui/material/styles';
import {} from '@mui/material/Tab';

const MuiTab = (theme: Theme): Components['MuiTab'] | undefined => {
  if (!theme) {
    return undefined;
  }

  return {
    styleOverrides: {
      root: {
        '&.Mui-selected': {
          fontWeight: 600,
        },
        padding: 0,
        minWidth: 'auto',
        minHeight: 48,
        marginRight: theme.spacing(2),
      },
      textColorInherit: {
        opacity: 1,
      },
    },
    defaultProps: {
      color: 'inherit',
    },
  };
};
export default MuiTab;

import { Components } from '@mui/material/styles';

const MuiTab: Components['MuiTab'] = {
  styleOverrides: {
    root: {
      '&.Mui-selected': {
        fontWeight: 600, // TODO check
      },
      padding: 0,
      minWidth: 'auto',
      minHeight: 48,
      // marginRight: theme.spacing(2),
    },
    textColorInherit: {
      opacity: 1,
    },
  },
  defaultProps: {
    color: 'inherit',
  },
};

export default MuiTab;

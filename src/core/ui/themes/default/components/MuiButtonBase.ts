import { Components, Theme } from '@mui/material/styles';

const MuiButtonBase: Components<Theme>['MuiButtonBase'] = {
  defaultProps: {
    disableRipple: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      '&.Mui-focusVisible': {
        backgroundColor: theme.palette.highlight.main,
      },
    }),
  },
};

export default MuiButtonBase;

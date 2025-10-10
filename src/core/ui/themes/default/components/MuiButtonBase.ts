import { Components, Theme } from '@mui/material/styles';

const MuiButtonBase: Components<Theme>['MuiButtonBase'] = {
  defaultProps: {
    disableRipple: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      '&.Mui-focusVisible': {
        backgroundColor: theme.palette.highlight.main,
        color: theme.palette.highlight.contrastText,
        svg: {
          color: theme.palette.highlight.contrastText,
        },
      },
    }),
  },
};

export default MuiButtonBase;

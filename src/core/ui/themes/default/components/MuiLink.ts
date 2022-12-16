import { Components, Theme } from '@mui/material/styles';

const MuiLink: Components<Theme>['MuiLink'] = {
  defaultProps: {
    underline: 'none',
  },
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.text.primary,
      '&:hover': {
        color: theme.palette.primary.main,
      },
    }),
  },
};

export default MuiLink;

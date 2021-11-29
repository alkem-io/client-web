import { Components, emphasize, Theme } from '@mui/material/styles';

const MuiChip = (theme: Theme): Components['MuiChip'] | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    styleOverrides: {
      outlined: {
        borderColor: '#00A88F',
        textColor: '#007482',
      },
      root: {
        color: '#007482',
      },
      outlinedPrimary: {
        borderColor: '#00A88F',
        textColor: '#007482',
      },
      iconColorPrimary: {
        color: '#00BCD4',
      },
      deleteIconColorPrimary: {
        color: theme.palette.neutralLight.main,

        '&:hover': {
          // coefficient from material UI code base for hover effects
          color: emphasize(theme.palette.neutralLight.main, 0.08),
        },
      },
    },
    defaultProps: {
      size: 'small',
    },
  };
};
export default MuiChip;

import { Components, emphasize, Theme } from '@mui/material/styles';

const MuiChip = (theme: Theme): Components['MuiChip'] | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    styleOverrides: {
      colorPrimary: {
        color: theme.palette.neutralLight.main,
        fontWeight: 'bold',
      },
      deleteIconColorPrimary: {
        color: theme.palette.neutralLight.main,

        '&:hover': {
          // coefficient from material UI code base for hover effects
          color: emphasize(theme.palette.neutralLight.main, 0.08),
        },
      },
    },
  };
};
export default MuiChip;

import { Components, emphasize, Theme } from '@mui/material/styles';

const MuiPaper = (theme: Theme): Components['MuiPaper'] | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    styleOverrides: {
      outlined: {
        borderColor: emphasize(theme.palette.background.paper),
      },
    },
  };
};
export default MuiPaper;

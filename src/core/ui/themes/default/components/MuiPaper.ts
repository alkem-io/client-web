import { Components, Theme } from '@mui/material/styles';

const MuiPaper = (_theme: Theme): Components['MuiPaper'] => {
  return {
    styleOverrides: {
      rounded: {
        overflow: 'hidden',
      },
    },
  };
};

export default MuiPaper;

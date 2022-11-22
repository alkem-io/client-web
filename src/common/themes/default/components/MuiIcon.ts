import { Components, Theme } from '@mui/material/styles';

const MuiIcon = (_theme: Theme): Components['MuiIcon'] | undefined => {
  return {
    styleOverrides: {
      fontSizeSmall: { fontSize: 24 },
      fontSizeLarge: { fontSize: 36 },
    },
  };
};
export default MuiIcon;

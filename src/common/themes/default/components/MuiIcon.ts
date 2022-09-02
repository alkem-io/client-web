import { Components, Theme } from '@mui/material/styles';

const MuiIcon = (theme: Theme): Components['MuiIcon'] | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    styleOverrides: {
      fontSizeSmall: { fontSize: 24 },
      fontSizeLarge: { fontSize: 36 },
    },
  };
};
export default MuiIcon;

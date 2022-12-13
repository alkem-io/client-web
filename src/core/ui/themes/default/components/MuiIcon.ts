import { Components } from '@mui/material/styles';

const MuiIcon: Components['MuiIcon'] = {
  styleOverrides: {
    // TODO check if needed
    fontSizeSmall: { fontSize: 24 },
    fontSizeLarge: { fontSize: 36 },
  },
};

export default MuiIcon;

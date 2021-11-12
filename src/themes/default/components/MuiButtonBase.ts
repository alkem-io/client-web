import { Components, Theme } from '@mui/material/styles';
import hexToRGBA from '../../../utils/hexToRGBA';

const MuiButtonBase = (theme: Theme): Components['MuiButtonBase'] | undefined => {
  if (!theme) {
    return undefined;
  }

  return {
    styleOverrides: {
      root: {
        '&:disabled': {
          color: theme.palette.background.paper,
          borderColor: theme.palette.neutralLight.main,
          background: theme.palette.neutralLight.main,
          opacity: 0.8,
          cursor: 'default',

          '&$hover': {
            color: theme.palette.background.paper,
            background: hexToRGBA(theme.palette.neutralMedium.main, 0.7),
            cursor: 'not-allowed',
          },

          '&$focus': {
            '&$inset': {
              outline: 'none',
            },
          },
        },
      },
    },
  };
};
export default MuiButtonBase;

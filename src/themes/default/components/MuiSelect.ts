import { Components, Theme } from '@mui/material';

const MuiSelect = (theme: Theme): Components['MuiSelect'] | undefined => {
  if (!theme) {
    return undefined;
  }

  return {
    styleOverrides: {
      /**
       * Fixes "endAdornment overlaps with arrow icon"
       * taken from https://github.com/mui/material-ui/issues/17799#issuecomment-748724383
       */
      icon: {
        position: 'relative',
        marginLeft: '-22px',
      },
    },
  };
};
export default MuiSelect;

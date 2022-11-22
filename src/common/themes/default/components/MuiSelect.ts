import { Components, Theme } from '@mui/material';

const MuiSelect = (_theme: Theme): Components['MuiSelect'] => {
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

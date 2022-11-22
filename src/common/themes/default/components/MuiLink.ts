import { Components, Theme } from '@mui/material/styles';

const MuiLink = (_theme: Theme): Components['MuiLink'] | undefined => {
  return {
    defaultProps: {
      underline: 'none',
    },
  };
};
export default MuiLink;

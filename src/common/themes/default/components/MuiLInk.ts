import { Components, Theme } from '@mui/material/styles';

const MuiLink = (theme: Theme): Components['MuiLink'] | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    defaultProps: {
      underline: 'none',
    },
  };
};
export default MuiLink;

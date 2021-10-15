import { ThemeOptions } from '@material-ui/core';
import { Overrides } from '@material-ui/core/styles/overrides';

const cardOverrides = (theme: ThemeOptions): Overrides | undefined => {
  if (!theme) {
    return undefined;
  }

  // todo: can we use the default theme for transitions and box shadow
  return {
    MuiCard: {
      root: {
        // transition: 'box-shadow 300ms ease-in-out',
        // '&:hover': {
        //   //card uses elevation8
        //   boxShadow:
        //     '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
        // },
      },
    },
  };
};
export default cardOverrides;

import { Theme } from '@material-ui/core';
import { Overrides } from '@material-ui/core/styles/overrides';

const dialogOverrides = (theme: Theme): Overrides | undefined => {
  if (!theme) {
    return undefined;
  }
  return {
    MuiDialog: {
      paper: {
        minHeight: '100px',
      },
    },
    MuiDialogContent: {
      dividers: {
        borderTopColor: theme.palette.neutralMedium.main,
        borderBottomColor: theme.palette.neutralMedium.main,
      },
    },
  };
};
export default dialogOverrides;

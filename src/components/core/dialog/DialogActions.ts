import withStyles from '@material-ui/core/styles/withStyles';
import { Theme } from '@material-ui/core';
import MuiDialogActions from '@material-ui/core/DialogActions';

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);
export default DialogActions;

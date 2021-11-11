import withStyles from '@mui/styles/withStyles';
import { Theme } from '@mui/material';
import MuiDialogActions from '@mui/material/DialogActions';

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);
export default DialogActions;

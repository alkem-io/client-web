import MuiDialogContent from '@material-ui/core/DialogContent';
import { Theme, withStyles } from '@material-ui/core/styles';

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);
export default DialogContent;

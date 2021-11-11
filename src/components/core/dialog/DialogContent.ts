import MuiDialogContent from '@mui/material/DialogContent';
import { Theme } from '@mui/material/styles';

import withStyles from '@mui/styles/withStyles';

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);
export default DialogContent;

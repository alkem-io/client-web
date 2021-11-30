import { styled } from '@mui/material';
import MuiDialogActions from '@mui/material/DialogActions';

const DialogActions = styled(MuiDialogActions)(({ theme }) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}));
export default DialogActions;

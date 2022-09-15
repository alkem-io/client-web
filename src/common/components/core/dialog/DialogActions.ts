import { styled } from '@mui/material';
import MuiDialogActions from '@mui/material/DialogActions';

const DialogActions = styled(MuiDialogActions)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(1),
  justifyContent: 'space-between',
}));

export default DialogActions;

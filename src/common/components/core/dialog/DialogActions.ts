import { styled } from '@mui/material';
import MuiDialogActions from '@mui/material/DialogActions';

const DialogActions = styled(MuiDialogActions)(({ theme }) => ({
  margin: 0,
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  paddingRight: theme.spacing(3),
  paddingLeft: theme.spacing(3),
  justifyContent: 'space-between',
}));

export default DialogActions;

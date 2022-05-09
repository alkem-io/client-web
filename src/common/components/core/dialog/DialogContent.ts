import MuiDialogContent from '@mui/material/DialogContent';
import { styled } from '@mui/material/styles';

const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  root: {
    padding: theme.spacing(2),
  },
  '.MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
}));

export default DialogContent;

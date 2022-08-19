import { Dialog, DialogProps } from '@mui/material';

const DialogWhiteBg = (props: DialogProps) => {
  return <Dialog {...props} PaperProps={{ ...props.PaperProps, sx: { backgroundColor: 'background.default' } }} />;
};

export default DialogWhiteBg;

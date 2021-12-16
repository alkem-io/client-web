import React from 'react';
import { Theme } from '@mui/material/styles';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import MuiDialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
    },
    closeButton: {
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id?: string;
  children: React.ReactNode;
  onClose?: (e: Event) => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle className={classes.root} {...other}>
      <Typography component="div" variant="h6" sx={{ flexGrow: 1 }}>
        {children}
      </Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={e => onClose(e as any)} size="medium">
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});
export default DialogTitle;

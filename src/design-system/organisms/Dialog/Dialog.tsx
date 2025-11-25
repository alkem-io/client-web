import React from 'react';
import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogProps as MuiDialogProps,
} from '@mui/material';

export interface DialogProps extends MuiDialogProps {
  title?: string;
  actions?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ title, actions, children, ...props }) => {
  return (
    <MuiDialog {...props}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions>{actions}</DialogActions>}
    </MuiDialog>
  );
};

import React from 'react';
import { Snackbar as MuiSnackbar, SnackbarProps as MuiSnackbarProps, Alert, AlertProps } from '@mui/material';

export interface SnackbarProps extends MuiSnackbarProps {
  severity?: AlertProps['severity'];
  message?: string;
}

export const Snackbar: React.FC<SnackbarProps> = ({ severity, message, children, ...props }) => {
  if (severity) {
    return (
      <MuiSnackbar {...props}>
        <Alert severity={severity} sx={{ width: '100%' }}>
          {message || children}
        </Alert>
      </MuiSnackbar>
    );
  }

  return (
    <MuiSnackbar {...props} message={message}>
      {children}
    </MuiSnackbar>
  );
};

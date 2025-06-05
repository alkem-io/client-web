import { ReactElement } from 'react';
import { Snackbar, SnackbarProps } from '@mui/material';

export interface NotificationViewProps {
  open: boolean;
  onClose?: SnackbarProps['onClose'];
  autoHideDuration?: number | null;
  anchorOrigin?: SnackbarProps['anchorOrigin'];
  children: ReactElement | undefined;
  slotProps?: SnackbarProps['slotProps'];
}

/**
 * A flexible notification view that can be used for any content.
 * - Set autoHideDuration to null or undefined for no auto-hide.
 * - Pass anchorOrigin to control position.
 * - Pass any children (Alert, custom content, etc).
 */
export const NotificationView = ({
  open,
  onClose,
  autoHideDuration,
  anchorOrigin = { vertical: 'bottom', horizontal: 'right' },
  slotProps,
  children,
}: NotificationViewProps) => (
  <Snackbar
    open={open}
    onClose={onClose}
    autoHideDuration={autoHideDuration ?? undefined}
    anchorOrigin={anchorOrigin}
    slotProps={slotProps}
  >
    {children}
  </Snackbar>
);

export default NotificationView;

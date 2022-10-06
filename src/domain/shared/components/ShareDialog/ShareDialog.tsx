import React, { FC } from 'react';
import { Dialog } from '@mui/material';
import { DialogContent, DialogTitle } from '../../../../common/components/core/dialog';
import { ShareComponent, ShareComponentTitle, ShareComponentProps } from './ShareComponent';

interface ShareDialogProps extends ShareComponentProps {
  open: boolean;
  onClose: () => void;
}

export const ShareDialog: FC<ShareDialogProps> = ({ open, onClose, ...props }) => {
  return (
    <Dialog open={open}>
      <DialogTitle onClose={onClose}>
        <ShareComponentTitle {...props} />
      </DialogTitle>
      <DialogContent>
        <ShareComponent {...props} />
      </DialogContent>
    </Dialog>
  );
};

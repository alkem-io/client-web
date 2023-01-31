import React, { PropsWithChildren, ReactNode } from 'react';
import { Close } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import ActionsBar from '../actions/ActionsBar/ActionsBar';

export interface DialogHeaderProps {
  actions?: ReactNode;
  onClose?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const DialogHeader = ({ actions, onClose, children }: PropsWithChildren<DialogHeaderProps>) => {
  return (
    <Box display="flex" alignItems="start" padding={1}>
      <Box flexGrow={1} display="flex" flexDirection="column" gap={1} padding={1}>
        {children}
      </Box>
      <ActionsBar>
        {onClose && (
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        )}
        {actions}
      </ActionsBar>
    </Box>
  );
};

export default DialogHeader;

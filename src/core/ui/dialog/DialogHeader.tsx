import React, { PropsWithChildren, ReactNode } from 'react';
import { Close } from '@mui/icons-material';
import { Box, BoxProps, IconButton } from '@mui/material';
import ActionsBar from '../actions/ActionsBar/ActionsBar';
import { BlockTitle } from '../typography';

export interface DialogHeaderProps {
  title?: ReactNode;
  actions?: ReactNode;
  onClose?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  titleContainerProps?: BoxProps;
}

const DialogHeader = ({ title, actions, onClose, titleContainerProps, children }: PropsWithChildren<DialogHeaderProps>) => {
  return (
    <Box display="flex" alignItems="start" padding={1}>
      <Box flexGrow={1} flexShrink={1} minWidth={0} display="flex" gap={1} padding={1} {...titleContainerProps}>
        {title ? <BlockTitle>{title}</BlockTitle> : children}
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

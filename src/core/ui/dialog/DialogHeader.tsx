import React, { cloneElement, PropsWithChildren, ReactElement, ReactNode } from 'react';
import { Close } from '@mui/icons-material';
import { Box, BoxProps, IconButton, SvgIconProps } from '@mui/material';
import ActionsBar from '../actions/ActionsBar/ActionsBar';
import { BlockTitle } from '../typography';

export interface DialogHeaderProps {
  icon?: ReactElement<SvgIconProps>;
  title?: ReactNode;
  actions?: ReactNode;
  onClose?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  titleContainerProps?: BoxProps;
}

const DialogHeader = ({
  icon,
  title,
  actions,
  onClose,
  titleContainerProps,
  children,
}: PropsWithChildren<DialogHeaderProps>) => {
  const getTitleContainerProps = () => {
    return {
      alignItems: icon ? 'center' : 'start',
      ...titleContainerProps,
    };
  };

  return (
    <Box display="flex" alignItems="start" padding={1}>
      <Box flexGrow={1} flexShrink={1} minWidth={0} display="flex" gap={1} padding={1} {...getTitleContainerProps()}>
        {icon && cloneElement(icon, {})}
        {title && <BlockTitle>{title}</BlockTitle>}
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

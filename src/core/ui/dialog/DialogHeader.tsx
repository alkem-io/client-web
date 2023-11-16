import React, { cloneElement, PropsWithChildren, ReactElement, ReactNode } from 'react';
import { Close } from '@mui/icons-material';
import { Box, BoxProps, IconButton, SvgIconProps } from '@mui/material';
import ActionsBar from '../actions/ActionsBar/ActionsBar';
import { BlockTitle } from '../typography';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <Box display="flex" alignItems="start" padding={1}>
      <Box
        flexGrow={1}
        flexShrink={1}
        minWidth={0}
        display="flex"
        gap={1}
        padding={1}
        alignItems={icon ? 'center' : 'start'}
        {...titleContainerProps}
      >
        {icon && cloneElement(icon, {})}
        {title && <BlockTitle>{title}</BlockTitle>}
        {children}
      </Box>
      <ActionsBar>
        {onClose && (
          <IconButton onClick={onClose} aria-label={t('buttons.close')}>
            <Close />
          </IconButton>
        )}
        {actions}
      </ActionsBar>
    </Box>
  );
};

export default DialogHeader;

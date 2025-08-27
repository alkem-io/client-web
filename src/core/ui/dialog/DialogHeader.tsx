import { PropsWithChildren, ReactElement, ReactNode, MouseEvent } from 'react';
import { Close } from '@mui/icons-material';
import { Box, BoxProps, IconButton, SvgIconProps } from '@mui/material';
import ActionsBar from '../actions/ActionsBar/ActionsBar';
import { useTranslation } from 'react-i18next';
import BlockTitleWithIcon from '../content/BlockTitleWithIcon';

export interface DialogHeaderProps {
  id?: string;
  icon?: ReactElement<SvgIconProps>;
  title?: ReactNode;
  actions?: ReactNode;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void;
  titleContainerProps?: BoxProps;
}

const DialogHeader = ({
  id,
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
      <BlockTitleWithIcon title={title} icon={icon} padding={1} titleId={id} {...titleContainerProps}>
        {children}
      </BlockTitleWithIcon>
      <ActionsBar>
        {Boolean(onClose) && (
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

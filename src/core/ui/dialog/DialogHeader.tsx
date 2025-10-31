import { PropsWithChildren, ReactElement, ReactNode, MouseEvent } from 'react';
import { Close } from '@mui/icons-material';
import { Box, BoxProps, IconButton, SvgIconProps } from '@mui/material';
import ActionsBar from '../actions/ActionsBar/ActionsBar';
import { useTranslation } from 'react-i18next';
import BlockTitleWithIcon from '../content/BlockTitleWithIcon';
import useLoadingState from '@/domain/shared/utils/useLoadingState';

export interface DialogHeaderProps {
  id?: string;
  icon?: ReactElement<SvgIconProps>;
  title?: ReactNode;
  actions?: ReactNode;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<unknown>;
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
  const [onCloseInternal, closing] = useLoadingState(
    async (event: MouseEvent<HTMLButtonElement>) => await onClose?.(event)
  );

  return (
    <Box display="flex" alignItems="start" padding={1}>
      <BlockTitleWithIcon title={title} icon={icon} padding={1} titleId={id} {...titleContainerProps}>
        {children}
      </BlockTitleWithIcon>
      <ActionsBar>
        {Boolean(onClose) && (
          <IconButton onClick={onCloseInternal} aria-label={t('buttons.close')} loading={closing}>
            <Close />
          </IconButton>
        )}
        {actions}
      </ActionsBar>
    </Box>
  );
};

export default DialogHeader;

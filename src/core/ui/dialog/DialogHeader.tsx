import { Close } from '@mui/icons-material';
import { Box, type BoxProps, IconButton, type SvgIconProps, Typography } from '@mui/material';
import type { MouseEvent, PropsWithChildren, ReactElement, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useLoadingState from '@/domain/shared/utils/useLoadingState';
import ActionsBar from '../actions/ActionsBar/ActionsBar';
import BlockTitleWithIcon from '../content/BlockTitleWithIcon';

export interface DialogHeaderProps {
  id?: string;
  icon?: ReactElement<SvgIconProps>;
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  onClose?: (event: MouseEvent<HTMLButtonElement>) => void | Promise<unknown>;
  titleContainerProps?: BoxProps;
}

const DialogHeader = ({
  id,
  icon,
  title,
  subtitle,
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
    <Box display="flex" flexDirection="column" padding={1}>
      <Box display="flex" alignItems="start">
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
      {subtitle && (
        <Typography variant="caption" color="neutral.light" paddingX={1}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default DialogHeader;

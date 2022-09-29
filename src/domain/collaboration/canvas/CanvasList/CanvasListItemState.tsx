import React from 'react';
import { useTranslation } from 'react-i18next';
import CircleIcon from '@mui/icons-material/Circle';
import { CanvasCheckoutStateEnum } from '../../../../models/graphql-schema';
import { Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbOnTotalSilenceIcon from '@mui/icons-material/DoNotDisturbOnTotalSilence';

interface CanvasListItemStateProps {
  checkoutStatus?: CanvasCheckoutStateEnum;
  isSelected?: boolean;
}

export const CanvasListItemState = ({ checkoutStatus, isSelected }: CanvasListItemStateProps) => {
  const { t } = useTranslation();

  if (isSelected) {
    return <CircleIcon color="disabled" />;
  }

  switch (checkoutStatus) {
    case CanvasCheckoutStateEnum.Available:
      return (
        <Tooltip title={t('pages.canvas.state.available')}>
          <CheckCircleIcon color="success" />
        </Tooltip>
      );
    case CanvasCheckoutStateEnum.CheckedOut:
      return (
        <Tooltip title={t('pages.canvas.state.checkedout')}>
          <DoNotDisturbOnTotalSilenceIcon color="warning" />
        </Tooltip>
      );
    default:
      return (
        <Tooltip title={t('pages.canvas.state.unknown')}>
          <CircleIcon color="disabled" />
        </Tooltip>
      );
  }
};

export default CanvasListItemState;

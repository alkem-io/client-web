import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, IconButton, Tooltip } from '@mui/material';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import AddIcon from '@mui/icons-material/Add';
import { Caption } from '@/core/ui/typography';

const CreationButton = ({
  disabledTooltip,
  disabled,
  onClick,
}: {
  disabledTooltip: string;
  onClick: () => void;
  disabled?: boolean;
}) => {
  const { t } = useTranslation();

  const button = (
    <IconButton
      aria-label={t('common.add')}
      aria-disabled={disabled}
      aria-haspopup="true"
      size="small"
      onClick={onClick}
      disabled={disabled}
    >
      <RoundedIcon component={AddIcon} size="medium" iconSize="small" disabled={disabled} aria-disabled={disabled} />
    </IconButton>
  );

  return disabled && disabledTooltip ? (
    <Tooltip arrow placement="top" title={<Caption>{disabledTooltip}</Caption>}>
      <Box>{button}</Box>
    </Tooltip>
  ) : (
    <>{button}</>
  );
};

export default CreationButton;

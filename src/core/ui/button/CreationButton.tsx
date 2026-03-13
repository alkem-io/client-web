import { Box, Tooltip } from '@mui/material';
import type React from 'react';
import { Caption } from '@/core/ui/typography';

const CreationButton = ({
  disabledTooltip,
  disabled,
  buttonComponent,
}: {
  disabledTooltip?: React.ReactNode;
  buttonComponent: React.ReactNode;
  disabled?: boolean;
}) => {
  return disabled && disabledTooltip ? (
    <Tooltip arrow={true} placement="top" title={<Caption>{disabledTooltip}</Caption>}>
      <Box>{buttonComponent}</Box>
    </Tooltip>
  ) : (
    buttonComponent
  );
};

export default CreationButton;

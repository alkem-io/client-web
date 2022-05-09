import React, { FC } from 'react';
import { Tooltip, TooltipProps } from '@mui/material';

export interface ConditionalTooltipProps extends TooltipProps {
  show?: boolean;
}

export const ConditionalTooltip: FC<ConditionalTooltipProps> = ({ children, show = true, ...rest }) => {
  if (!show) {
    return children;
  }

  return <Tooltip {...rest}>{children}</Tooltip>;
};

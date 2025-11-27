import React from 'react';
import { Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps } from '@mui/material';

export interface TooltipProps extends MuiTooltipProps {
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ children, ...props }) => {
  return <MuiTooltip {...props}>{children}</MuiTooltip>;
};

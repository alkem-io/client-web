import React from 'react';
import { Button, ButtonProps, Tooltip, TooltipProps, useTheme } from '@mui/material';
import { gutters } from '../grid/utils';

interface ButtonWithTooltipProps extends ButtonProps {
  tooltip: string;
  iconButton?: boolean;
  tooltipProps?: TooltipProps;
}

const ButtonWithTooltip = ({ tooltip, iconButton, tooltipProps, sx, ...props }: ButtonWithTooltipProps) => {
  const theme = useTheme();

  const isContained = props.variant === 'contained';
  const isOutlined = props.variant === 'outlined';

  const tooltipStyle = {
    padding: gutters(0.5)(theme),
    backgroundColor: isContained ? theme.palette.primary.main : theme.palette.background.paper,
    color: isContained ? theme.palette.primary.contrastText : theme.palette.primary.main,
    border: isContained ? undefined : `1px solid ${theme.palette.divider}`,
    '.MuiTooltip-arrow': {
      color: isContained ? theme.palette.primary.main : theme.palette.background.paper,
      '&::before': {
        border: isContained ? undefined : `1px solid  ${theme.palette.divider}`,
      },
    },
  };

  const buttonStyle = {
    backgroundColor: isOutlined ? theme.palette.background.paper : undefined,
    borderColor: isOutlined ? theme.palette.divider : undefined,
    ...sx,
    minWidth: iconButton ? 0 : sx?.['minWidth'],
  };

  return (
    <Tooltip arrow title={tooltip} componentsProps={{ tooltip: { sx: tooltipStyle } }} {...tooltipProps}>
      <Button aria-label={tooltip} {...props} sx={buttonStyle} />
    </Tooltip>
  );
};

export default ButtonWithTooltip;

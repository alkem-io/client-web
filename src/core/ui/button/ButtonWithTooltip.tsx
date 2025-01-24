import React, { PropsWithChildren } from 'react';
import { Box, Button, ButtonProps, Tooltip, TooltipProps, useTheme } from '@mui/material';
import { gutters } from '../grid/utils';
import { ButtonTypeMap } from '@mui/material/Button/Button';
import { Caption } from '../typography';

interface ButtonWithTooltipProps {
  tooltip: string;
  iconButton?: boolean;
  tooltipPlacement?: TooltipProps['placement'];
}

const ButtonWithTooltip = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  tooltip,
  iconButton,
  tooltipPlacement,
  sx,
  children,
  ...props
}: PropsWithChildren<ButtonWithTooltipProps & ButtonProps<D, P>>) => {
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
    paddingX: iconButton ? 1 : undefined,
    '&.MuiButton-outlinedSizeMedium': { paddingX: 0.9 },
    '.MuiButton-startIcon': { margin: 0 },
  };

  return (
    <Tooltip
      arrow
      title={<Caption>{tooltip}</Caption>}
      componentsProps={{ tooltip: { sx: tooltipStyle } }}
      placement={tooltipPlacement}
    >
      <Box>
        <Button aria-label={tooltip} {...props} sx={buttonStyle} startIcon={iconButton && children}>
          {!iconButton && children}
        </Button>
      </Box>
    </Tooltip>
  );
};

export default ButtonWithTooltip;

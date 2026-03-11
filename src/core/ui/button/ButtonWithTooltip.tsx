import { Box, Button, type ButtonProps, Tooltip, type TooltipProps, useTheme } from '@mui/material';
import type { ButtonTypeMap } from '@mui/material/Button/Button';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import { gutters } from '../grid/utils';
import { Caption } from '../typography';

interface ButtonWithTooltipProps {
  tooltip?: string;
  iconButton?: boolean;
  startIcon?: React.ReactNode;
  tooltipPlacement?: TooltipProps['placement'];
}

const ButtonWithTooltip = <D extends React.ElementType = ButtonTypeMap['defaultComponent'], P = {}>({
  tooltip,
  iconButton,
  startIcon,
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
    minWidth: iconButton ? 0 : sx?.minWidth,
    paddingX: iconButton ? 1 : undefined,
    '&.MuiButton-outlinedSizeMedium': { paddingX: 0.9 },
    '.MuiButton-startIcon': { margin: 0 },
  };

  if (!tooltip) {
    return (
      <Button {...props} sx={buttonStyle} startIcon={(iconButton && children) || startIcon}>
        {!iconButton && children}
      </Button>
    );
  }

  return (
    <Tooltip
      arrow={true}
      title={<Caption>{tooltip}</Caption>}
      componentsProps={{ tooltip: { sx: tooltipStyle } }}
      placement={tooltipPlacement}
    >
      <Box>
        <Button aria-label={tooltip} {...props} sx={buttonStyle} startIcon={(iconButton && children) || startIcon}>
          {!iconButton && children}
        </Button>
      </Box>
    </Tooltip>
  );
};

export default ButtonWithTooltip;

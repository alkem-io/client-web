import React, { ComponentType, PropsWithChildren } from 'react';
import { Box, IconButton, SvgIconProps, Typography } from '@mui/material';
import { styled } from '@mui/material';

const iconButtonSize = 140;

export interface RadioButtonProps<Value> {
  value: Value;
  selected?: boolean;
  disabled?: boolean;
  iconComponent: ComponentType<SvgIconProps>;
  onClick?: (value: Value) => void;
}

const StyledButton = styled(IconButton)(({ theme }) => ({
  width: iconButtonSize,
  height: iconButtonSize,
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.neutralMedium.main}`,
  borderRadius: theme.shape.borderRadius,
}));

const RadioButton = <Value,>({
  value,
  selected,
  disabled,
  iconComponent: Icon,
  onClick,
  children,
}: PropsWithChildren<RadioButtonProps<Value>>) => {
  return (
    <StyledButton
      sx={theme => ({
        background: selected ? theme.palette.primary.main : undefined,
        '&:hover': selected
          ? {
              background: theme.palette.primary.main,
            }
          : undefined,
        pointerEvents: disabled ? 'none' : undefined,
      })}
      aria-label="comments"
      onClick={onClick && (() => onClick(value))}
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        <Icon
          sx={theme => ({
            color: selected ? theme.palette.background.default : theme.palette.primary.main,
            fontSize: 60,
          })}
        />
        <Typography
          sx={theme => ({
            color: selected ? theme.palette.background.default : theme.palette.primary.main,
            align: 'center',
          })}
        >
          {children}
        </Typography>
      </Box>
    </StyledButton>
  );
};

export default RadioButton;

import React, { ComponentType, PropsWithChildren } from 'react';
import { Box, IconButton, SvgIconProps, useTheme } from '@mui/material';
import { styled } from '@mui/material';
import { Caption, Text } from '@core/ui/typography';
import { gutters } from '@core/ui/grid/utils';
import { Theme } from '@mui/material/styles';

export interface RadioButtonProps<Value> {
  value: Value;
  size?: 'small' | 'large';
  selected?: boolean;
  disabled?: boolean;
  iconComponent: ComponentType<SvgIconProps>;
  onClick?: (value: Value) => void;
}

const StyledButton = styled(IconButton)(({ theme }) => ({
  border: `1px solid ${theme.palette.neutralMedium.main}`,
  borderRadius: theme.shape.borderRadius,
}));

const getFontColor = (
  { selected, disabled }: Pick<RadioButtonProps<unknown>, 'selected' | 'disabled'>,
  { palette }: Theme
) => {
  if (disabled) {
    return palette.muted.main;
  }
  return selected ? palette.background.default : palette.primary.main;
};

const RadioButton = <Value,>({
  value,
  selected,
  disabled,
  iconComponent: Icon,
  size = 'large',
  onClick,
  children,
}: PropsWithChildren<RadioButtonProps<Value>>) => {
  const theme = useTheme();

  const buttonSize = theme.spacing(size === 'large' ? 14 : 12);

  const padding = gutters(size === 'large' ? 1 : 0.5);

  const iconSize = size === 'large' ? 60 : 40;

  const LabelComponent = size === 'large' ? Text : Caption;

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
        width: buttonSize,
        height: buttonSize,
        color: disabled ? theme.palette.muted.main : undefined,
        padding,
      })}
      aria-label="comments"
      onClick={onClick && (() => onClick(value))}
    >
      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
        <Icon
          sx={theme => ({
            color: getFontColor({ selected, disabled }, theme),
            fontSize: iconSize,
          })}
        />
        <LabelComponent
          sx={theme => ({
            color: getFontColor({ selected, disabled }, theme),
            align: 'center',
          })}
        >
          {children}
        </LabelComponent>
      </Box>
    </StyledButton>
  );
};

export default RadioButton;

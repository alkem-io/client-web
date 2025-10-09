import Gutters from '@/core/ui/grid/Gutters';
import { ComponentType, ReactNode } from 'react';
import { Box, BoxProps, Button, SvgIconProps, Tooltip, TooltipProps } from '@mui/material';
import { Caption } from '@/core/ui/typography';
import SwapColors from '@/core/ui/palette/SwapColors';
import { gutters } from '@/core/ui/grid/utils';

export interface RadioButtonOption<Value> {
  icon?: ComponentType<SvgIconProps>;
  value: Value;
  label: ReactNode;
  tooltip?: ReactNode;
  disabled?: boolean;
}

export interface RadioButtonsGroupProps<Value> extends Omit<BoxProps, 'onChange'> {
  value: Value | undefined;
  options: RadioButtonOption<Value>[];
  labelPlacement?: 'bottom' | 'right';
  onChange?: (value: Value) => void;
  readOnly?: boolean;
  tooltipProps?: Partial<TooltipProps>;
  children?: ReactNode;
}

const RadioButtonsGroup = <Value,>({
  value,
  options,
  labelPlacement = 'right',
  onChange,
  readOnly,
  tooltipProps,
  children,
}: RadioButtonsGroupProps<Value>) => {
  const handleClick = (optionValue: Value) => {
    if (!readOnly && onChange && value !== optionValue) {
      onChange(optionValue);
    }
  };

  return (
    <Gutters row disablePadding disableMargin flexWrap="wrap">
      {options.map(({ value: optionValue, icon: Icon, label, tooltip, disabled }) => (
        <Tooltip title={tooltip} key={String(optionValue)} {...tooltipProps}>
          <span>
            <Button
              key={String(optionValue)}
              disabled={readOnly || disabled}
              onClick={() => handleClick(optionValue)}
              sx={{
                gap: gutters(0.5),
                flexDirection: labelPlacement === 'right' ? 'row' : 'column',
                flexShrink: 1,
                textTransform: 'none',
                '&.Mui-disabled': value === optionValue ? { color: 'primary.main' } : {},
              }}
            >
              {Icon && (
                <SwapColors swap={value === optionValue}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    border={theme => (value !== optionValue ? `1px solid ${theme.palette.divider}` : undefined)}
                    borderRadius={gutters()}
                    width={gutters(2)}
                    height={gutters(2)}
                    bgcolor={value === optionValue ? 'background.paper' : undefined}
                  >
                    <Icon color={(readOnly || disabled) && value !== optionValue ? 'disabled' : 'primary'} />
                  </Box>
                </SwapColors>
              )}
              <Caption whiteSpace="normal">{label}</Caption>
            </Button>
          </span>
        </Tooltip>
      ))}
      {children}
    </Gutters>
  );
};

export default RadioButtonsGroup;

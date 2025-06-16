import Gutters from '@/core/ui/grid/Gutters';
import { ComponentType, ReactNode } from 'react';
import { Box, Button, SvgIconProps, Tooltip, TooltipProps } from '@mui/material';
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

export interface RadioButtonsGroupProps<Value> {
  value: Value | undefined;
  options: RadioButtonOption<Value>[];
  onChange?: (value: Value) => void;
  readOnly?: boolean;
  tooltipProps?: Partial<TooltipProps>;
}

const RadioButtonsGroup = <Value,>({
  value,
  options,
  onChange,
  readOnly,
  tooltipProps,
}: RadioButtonsGroupProps<Value>) => {
  return (
    <Gutters row disablePadding>
      {options.map(({ value: optionValue, icon: Icon, label, tooltip, disabled }) => (
        <Tooltip title={tooltip} key={String(optionValue)} {...tooltipProps}>
          <Box>
            <Button
              key={String(optionValue)}
              disabled={readOnly || disabled}
              onClick={() => onChange?.(optionValue)}
              sx={{
                flexShrink: 1,
                textTransform: 'none',
                '&.Mui-disabled': value === optionValue ? { color: 'primary.main' } : {},
              }}
              startIcon={
                Icon && (
                  <SwapColors swap={value === optionValue}>
                    <Gutters
                      disablePadding
                      sx={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: value === optionValue ? 'background.paper' : undefined,
                        borderRadius: gutters(),
                        width: gutters(2),
                        height: gutters(2),
                      }}
                    >
                      <Icon color="primary" />
                    </Gutters>
                  </SwapColors>
                )
              }
            >
              <Caption whiteSpace="wrap">{label}</Caption>
            </Button>
          </Box>
        </Tooltip>
      ))}
    </Gutters>
  );
};

export default RadioButtonsGroup;

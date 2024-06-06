import Gutters from '../../grid/Gutters';
import { ComponentType, ReactNode } from 'react';
import { Box, Button, SvgIconProps, Tooltip } from '@mui/material';
import { Caption } from '../../typography';
import SwapColors from '../../palette/SwapColors';
import { gutters } from '../../grid/utils';

export interface RadioButtonOption<Value> {
  icon: ComponentType<SvgIconProps>;
  value: Value;
  label: ReactNode;
  tooltip?: ReactNode;
}

export interface RadioButtonsGroupProps<Value> {
  value: Value | undefined;
  options: RadioButtonOption<Value>[];
  onChange?: (value: Value) => void;
  readOnly?: boolean;
}

const RadioButtonsGroup = <Value,>({ value, options, onChange, readOnly }: RadioButtonsGroupProps<Value>) => {
  return (
    <Gutters row disablePadding>
      {options.map(({ value: optionValue, icon: Icon, label, tooltip }) => (
        <Tooltip title={tooltip} key={String(optionValue)}>
          <Box>
            <Button
              key={String(optionValue)}
              disabled={readOnly}
              onClick={() => onChange?.(optionValue)}
              sx={{
                flexShrink: 1,
                textTransform: 'none',
                '&.Mui-disabled': value === optionValue ? { color: 'primary.main' } : {},
              }}
              startIcon={
                <SwapColors swap={value === optionValue}>
                  <Gutters
                    disablePadding
                    sx={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'background.paper',
                      borderRadius: gutters(),
                      width: gutters(2),
                      height: gutters(2),
                    }}
                  >
                    <Icon color="primary" />
                  </Gutters>
                </SwapColors>
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

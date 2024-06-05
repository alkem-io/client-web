import Gutters from '../../grid/Gutters';
import { ComponentType, ReactNode } from 'react';
import { Button, SvgIconProps } from '@mui/material';
import { Caption } from '../../typography';
import SwapColors from '../../palette/SwapColors';
import { gutters } from '../../grid/utils';

export interface RadioButtonOption<Value> {
  icon: ComponentType<SvgIconProps>;
  value: Value;
  label: ReactNode;
}

interface RadioButtonsGroupProps<Value> {
  value: Value | undefined;
  options: RadioButtonOption<Value>[];
  onChange?: (value: Value) => void;
}

const RadioButtonsGroup = <Value,>({ value, options, onChange }: RadioButtonsGroupProps<Value>) => {
  return (
    <Gutters row disablePadding>
      {options.map(({ value: optionValue, icon: Icon, label }) => (
        <Button
          key={String(optionValue)}
          onClick={() => onChange?.(optionValue)}
          sx={{ flexShrink: 1, textTransform: 'none' }}
          startIcon={(
            <SwapColors swap={value === optionValue}>
              <Gutters disablePadding sx={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'background.paper', borderRadius: gutters(), width: gutters(2), height: gutters(2) }}>
                <Icon color="primary" />
              </Gutters>
            </SwapColors>
          )}
        >
          <Caption whiteSpace="wrap">
            {label}
          </Caption>
        </Button>
      ))}
    </Gutters>
  );
};

export default RadioButtonsGroup;
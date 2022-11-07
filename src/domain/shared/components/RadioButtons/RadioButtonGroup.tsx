import React, { cloneElement, ReactElement } from 'react';
import { Box, BoxProps } from '@mui/material';
import { RadioButtonProps } from './RadioButton';

interface RadioButtonGroupProps<Value> extends Omit<BoxProps, 'onChange' | 'children'> {
  value: Value;
  disabled?: boolean;
  children: ReactElement<RadioButtonProps<Value>>[];
  onChange: (value: Value) => void;
}

const RadioButtonGroup = <Value,>({
  value,
  onChange,
  disabled,
  children,
  ...boxProps
}: RadioButtonGroupProps<Value>) => {
  const buttons = children.map(element => {
    return cloneElement(element, {
      selected: element.props.value === value,
      disabled: disabled,
      onClick: onChange,
      ...element.props,
    });
  });

  return (
    <Box display="flex" gap={2} {...boxProps}>
      {buttons}
    </Box>
  );
};

export default RadioButtonGroup;

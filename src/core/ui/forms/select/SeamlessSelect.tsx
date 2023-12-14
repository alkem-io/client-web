import { Box, MenuItem, Select, SelectProps, TypographyProps } from '@mui/material';
import { SelectOption } from '@mui/base';
import { ExpandMore } from '@mui/icons-material';
import { gutters } from '../../grid/utils';
import { Caption } from '../../typography';
import React, { ComponentType, ReactNode, useMemo } from 'react';

interface SeamlessSelectProps<Option extends string | number> extends SelectProps {
  label?: ReactNode;
  options: Partial<SelectOption<Option>>[];
  typographyComponent?: ComponentType<TypographyProps>;
}

const SeamlessSelect = <Option extends string | number>({
  value,
  options,
  label,
  typographyComponent: Typography = Caption,
  ...props
}: SeamlessSelectProps<Option>) => {
  const selectedOption = useMemo(() => options.find(option => option.value === value), [value, options]);

  return (
    <Select
      value={value}
      size="small"
      IconComponent={ExpandMore}
      sx={{
        height: gutters(2),
        '.MuiOutlinedInput-notchedOutline': { border: 'none' },
        '.MuiSelect-icon': { top: 0, fontSize: gutters(1) },
      }}
      renderValue={() => (
        <Box display="flex">
          {label && (
            <>
              <Typography>{label}</Typography>
              <Typography whiteSpace="pre"> </Typography>
            </>
          )}
          <Typography color="primary" maxWidth="22vw" noWrap>
            {selectedOption?.label}
          </Typography>
        </Box>
      )}
      {...props}
    >
      {options.map(({ value, label }) => (
        <MenuItem value={value}>
          <Typography textTransform="none">{label}</Typography>
        </MenuItem>
      ))}
    </Select>
  );
};

export default SeamlessSelect;

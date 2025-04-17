import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { SearchScope } from '@/main/ui/platformSearch/PlatformSearch';
import { ExpandMore } from '@mui/icons-material';
import { Box, MenuItem, Select, SelectProps, TypographyProps } from '@mui/material';
import { ComponentType, ReactNode, useMemo } from 'react';

export interface CustomSelectOption<Option extends string | number | SearchScope> {
  value: Option;
  label: ReactNode;
}

type SeamlessSelectProps<Option extends string | number | SearchScope> = {
  label?: ReactNode;
  options: CustomSelectOption<Option>[];
  typographyComponent?: ComponentType<TypographyProps>;
} & SelectProps;

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
      {options.map(({ value, label }, index) => (
        <MenuItem value={value} key={`option_${index}`}>
          <Typography textTransform="none">{label}</Typography>
        </MenuItem>
      ))}
    </Select>
  );
};

export default SeamlessSelect;

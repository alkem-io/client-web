import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { SearchScope } from '@/main/ui/platformSearch/PlatformSearch';
import { ExpandMore } from '@mui/icons-material';
import { Box, MenuItem, Select, SelectChangeEvent, SelectProps, TypographyProps } from '@mui/material';
import { ComponentType, ReactNode, useMemo } from 'react';

export interface CustomSelectOption<Option extends string | number | SearchScope> {
  value: Option;
  label: ReactNode;
}

type SeamlessSelectProps<Option extends string | number | SearchScope> = {
  label?: string;
  options: CustomSelectOption<Option>[];
  typographyComponent?: ComponentType<TypographyProps>;
  onOpen?: () => void;
  onClose?: () => void;
  onChange?: (event: SelectChangeEvent<Option>) => void;
  value?: Option;

  /**
   * Set it to true if it's inside a flex box and you expect the options to have long labels that might not fit in the container box.
   */
  shrink?: boolean;
} & SelectProps;

const SeamlessSelect = <Option extends string | number>({
  value,
  options,
  label,
  typographyComponent: Typography = Caption,
  shrink = false,
  onChange,
  onClose,
  onOpen,
  sx = {},
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
        ...(shrink ? { flexShrink: 1, minWidth: 0, textOverflow: 'ellipsis' } : {}),
        ...sx,
      }}
      inputProps={{
        'aria-label': label,
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
      onOpen={onOpen}
      onClose={onClose}
      onChange={onChange}
    >
      {options.map(({ value, label }, index) => (
        <MenuItem value={value} key={`option_${index}`}>
          <Typography textTransform="none" overflow="hidden" textOverflow="ellipsis">
            {label}
          </Typography>
        </MenuItem>
      ))}
    </Select>
  );
};

export default SeamlessSelect;

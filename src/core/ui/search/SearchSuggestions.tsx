import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { Chip } from '@mui/material';
import { differenceBy } from 'lodash';

interface SearchSuggestionsProps<Option extends string> {
  title: string;
  value: Option[];
  options: Option[];
  onSelect: (option: Option) => void;
}

const SearchSuggestions = <Option extends string>({
  title,
  value,
  options,
  onSelect,
}: SearchSuggestionsProps<Option>) => {
  const optionsShown = useMemo(() => differenceBy(options, value, option => option.toLowerCase()), [options, value]);

  return (
    <Box display="flex" gap={gutters(0.5)} flexWrap="wrap">
      <Caption>{title}</Caption>
      {optionsShown.map(term => (
        <Chip key={term} label={term} variant="filled" color="primary" onClick={() => onSelect(term)} />
      ))}
    </Box>
  );
};

export default SearchSuggestions;

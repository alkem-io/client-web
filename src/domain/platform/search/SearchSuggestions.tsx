import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import { gutters } from '../../../core/ui/grid/utils';
import { Caption } from '../../../core/ui/typography';
import { Chip } from '@mui/material';
import { differenceBy } from 'lodash';
import { useTranslation } from 'react-i18next';

interface SearchSuggestionsProps<Option extends string> {
  value: Option[];
  options: Option[];
  onSelect: (option: Option) => void;
}

// TODO remove
const SearchSuggestions = <Option extends string>({ value, options, onSelect }: SearchSuggestionsProps<Option>) => {
  const { t } = useTranslation();

  const optionsShown = useMemo(() => differenceBy(options, value, option => option.toLowerCase()), [options, value]);

  return (
    <Box display="flex" gap={gutters(0.5)} flexWrap="wrap" marginTop={gutters(1)}>
      <Caption>{t('pages.search.search-suggestions')}</Caption>
      <Box display="flex" gap={gutters(0.5)} flexWrap="wrap">
        {optionsShown.map(term => (
          <Chip key={term} label={term} variant="filled" color="primary" onClick={() => onSelect(term)} />
        ))}
      </Box>
    </Box>
  );
};

export default SearchSuggestions;

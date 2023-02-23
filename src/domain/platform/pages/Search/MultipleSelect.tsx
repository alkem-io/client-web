import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { FC, KeyboardEventHandler, useMemo, useRef, useState } from 'react';
import { Chip, TextField } from '@mui/material';
import { differenceBy, uniq } from 'lodash';
import { useTranslation } from 'react-i18next';
import { gutters } from '../../../../core/ui/grid/utils';
import { Caption } from '../../../../core/ui/typography';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import { MAX_TERMS_SEARCH } from './SearchPage';

interface MultipleSelectProps {
  selectedTerms: string[];
  suggestions: string[];
  onChange: (terms: string[]) => void;
  disabled?: boolean;
  minLength?: number;
}

const filterTerms = (values: string[] | undefined) => {
  return uniq(values?.map(item => item?.trim()).filter(item => item)) ?? [];
};

interface SelectedTermsProps {
  selectedTerms: string[];
  disabled?: boolean;
  handleRemove: (term: string) => void;
}

const SelectedTerms: FC<SelectedTermsProps> = ({ selectedTerms, disabled, handleRemove }) => {
  const breakpoint = useCurrentBreakpoint();

  return (
    <Box
      flex={5}
      display="flex"
      flexWrap={['xl', 'lg', 'md'].includes(breakpoint) ? 'nowrap' : 'wrap'}
      justifyContent="flex-end"
      gap={gutters(0.5)}
      margin={gutters(0.5)}
    >
      {selectedTerms.map((term, index) => (
        <Chip key={index} label={term} color="primary" onDelete={() => (disabled ? undefined : handleRemove(term))} />
      ))}
    </Box>
  );
};

const MultipleSelect: FC<MultipleSelectProps> = ({ selectedTerms, suggestions, onChange, disabled, minLength = 2 }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>();

  const [isTooltipShown, setTooltipShown] = useState<boolean>(false);

  const resetInput = (): void => {
    inputRef.current && (inputRef.current.value = '');
  };

  const checkMaxTermsReached = (): boolean => {
    if (selectedTerms.length >= MAX_TERMS_SEARCH) {
      setTooltipShown(true);
      setTimeout(() => setTooltipShown(false), 5000);
      return true;
    } else {
      setTooltipShown(false);
      return false;
    }
  };

  const handleSelect = (term: string): void => {
    if (checkMaxTermsReached()) return;
    // If it's already selected:
    if (selectedTerms.find(el => el === term)) return;
    // If it's empty or whitespace
    if (!term.trim()) return;
    if (disabled) return;

    const newSelected = filterTerms([...selectedTerms, term]);

    resetInput();
    onChange(newSelected);
  };

  const handleRemove = (term: string) => {
    const newSelected = selectedTerms.filter(el => el !== term);

    setTooltipShown(false);
    onChange(newSelected);
  };

  const handleSearch = (value?: string) => {
    if (!value || value.trim().length === 0) {
      return;
    }

    return handleSelect(value);
  };

  const handleInputChange: KeyboardEventHandler<HTMLInputElement> = e => {
    const value = inputRef.current?.value?.trim();
    if (!value || value.length < minLength) return;
    if (e.key === 'Enter') {
      handleSearch(value);
    }
  };

  const suggestionsShown = useMemo(
    () => differenceBy(suggestions, selectedTerms, s => s.toLowerCase()),
    [suggestions, selectedTerms]
  );

  return (
    <Box>
      <Tooltip
        id="overlay-example"
        title={t('pages.search.max-tags-reached', { max: MAX_TERMS_SEARCH })}
        open={isTooltipShown}
        arrow
      >
        <TextField
          inputRef={inputRef}
          onKeyDown={handleInputChange}
          placeholder={t('pages.search.placeholder')}
          InputProps={{
            disabled: disabled,
            endAdornment: (
              <>
                <SelectedTerms selectedTerms={selectedTerms} disabled={disabled} handleRemove={handleRemove} />
                <IconButton onClick={() => handleSearch()} disabled={disabled}>
                  <SearchIcon color="primary" />
                </IconButton>
              </>
            ),
            sx: { backgroundColor: theme => theme.palette.common.white, '& input': { flex: 2 } },
          }}
          sx={{ width: '100%' }}
        />
      </Tooltip>

      <Box display="flex" gap={gutters(0.5)} flexWrap="wrap" marginTop={gutters(1)}>
        <Caption>{t('pages.search.search-suggestions')}</Caption>
        <Box display="flex" gap={gutters(0.5)} flexWrap="wrap">
          {suggestionsShown.map(term => (
            <Chip key={term} label={term} variant="filled" color="primary" onClick={() => handleSelect(term)} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default MultipleSelect;

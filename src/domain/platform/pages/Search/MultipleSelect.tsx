import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { FC, KeyboardEventHandler, useEffect, useRef, useState } from 'react';
import { Chip, TextField } from '@mui/material';
import { uniq } from 'lodash';
import { useTranslation } from 'react-i18next';
import { gutters } from '../../../../core/ui/grid/utils';
import { Caption } from '../../../../core/ui/typography';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import { MAX_TERMS_SEARCH } from './SearchPage';

interface MultipleSelectProps {
  elements: string[];
  onChange?: (elements: string[]) => void;
  onSearch?: () => void;
  defaultValue?: string[];
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

const MultipleSelect: FC<MultipleSelectProps> = ({
  elements: _elements,
  onChange,
  onSearch,
  defaultValue,
  disabled,
  minLength = 2,
}) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>();

  const [elements, setElements] = useState<string[]>(_elements || []);
  const [elementsNoFilter, setElementsNoFilter] = useState<string[]>(_elements || []);
  const [selectedElements, setSelected] = useState<string[]>(filterTerms(defaultValue));
  const [isTooltipShown, setTooltipShown] = useState<boolean>(false);

  useEffect(() => setElements(_elements), [_elements]);
  useEffect(() => {
    if (defaultValue && defaultValue.length > 0) {
      setSelected(filterTerms(defaultValue));
    }
  }, [defaultValue]);

  const resetInput = (): void => {
    inputRef.current && (inputRef.current.value = '');
  };

  const checkMaxTermsReached = (): boolean => {
    if (selectedElements.length >= MAX_TERMS_SEARCH) {
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
    if (selectedElements.find(el => el === term)) return;
    // If it's empty or whitespace
    if (!term.trim()) return;
    if (disabled) return;

    const newSelected = filterTerms([...selectedElements, term]);
    const newElements = elementsNoFilter.filter(el => el !== term);

    resetInput();
    setSelected(newSelected);
    setElements(newElements);
    setElementsNoFilter(newElements);
    onChange && onChange(newSelected);
  };

  const handleRemove = (term: string) => {
    const newSelected = selectedElements.filter(el => el !== term);
    const newElements = [...elements, term];

    setTooltipShown(false);
    setSelected(newSelected);
    setElements(newElements);
    setElementsNoFilter(newElements);
    onChange && onChange(newSelected);
  };

  const handleSearch = (value?: string) => {
    value = value ?? inputRef.current?.value;

    if (!value || value.trim().length === 0) {
      return;
    }

    if (checkMaxTermsReached()) return;

    const isAlreadySelected = selectedElements.find(el => el === value);
    if (isAlreadySelected) return;

    const newElements = elementsNoFilter.filter(el => el !== value);
    const newSelected = filterTerms([...selectedElements, value]);

    resetInput();
    setElementsNoFilter(newElements);
    setSelected(newSelected);
    onChange && onChange(newSelected);
    onSearch && onSearch();
  };

  const handleInputChange: KeyboardEventHandler<HTMLInputElement> = e => {
    const value = inputRef.current?.value?.trim();
    if (!value || value.length < minLength) return;
    if (e.key === 'Enter') {
      handleSearch(value);
    }
  };

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
                <SelectedTerms selectedTerms={selectedElements} disabled={disabled} handleRemove={handleRemove} />
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
        {elements.map((el, index) => {
          return <Chip key={index} label={el} variant="filled" color="primary" onClick={() => handleSelect(el)} />;
        })}
      </Box>
    </Box>
  );
};

export default MultipleSelect;

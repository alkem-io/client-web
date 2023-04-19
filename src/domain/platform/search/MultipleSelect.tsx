import SearchIcon from '@mui/icons-material/Search';
import Box, { BoxProps } from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, { ChangeEventHandler, FC, KeyboardEventHandler, Ref, useState } from 'react';
import { Chip, TextField } from '@mui/material';
import { uniq } from 'lodash';
import { useTranslation } from 'react-i18next';
import { gutters } from '../../../core/ui/grid/utils';
import useCurrentBreakpoint from '../../../core/ui/utils/useCurrentBreakpoint';
import { MAX_TERMS_SEARCH } from './SearchView';
import { InputBaseProps } from '@mui/material/InputBase';

export interface MultipleSelectProps {
  value: string[];
  onChange: (terms: string[]) => void;
  disabled?: boolean;
  minLength?: number;
  autoFocus?: boolean;
  size?: 'medium' | 'small' | 'xsmall';
  inputProps?: {
    inputRef?: Ref<HTMLInputElement | null>;
    onBlur?: InputBaseProps['onBlur'];
  };
  containerProps?: BoxProps;
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
  value,
  onChange,
  disabled,
  minLength = 2,
  autoFocus,
  size = 'medium',
  inputProps,
  containerProps,
  children,
}) => {
  const { t } = useTranslation();

  const [isTooltipShown, setTooltipShown] = useState<boolean>(false);

  const [textInput, setTextInput] = useState('');

  const handleChange: ChangeEventHandler<HTMLInputElement> = event => setTextInput(event.target.value);

  const checkMaxTermsReached = (): boolean => {
    if (value.length >= MAX_TERMS_SEARCH) {
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
    if (value.find(el => el === term)) return;
    // If it's empty or whitespace
    if (!term.trim()) return;
    if (disabled) return;

    const newSelected = filterTerms([...value, term]);

    setTextInput('');
    onChange(newSelected);
  };

  const handleRemove = (term: string) => {
    const newSelected = value.filter(el => el !== term);

    setTooltipShown(false);
    onChange(newSelected);
  };

  const handleSearch = (value?: string) => {
    if (!value || value.trim().length === 0) {
      return;
    }

    return handleSelect(value);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = event => {
    if (textInput.length < minLength) {
      return;
    }
    if (event.key === 'Enter') {
      handleSearch(textInput);
    }
  };

  return (
    <Box {...containerProps}>
      <Tooltip
        id="overlay-example"
        title={t('pages.search.max-tags-reached', { max: MAX_TERMS_SEARCH })}
        open={isTooltipShown}
        arrow
      >
        <TextField
          value={textInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={t('pages.search.placeholder')}
          InputProps={{
            disabled: disabled,
            endAdornment: (
              <>
                <SelectedTerms selectedTerms={value} disabled={disabled} handleRemove={handleRemove} />
                <IconButton onClick={() => handleSearch(textInput)} disabled={disabled}>
                  <SearchIcon color="primary" />
                </IconButton>
              </>
            ),
            sx: { backgroundColor: theme => theme.palette.common.white, '& input': { flex: 2 } },
          }}
          autoFocus={autoFocus}
          // Size xsmall is a special case, input will have `small` size and we set the height with CSS
          sx={theme => ({
            width: '100%',
            '.MuiInputBase-root': { height: size === 'xsmall' ? theme.spacing(3) : undefined },
          })}
          size={size === 'xsmall' ? 'small' : size}
          {...inputProps}
        />
      </Tooltip>
      {children}
    </Box>
  );
};

export default MultipleSelect;

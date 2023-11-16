import SearchIcon from '@mui/icons-material/Search';
import Box, { BoxProps } from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import React, {
  ChangeEventHandler,
  FC,
  KeyboardEventHandler,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Chip, TextField, Theme, useMediaQuery } from '@mui/material';
import { delay, uniq } from 'lodash';
import { useTranslation } from 'react-i18next';
import { gutters } from '../grid/utils';
import { MAX_TERMS_SEARCH } from '../../../main/search/SearchView';

export interface MultipleSelectProps {
  value: string[];
  onChange: (terms: string[]) => void;
  disabled?: boolean;
  minLength?: number;
  autoFocus?: boolean;
  size?: 'medium' | 'small' | 'xsmall';
  containerProps?: BoxProps;
  autoShrink?: boolean;
}

const filterTerms = (values: string[] | undefined) => {
  return uniq(values?.map(item => item?.trim()).filter(item => item)) ?? [];
};

interface SelectedTermsProps {
  selectedTerms: string[];
  disabled?: boolean;
  handleRemove: (term: string) => void;
  maxTermsVisible?: number;
}

const SelectedTerms: FC<SelectedTermsProps> = ({
  selectedTerms,
  maxTermsVisible = selectedTerms.length,
  disabled,
  handleRemove,
}) => {
  return (
    <Box
      display="flex"
      flexWrap="nowrap"
      justifyContent="flex-end"
      gap={gutters(0.5)}
      margin={gutters(0.5)}
      maxWidth="40%"
    >
      {selectedTerms.slice(0, maxTermsVisible).map((term, index) => (
        <Chip key={index} label={term} color="primary" onDelete={() => (disabled ? undefined : handleRemove(term))} />
      ))}
      {selectedTerms.length > maxTermsVisible && (
        <Tooltip title={selectedTerms.join(', ')} arrow>
          <Chip key="ellipsis" label="..." />
        </Tooltip>
      )}
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
  autoShrink,
  containerProps,
  children,
}) => {
  const { t } = useTranslation();

  const normalizedValue = value.slice(0, MAX_TERMS_SEARCH);

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const [isShrunk, setShrink] = useState<boolean>();

  useLayoutEffect(() => {
    if (isShrunk === undefined && isMobile && autoShrink) {
      setShrink(true);
    }
  }, [autoShrink, isMobile, isShrunk]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!isShrunk) {
      inputRef.current?.focus();
    }
  }, [isShrunk, inputRef.current]);

  const [isTooltipShown, setTooltipShown] = useState<boolean>(false);

  const [textInput, setTextInput] = useState('');

  const handleTextInputChange: ChangeEventHandler<HTMLInputElement> = event => setTextInput(event.target.value);

  const checkMaxTermsReached = (): boolean => {
    if (normalizedValue.length === MAX_TERMS_SEARCH) {
      setTooltipShown(true);
      setTimeout(() => setTooltipShown(false), 5000);
      return true;
    } else {
      setTooltipShown(false);
      return false;
    }
  };

  useEffect(() => {
    if (value.length > MAX_TERMS_SEARCH) {
      setTooltipShown(true);
      setTimeout(() => setTooltipShown(false), 5000);
    }
  }, [value.length]);

  const handleSelect = (term: string): void => {
    if (checkMaxTermsReached()) return;
    // If it's already selected:
    if (normalizedValue.find(el => el === term)) return;
    // If it's empty or whitespace
    if (!term.trim()) return;
    if (disabled) return;

    const newSelected = filterTerms([...normalizedValue, term]);

    setTextInput('');
    onChange(newSelected);
  };

  const handleRemove = (term: string) => {
    const newSelected = normalizedValue.filter(el => el !== term);

    setTooltipShown(false);
    onChange(newSelected);
    setShrink(false);
  };

  const handleSearch = (textInput?: string) => {
    if (!textInput || textInput.trim().length === 0) {
      return;
    }

    return handleSelect(textInput);
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
      {isShrunk ? (
        <IconButton onClick={() => setShrink(false)} aria-label={t('common.search')}>
          <SearchIcon color="primary" />
        </IconButton>
      ) : (
        <>
          <Tooltip
            id="overlay-example"
            title={t('pages.search.max-tags-reached', { max: MAX_TERMS_SEARCH })}
            open={isTooltipShown}
            arrow
          >
            <Box>
              <TextField
                value={textInput}
                onChange={handleTextInputChange}
                onKeyDown={handleKeyDown}
                placeholder={t('pages.search.placeholder')}
                InputProps={{
                  disabled: disabled,
                  endAdornment: (
                    <>
                      <SelectedTerms
                        selectedTerms={normalizedValue}
                        disabled={disabled}
                        handleRemove={handleRemove}
                        maxTermsVisible={isMobile ? 1 : MAX_TERMS_SEARCH}
                      />
                      <IconButton
                        onClick={() => handleSearch(textInput)}
                        disabled={disabled}
                        aria-label={t('common.search')}
                      >
                        <SearchIcon color="primary" />
                      </IconButton>
                    </>
                  ),
                  sx: {
                    backgroundColor: theme => theme.palette.common.white,
                    '& input': { flex: 2, minWidth: theme => theme.spacing(10) },
                  },
                }}
                onBlur={() => {
                  if (isMobile && autoShrink) {
                    // Delay this to allow the click on the SelectedTerms event remove searchTerms
                    delay(() => {
                      setShrink(true);
                    }, 100);
                  }
                }}
                autoFocus={autoFocus}
                // Size xsmall is a special case, input will have `small` size and we set the height with CSS
                sx={theme => ({
                  width: '100%',
                  '.MuiInputBase-root': { height: size === 'xsmall' ? theme.spacing(3) : undefined },
                })}
                size={size === 'xsmall' ? 'small' : size}
                inputRef={inputRef}
              />
            </Box>
          </Tooltip>
          {children}
        </>
      )}
    </Box>
  );
};

export default MultipleSelect;

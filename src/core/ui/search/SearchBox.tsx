import React, { useRef, useState } from 'react';
import { Box, ClickAwayListener, Collapse, Divider, InputBase, InputBaseProps, MenuItem, Select } from '@mui/material';
import { ExpandMore, Search } from '@mui/icons-material';
import { gutters } from '../grid/utils';
import { BlockSectionTitle } from '../typography';
import { SelectOption } from '@mui/base/SelectUnstyled/useSelect.types';
import NavigationItemContainer from '../navigation/NavigationItemContainer';
import NavigationItemButton from '../navigation/NavigationItemButton';
import { useTranslation } from 'react-i18next';

interface SearchBoxProps<Option> {
  searchTerms: string;
  defaultSearchOption: Option;
  searchOptions?: SelectOption<Option>[];
  onSearch?: (searchOption: Option) => void;
  onChange?: InputBaseProps['onChange'];
}

const SearchBox = <Option extends string | number>({
  searchTerms,
  onSearch,
  defaultSearchOption,
  searchOptions,
  onChange,
}: SearchBoxProps<Option>) => {
  const { t } = useTranslation();
  const [searchOption, setSearchOption] = useState(defaultSearchOption);

  const handleClickSearch = () => {
    if (searchTerms) {
      onSearch?.(searchOption);
    } else {
      setIsExpanded(false);
    }
  };

  const handleKeyUp = ({ code }: React.KeyboardEvent<HTMLInputElement>) => {
    if (code === 'Enter' || code === 'NumpadEnter') {
      onSearch?.(searchOption);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleExpand = () => {
    inputRef.current?.focus();
    setIsExpanded(true);
  };

  // Ref is chosen instead of state because we need relevant value immediately.
  // Also this flag doesn't affect the rendered state.
  const selectOpenStateRef = useRef(false);

  const handleClickAway = () => {
    if (!searchTerms && !selectOpenStateRef.current) {
      setIsExpanded(false);
    }
  };

  const handleSelectOpen = () => {
    selectOpenStateRef.current = true;
  };
  const handleSelectClose = () => {
    selectOpenStateRef.current = false;
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <NavigationItemContainer display="flex">
        <Collapse in={isExpanded} orientation="horizontal" collapsedSize="1px" sx={{ marginRight: '-1px' }}>
          <Box display="flex" alignItems="center">
            {searchOptions && (
              <>
                <Select
                  onOpen={handleSelectOpen}
                  onClose={handleSelectClose}
                  value={searchOption}
                  onChange={event => setSearchOption(event.target.value as Option)}
                  size="small"
                  IconComponent={ExpandMore}
                  sx={{
                    height: gutters(2),
                    '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                    '.MuiSelect-icon': { top: 0, fontSize: gutters(1) },
                  }}
                  renderValue={() => (
                    <Box display="flex">
                      <BlockSectionTitle>{t('components.search.searchIn')}</BlockSectionTitle>
                      <BlockSectionTitle whiteSpace="pre"> </BlockSectionTitle>
                      <BlockSectionTitle color="primary">
                        {searchOptions?.find(({ value }) => value === searchOption)?.label}
                      </BlockSectionTitle>
                    </Box>
                  )}
                >
                  {searchOptions?.map(({ value, label }) => (
                    <MenuItem value={value}>
                      <BlockSectionTitle textTransform="none">{label}</BlockSectionTitle>
                    </MenuItem>
                  ))}
                </Select>
                <Divider orientation="vertical" sx={{ height: gutters(1) }} />
              </>
            )}
            <InputBase
              inputRef={inputRef}
              value={searchTerms}
              sx={{
                '.MuiInputBase-input': theme => ({
                  ...theme.typography.h4,
                  padding: gutters(0.5),
                  minWidth: gutters(11),
                }),
              }}
              onChange={onChange}
              onKeyUp={handleKeyUp}
            />
          </Box>
        </Collapse>
        <NavigationItemButton onClick={isExpanded ? handleClickSearch : handleExpand}>
          <Search color="primary" />
        </NavigationItemButton>
      </NavigationItemContainer>
    </ClickAwayListener>
  );
};

export default SearchBox;

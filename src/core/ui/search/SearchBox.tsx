import React, { useRef, useState } from 'react';
import {
  Box,
  ClickAwayListener,
  Collapse,
  Divider,
  IconButton,
  InputBase,
  InputBaseProps,
  MenuItem,
  Select,
} from '@mui/material';
import { ExpandMore, Search } from '@mui/icons-material';
import { gutters } from '../grid/utils';
import { BlockSectionTitle } from '../typography';
import { SelectOption } from '@mui/base/SelectUnstyled/useSelect.types';

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
  const [searchOption, setSearchOption] = useState(defaultSearchOption);

  const handleClickSearch = () => onSearch?.(searchOption);

  const handleKeyUp = ({ code }: React.KeyboardEvent<HTMLInputElement>) => {
    if (code === 'Enter' || code === 'NumpadEnter') {
      onSearch?.(searchOption);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleExpand = () => {
    inputRef.current?.focus();
    console.log(inputRef.current);
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    if (!searchTerms) {
      setIsExpanded(false);
    }
  };

  return (
    <ClickAwayListener onClickAway={handleCollapse}>
      <Box
        display="flex"
        height={gutters(2)}
        marginY={1}
        borderRadius={theme => `${theme.shape.borderRadius}px`}
        sx={{ backgroundColor: theme => theme.palette.background.paper }}
      >
        <Collapse in={isExpanded} orientation="horizontal" collapsedSize="1px" sx={{ marginRight: '-1px' }}>
          <Box display="flex" alignItems="center">
            {searchOptions && (
              <>
                <Select
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
                      <BlockSectionTitle>Search in:</BlockSectionTitle>
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
        <IconButton
          sx={{ borderRadius: theme => `${theme.shape.borderRadius}px` }}
          onClick={isExpanded ? handleClickSearch : handleExpand}
        >
          <Search color="primary" />
        </IconButton>
      </Box>
    </ClickAwayListener>
  );
};

export default SearchBox;

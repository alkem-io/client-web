import React, { ReactElement, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { Box, BoxProps, ClickAwayListener, Collapse, Divider, InputBase, InputBaseProps } from '@mui/material';
import { Search } from '@mui/icons-material';
import { gutters } from '../grid/utils';
import { BlockSectionTitle } from '../typography';
import NavigationItemContainer from '../navigation/NavigationItemContainer';
import NavigationItemButton from '../navigation/NavigationItemButton';
import { useTranslation } from 'react-i18next';
import { useResizeDetector } from 'react-resize-detector';
import { Collapsible } from '../navigation/Collapsible';
import SeamlessSelect, { CustomSelectOption } from '../forms/select/SeamlessSelect';
import { ActivityFeedRoles } from '@/core/apollo/generated/graphql-schema';
import { ROLE_OPTION_ALL } from '@/main/topLevelPages/myDashboard/latestContributions/LatestContributionsProps';

interface SearchBoxProps<Option extends string | number | ActivityFeedRoles | typeof ROLE_OPTION_ALL> {
  searchTerms: string;
  defaultSearchOption: Option;
  searchOptions?: CustomSelectOption<Option>[];
  onSearch?: (searchOption: Option) => void;
  onChange?: InputBaseProps['onChange'];
  onExpand?: (isExpanded: boolean) => void;
  compact?: boolean;
}

const SearchBox = (<Option extends string | number>({
  ref: forwardedRef,
  searchTerms,
  onSearch,
  defaultSearchOption,
  searchOptions,
  onChange,
  onExpand,
  compact = false,
  children,
  ...props
}: BoxProps & SearchBoxProps<Option> & Collapsible) => {
  const { t } = useTranslation();
  const [searchOption, setSearchOption] = useState(defaultSearchOption);

  const handleClickSearch = () => {
    if (searchTerms) {
      onSearch?.(searchOption);
    } else {
      setIsExpanded(false);
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { code } = event;
    if (code === 'Enter' || code === 'NumpadEnter') {
      onSearch?.(searchOption);
    }
    handleEscape(event);
  };

  const handleEscape = ({ code }: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
    if (code === 'Escape') {
      setIsExpanded(false);
    }
  };

  const [isExpanded, setIsExpanded] = useState(false);

  useLayoutEffect(() => {
    onExpand?.(isExpanded);
  }, [isExpanded]);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleExpand = () => {
    inputRef.current?.focus();
    setIsExpanded(true);
  };

  // Ref is chosen instead of state because we need relevant value immediately.
  // Also this flag doesn't affect the rendered state.
  const selectOpenStateRef = useRef(false);

  const handleClickAway = () => {
    if (!selectOpenStateRef.current) {
      setIsExpanded(false);
    }
  };

  const handleSelectOpen = () => {
    selectOpenStateRef.current = true;
  };

  const handleSelectClose = () => {
    selectOpenStateRef.current = false;
  };

  const { ref, width } = useResizeDetector();

  useImperativeHandle(forwardedRef, () => {
    const collapse = () => {
      inputRef.current?.blur();
      setIsExpanded(false);
    };

    return { collapse };
  }, []);

  return (
    <Box ref={ref} display="flex" justifyContent="end" {...props}>
      <ClickAwayListener onClickAway={handleClickAway}>
        <NavigationItemContainer display="flex" justifyContent="end" position="relative">
          {children}
          <Collapse
            id="search-box"
            in={isExpanded}
            orientation="horizontal"
            aria-hidden={!isExpanded}
            sx={{ marginRight: '-1px' }}
          >
            <Box
              flexGrow={1}
              display="flex"
              alignItems="center"
              width={theme => `calc(${width}px - ${gutters(2)(theme)})`}
            >
              {searchOptions && (
                <>
                  <SeamlessSelect
                    onOpen={handleSelectOpen}
                    onClose={handleSelectClose}
                    value={searchOption}
                    options={searchOptions}
                    onChange={event => setSearchOption(event.target.value as Option)}
                    label={t(`components.search.searchScope.${compact ? 'short' : 'full'}`)}
                    typographyComponent={BlockSectionTitle}
                  />
                  <Divider orientation="vertical" sx={{ height: gutters(1) }} />
                </>
              )}
              <InputBase
                inputRef={inputRef}
                value={searchTerms}
                sx={{
                  flexGrow: 1,
                  '.MuiInputBase-input': theme => ({
                    ...theme.typography.h4,
                    padding: gutters(0.5),
                  }),
                }}
                onChange={onChange}
                onKeyUp={handleKeyUp}
                fullWidth
                inputProps={{
                  'aria-label': t('common.search'),
                }}
              />
            </Box>
          </Collapse>
          <NavigationItemButton
            color="primary"
            onClick={isExpanded ? handleClickSearch : handleExpand}
            onKeyUp={handleEscape}
            aria-label={t('common.search')}
            aria-expanded={isExpanded}
            aria-controls="search-box"
          >
            <Search />
          </NavigationItemButton>
        </NavigationItemContainer>
      </ClickAwayListener>
    </Box>
  );
}) as <Option extends string | number>(props: BoxProps & SearchBoxProps<Option>) => ReactElement;

export default SearchBox;

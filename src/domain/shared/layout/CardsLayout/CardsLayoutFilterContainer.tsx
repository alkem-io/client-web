import { useCallback, useState } from 'react';
import { ContainerChildProps } from '../../../../models/container';
import { PropsWithChildren } from 'react';
import { Box, IconButton, InputAdornment, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import SectionSpacer from '../../components/Section/SectionSpacer';

export interface FilterResult {
  matchedTerms: string[] | undefined;
}

export interface CardsLayoutFilterContainerEntities<T> {
  filteredItems: (T & FilterResult)[];
}

export interface CardsLayoutFilterContainerActions {}

export interface CardsLayoutFilterContainerState {}

export interface CardsLayoutFilterContainerProps<T>
  extends ContainerChildProps<
    CardsLayoutFilterContainerEntities<T>,
    CardsLayoutFilterContainerActions,
    CardsLayoutFilterContainerState
  > {
  items: T[];
  filter: (item: T, index: number, array: T[], value: string) => boolean;
}

const CardsLayoutFilterContainer = <T extends {}>({
  items,
  filter: filterFunction,
  children,
}: PropsWithChildren<CardsLayoutFilterContainerProps<T>>) => {
  const { t } = useTranslation();
  const [filterString, setFilterString] = useState('');
  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilterString(event.target.value);
    },
    [setFilterString]
  );

  const filteredItems = items
    .filter((item, index, array) => filterFunction(item, index, array, filterString))
    .map(t => ({
      ...t,
      matchedTerms: filterString ? [filterString] : undefined,
    }));

  return (
    <Box padding={2} margin={-2}>
      <TextField
        value={filterString}
        onChange={handleFilterChange}
        aria-label="Search"
        placeholder={t('common.search')}
        margin="dense"
        sx={{
          padding: 0,
          margin: 0,
          width: '100%',
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton>
                <SearchIcon color="primary" />
              </IconButton>
            </InputAdornment>
          ),
          size: 'small',
          sx: { paddingRight: '4px' },
        }}
        variant="outlined"
      />
      <SectionSpacer />
      <Box margin={-2}>{children({ filteredItems }, {}, {})}</Box>
    </Box>
  );
};

export default CardsLayoutFilterContainer;

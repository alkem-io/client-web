import { GridLegacy, MenuItem, TextField } from '@mui/material';
import { orderBy } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface sortItem<T> {
  key: keyof T;
  name: string;
  order?: 'asc' | 'desc';
  default?: boolean;
}

type FilterProps<T> = {
  data: T[];
  limitKeys?: Array<keyof T>;
  includeKeys?: Array<keyof T>;
  sort?: sortItem<T>[];
  placeholder?: string;
  children: (filteredData: T[]) => void;
};

export function Filter<T>({ data, limitKeys = [], sort, placeholder, children }: FilterProps<T>): React.ReactElement {
  const { t } = useTranslation();
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState<sortItem<T> | undefined>(undefined);

  useEffect(() => {
    const defaultSort = sort?.find(s => s.default);
    if (defaultSort) setSortBy(defaultSort);
  }, [sort]);

  const filteredData = useMemo(() => {
    const filtered = data.filter(item => {
      if (!filterBy) return true;
      for (const key in item) {
        if (limitKeys.length) {
          if (!limitKeys.includes(key)) continue;
        }
        const value = item[key];
        if (typeof value === 'string') {
          if (value.toLowerCase().includes(filterBy.toLowerCase())) {
            return true;
          }
        }
      }
      return false;
    });

    if (sortBy) {
      return orderBy(filtered, sortBy.key, sortBy.order);
    }
    return filtered;
  }, [data, filterBy, sortBy, limitKeys]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterBy(value);
  };

  const keyFromSortItem = (item?: sortItem<T>) => {
    return item ? `${String(item.key)}-${item.order}` : '';
  };

  return (
    <>
      <GridLegacy container item spacing={2} justifyContent="space-between" alignItems="center">
        <GridLegacy item xs={12} lg={sort ? 9 : 12}>
          <TextField
            placeholder={placeholder ?? t('components.filter.placeholder')}
            onChange={handleSearch}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ background: theme => theme.palette.primary.contrastText }}
          />
        </GridLegacy>
        {sort && (
          <GridLegacy item xs={12} lg={3}>
            <TextField
              fullWidth
              select
              value={keyFromSortItem(sortBy)}
              onChange={event => setSortBy(sort.find(s => keyFromSortItem(s) === (event.target.value as string)))}
              inputProps={{ 'aria-label': 'Discussions sort order' }}
              size="small"
            >
              {sort.map((s, i) => (
                <MenuItem key={i} value={keyFromSortItem(s)}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          </GridLegacy>
        )}
      </GridLegacy>
      {children(filteredData)}
    </>
  );
}

export default Filter;

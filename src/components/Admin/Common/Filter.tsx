import { FormControl, Grid, MenuItem, OutlinedInput, Select } from '@material-ui/core';
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
  }, [data, filterBy, sortBy]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterBy(value);
  };

  const keyFromSortItem = (item?: sortItem<T>) => {
    return item ? `${item.key}-${item.order}` : '';
  };

  return (
    <>
      <Grid container item spacing={2} justifyContent="space-between" alignItems="center">
        <Grid item xs={sort ? 10 : 12}>
          <FormControl fullWidth size={'small'}>
            <OutlinedInput placeholder={placeholder ?? t('components.filter.placeholder')} onChange={handleSearch} />
          </FormControl>
        </Grid>
        {sort && (
          <Grid item xs={2}>
            <FormControl variant="outlined" fullWidth margin="dense">
              <Select
                value={keyFromSortItem(sortBy)}
                onChange={event => setSortBy(sort.find(s => keyFromSortItem(s) === (event.target.value as string)))}
              >
                {sort.map((s, i) => (
                  <MenuItem key={i} value={keyFromSortItem(s)}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
      {children(filteredData)}
    </>
  );
}
export default Filter;

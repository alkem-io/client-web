import { FormControl, Grid, OutlinedInput, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { sortBy as lSortBy } from 'lodash';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
interface sortItem<T> {
  key: keyof T;
  name: string;
}

type FilterProps<T> = {
  data: T[];
  limitKeys?: Array<keyof T>;
  sort?: sortItem<T>[];
  placeholder?: string;
  children: (filteredData: T[]) => void;
};

export function Filter<T>({ data, limitKeys = [], sort, placeholder, children }: FilterProps<T>): React.ReactElement {
  const { t } = useTranslation();
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState<sortItem<T> | null>(null);
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
      return lSortBy(filtered, sortBy.key);
    }
    return filtered;
  }, [data, filterBy, sortBy]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterBy(value);
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
            <FormControl variant="outlined" fullWidth>
              <Autocomplete
                options={sort}
                getOptionLabel={option => option.name}
                renderInput={params => <TextField {...params} label="" margin="dense" variant="outlined" />}
                value={sortBy}
                onChange={(event: any, newValue: sortItem<T> | null) => {
                  setSortBy(newValue);
                }}
              />
            </FormControl>
          </Grid>
        )}
      </Grid>
      {children(filteredData)}
    </>
  );
}
export default Filter;

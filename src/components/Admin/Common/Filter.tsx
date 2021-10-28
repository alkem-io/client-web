import { FormControl, Grid, MenuItem, OutlinedInput, Select } from '@material-ui/core';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type FilterProps<T> = {
  data: T[];
  limitKeys?: Array<keyof T>;
  sort?: boolean;
  children: (filteredData: T[]) => void;
};

export function Filter<T>({ data, limitKeys = [], sort = false, children }: FilterProps<T>): React.ReactElement {
  const { t } = useTranslation();
  const [filterBy, setFilterBy] = useState('');
  const [sortBy, setSortBy] = useState('');
  const filteredData = useMemo(() => {
    return data.filter(item => {
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
  }, [data, filterBy]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterBy(value);
  };

  return (
    <>
      <Grid container item spacing={2} justifyContent="space-between">
        <Grid item xs={sort ? 11 : 12}>
          <FormControl fullWidth size={'small'}>
            <OutlinedInput placeholder={t('components.filter.placeholder')} onChange={handleSearch} />
          </FormControl>
        </Grid>
        {sort && (
          <Grid item xs={1}>
            <FormControl variant="outlined" fullWidth>
              <Select
                value={sortBy}
                onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                  setSortBy(event.target.value as string);
                }}
                variant={'outlined'}
                placeholder={'Sort by'}
                input={<OutlinedInput placeholder={'Sorty by'} margin="dense" />}
              >
                <MenuItem value={'date'}>Date</MenuItem>
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

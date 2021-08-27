import { FormControl, OutlinedInput } from '@material-ui/core';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type FilterProps<T> = {
  data: T[];
  limitKeys?: Array<keyof T>;
  children: (filteredData: T[]) => void;
};

export function Filter<T>({ data, limitKeys = [], children }: FilterProps<T>): React.ReactElement {
  const { t } = useTranslation();
  const [filterBy, setFilterBy] = useState('');

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
      <FormControl fullWidth size={'small'}>
        <OutlinedInput placeholder={t('components.filter.placeholder')} onChange={handleSearch} />
      </FormControl>
      {children(filteredData)}
    </>
  );
}
export default Filter;

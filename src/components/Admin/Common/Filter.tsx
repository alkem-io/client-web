import React, { useMemo, useState } from 'react';
import { FormControl, InputGroup } from 'react-bootstrap';

type FilterProps<T> = {
  data: T[];
  children: (filteredData: T[]) => void;
};

export function Filter<T>({ data, children }: FilterProps<T>): React.ReactElement {
  const [filterBy, setFilterBy] = useState('');

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (!filterBy) return true;
      for (const key in item) {
        const value = item[key];
        if (typeof value === 'string') {
          if (value.includes(filterBy)) {
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
      <InputGroup>
        <FormControl placeholder="Search" arial-label="Search" onChange={handleSearch} />
      </InputGroup>
      {children(filteredData)}
    </>
  );
}
export default Filter;

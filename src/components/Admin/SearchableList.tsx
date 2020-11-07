import React, { FC, useMemo, useState } from 'react';
import { FormControl, InputGroup } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/esm/ListGroup';
import { Link } from 'react-router-dom';

interface SearchableListProps {
  data: { id: number | string; value: string }[];
  url: string;
  edit?: boolean;
  active?: number | string;
}

export const SearchableList: FC<SearchableListProps> = ({ data = [], url: path, edit = false, children, active }) => {
  const [filterBy, setFilterBy] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterBy(value);
  };

  const filteredData = useMemo(
    () => data.filter(item => (filterBy ? item.value.toLowerCase().includes(filterBy.toLowerCase()) : true)),
    [filterBy, data]
  );
  const editSuffix = edit ? '/edit' : '';
  return (
    <>
      <InputGroup>
        <FormControl placeholder="Search" arial-label="Search" onChange={handleSearch} />
      </InputGroup>
      <hr />
      {children}
      <ListGroup>
        {filteredData.map(item => (
          <ListGroup.Item
            as={Link}
            action
            key={item.id}
            to={`${path}/${item.id}${editSuffix}`}
            active={active !== undefined && item.id === active}
          >
            {item.value}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
};

export default SearchableList;

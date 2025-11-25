import React from 'react';
import { Input } from '../../atoms/Input/Input';
import { Button } from '../../atoms/Button/Button';
import { Box } from '@mui/material';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search...', onSearch }) => {
  const [value, setValue] = React.useState('');

  const handleSearch = () => {
    onSearch(value);
  };

  return (
    <Box display="flex" gap={1}>
      <Input value={value} onChange={e => setValue(e.target.value)} label={placeholder} fullWidth />
      <Button onClick={handleSearch} variant="contained">
        Search
      </Button>
    </Box>
  );
};

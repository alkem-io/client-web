import { IconButton, InputAdornment, TextField, TextFieldProps } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

type SearchFieldProps = TextFieldProps & {
  onSearch?: (value: string) => void;
};

const SearchField = ({ onSearch, InputProps, ...props }: SearchFieldProps) => {
  const { t } = useTranslation();

  return (
    <TextField
      placeholder={t('common.search')}
      fullWidth
      variant="outlined"
      size="small"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => onSearch}>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        ),
        ...InputProps,
      }}
      {...props}
    />
  );
};

export default SearchField;

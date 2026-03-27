import { Autocomplete, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useAccountSearch from './useAccountSearch';

const T_PREFIX = 'pages.admin.accountSearch';

type AccountSearchPickerProps = {
  label: string;
  disabled?: boolean;
  onSelect: (accountId: string | undefined) => void;
};

const AccountSearchPicker = ({ label, disabled, onSelect }: AccountSearchPickerProps) => {
  const { t } = useTranslation();
  const { results, loading, hasSearched, handleSearch } = useAccountSearch();

  return (
    <Autocomplete
      options={results}
      getOptionLabel={option => option.name}
      loading={loading}
      disabled={disabled}
      noOptionsText={hasSearched ? t(`${T_PREFIX}.noResults`) : t(`${T_PREFIX}.typeToSearch`)}
      onInputChange={(_event, value) => handleSearch(value)}
      onChange={(_event, value) => onSelect(value?.accountId)}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder={t(`${T_PREFIX}.searchPlaceholder`)}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
      )}
    />
  );
};

export default AccountSearchPicker;

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { Chip } from '@mui/material';
import filterFn, { ValueType } from './filterFn';
import mostCommonTags from './most-common-tags';

export type RequiredFields = {
  id: string;
};

export interface CardFilterProps<T extends RequiredFields> {
  data: T[];
  tagsValueGetter: (data: T) => string[];
  valueGetter: (data: T) => ValueType;
  children: (filteredData: T[]) => React.ReactNode;
}

const CardFilter = <T extends RequiredFields>({ data, tagsValueGetter, valueGetter, children }: CardFilterProps<T>) => {
  const { t } = useTranslation();
  const [terms, setTerms] = useState<string[]>([]);

  const tags = useMemo(() => mostCommonTags(data, tagsValueGetter), [data]);

  const filteredData = useMemo(() => filterFn(data, terms, valueGetter), [data, terms]);

  const handleChange = (e, value: string[]) => {
    const trimmedValues = value.map(x => x.trim().toLowerCase());
    setTerms(trimmedValues);
  };

  if (!data.length) {
    return <>{children(data)}</>;
  }

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item container justifyContent="center">
        <Grid item xs={11}>
          <Autocomplete
            aria-label="Filter"
            id="card-filter"
            multiple
            fullWidth
            freeSolo
            disableCloseOnSelect
            options={tags}
            getOptionLabel={option => option}
            isOptionEqualToValue={(option, value) => option === value}
            groupBy={() => 'Tags'}
            onChange={handleChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip color="primary" variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            renderInput={params => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Filter by..."
                label={t('components.card-filter.title')}
              />
            )}
          />
        </Grid>
      </Grid>
      <Grid item container>
        {children(filteredData)}
      </Grid>
    </Grid>
  );
};
export default CardFilter;

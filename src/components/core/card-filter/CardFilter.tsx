import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { Chip, Container } from '@mui/material';
import filterFn, { ValueType } from './filterFn';
import mostCommonTags from './most-common-tags';

export type RequiredFields = {
  id: string;
};

export interface CardFilterProps<T extends RequiredFields> {
  data: T[];
  tagsValueGetter: (data: T) => string[];
  valueGetter: (data: T) => ValueType;
  inputField?: boolean;
  inputTerms?: string[];
  children: (filteredData: T[]) => React.ReactNode;
}

const CardFilter = <T extends RequiredFields>({ data, inputField = true, inputTerms, tagsValueGetter, valueGetter, children }: CardFilterProps<T>) => {
  const { t } = useTranslation();
  const [terms, setTerms] = useState<string[]>([]);

  const tags = useMemo(() => mostCommonTags(data, tagsValueGetter), [data]);

  const filterTerms = inputTerms ?? terms;
  const filteredData = useMemo(() => filterFn(data, filterTerms, valueGetter), [data, filterTerms]);

  const handleChange = (e, value: string[]) => {
    const trimmedValues = value.map(x => x.trim().toLowerCase());
    setTerms(trimmedValues);
  };

  if (!data.length) {
    return <>{children(data)}</>;
  }

  if (!inputField) {
    return <Grid container>{children(filteredData)}</Grid>;
  }

  return (
    <>
      <Grid container spacing={2} direction="column" alignItems="center">
        <Grid container item xs={10}>
          <Container maxWidth="xl" sx={{ paddingY: 2 }}>
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
          </Container>
        </Grid>
      </Grid>
      <Grid container>{children(filteredData)}</Grid>
    </>
  );
};
export default CardFilter;

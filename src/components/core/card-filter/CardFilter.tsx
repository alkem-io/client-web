import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { Context, Tagset } from '../../../models/graphql-schema';
import { Chip } from '@material-ui/core';
import filterFn from './filterFn';
import mostCommonTags from './most-common-tags';

export type RequiredFields = {
  id: string;
  tagset?: Tagset;
  displayName: string;
  context?: Pick<Context, 'tagline' | 'background' | 'vision' | 'who' | 'impact'>;
};

export interface CardFilterProps<T> {
  data: T[];
  children: (filteredData: T[]) => React.ReactNode;
}

const CardFilter = <T extends RequiredFields>({ data, children }: CardFilterProps<T>) => {
  const { t } = useTranslation();
  const [terms, setTerms] = useState<string[]>([]);

  const tags: string[] = useMemo(() => mostCommonTags(data), [data]);

  const filteredData = useMemo(() => filterFn(data, terms), [tags, terms]);

  const handleChange = (e, value: string[]) => {
    const trimmedValues = value.map(x => x.trim().toLowerCase());
    setTerms(trimmedValues);
  };

  if (!data.length) {
    return <>{children(data)}</>;
  }

  return (
    <Grid container spacing={2} direction="column" alignItems="center">
      <Grid container item xs={10}>
        <Autocomplete
          aria-label="Filter"
          id="card-filter"
          multiple
          fullWidth
          freeSolo
          disableCloseOnSelect
          options={tags}
          getOptionLabel={option => option}
          getOptionSelected={(option, value) => option === value}
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
      <Grid container>{children(filteredData)}</Grid>
    </Grid>
  );
};
export default CardFilter;

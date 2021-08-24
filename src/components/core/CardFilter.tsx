import React, { useMemo, useState } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import { Tagset } from '../../models/graphql-schema';

type TagInfo = {
  tag: string;
  usages: number;
};

type TagMap = {
  [key: string]: number;
};

type Tagsetwise = { tagset?: Tagset };

export interface CardFilterProps<T> {
  data: T[];
  children: (filteredData: T[]) => React.ReactNode;
}

const CardFilter = <T extends Tagsetwise>({ data, children }: CardFilterProps<T>) => {
  const [tags, setTags] = useState<string[]>([]);

  const mostCommonTags: TagInfo[] = useMemo(() => {
    if (!data.length) {
      return [];
    }
    // holds tags and usages
    const tagMap: TagMap = {};

    data
      .flatMap(x => x.tagset?.tags || [])
      .forEach(x => {
        const usages = tagMap[x];
        tagMap[x] = (usages || 0) + 1;
      });

    return Object.keys(tagMap)
      .map(x => ({
        tag: x,
        usages: tagMap[x],
      }))
      .sort((a, b) => {
        const index = b.usages - a.usages;

        return index === 0 ? a.tag.localeCompare(b.tag) : index;
      });
  }, [data]);

  const filteredData = useMemo(
    () =>
      data.filter(x => x?.tagset?.tags.find(tag => (tags.length ? tags.some(filterTag => filterTag === tag) : true))),
    [mostCommonTags, tags]
  );

  const handleChange = (e, value: TagInfo[]) => {
    const tags = value.map(x => x.tag);
    setTags(tags);
  };

  return (
    <Grid container spacing={2} direction="column" alignItems="center">
      <Grid container item xs={10}>
        <Autocomplete
          multiple
          disableCloseOnSelect
          fullWidth
          aria-label="Filter by tags"
          id="card-filter-tags"
          options={mostCommonTags}
          getOptionLabel={option => option?.tag}
          getOptionSelected={(option, value) => option.tag === value.tag}
          onChange={handleChange}
          ChipProps={{
            color: 'primary',
            variant: 'outlined',
          }}
          renderInput={params => <TextField {...params} variant="outlined" label="Filter by tags" />}
        />
      </Grid>
      <Grid container>{children(filteredData)}</Grid>
    </Grid>
  );
};
export default CardFilter;

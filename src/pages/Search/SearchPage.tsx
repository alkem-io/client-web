import { Box, Container, OutlinedInput } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { makeStyles } from '@mui/styles';
import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChallengeSearchCard,
  OpportunitySearchCard,
  OrganizationSearchCard,
  UserCard,
} from '../../components/composite/search';
import { Loading } from '../../components/core';
import { CardContainer } from '../../components/core/CardContainer';
import Divider from '../../components/core/Divider';
import Icon from '../../components/core/Icon';
import MultipleSelect, { MultiSelectElement } from '../../components/core/MultipleSelect';
import Section, { Header as SectionHeader, SubHeader } from '../../components/core/Section';
import Typography from '../../components/core/Typography';
import { useUpdateNavigation } from '../../hooks';
import { useSearchLazyQuery } from '../../hooks/generated/graphql';
import { Challenge, Opportunity, Organization, SearchQuery, User, UserGroup } from '../../models/graphql-schema';
import { PageProps } from '../common';

const useStyles = makeStyles(() => ({
  formControl: {
    minWidth: 150,
  },
}));

const tagsetNames = ['skills', 'keywords'];

const filtersConfig: FilterConfig = {
  all: {
    title: 'All',
    value: ['user', 'opportunity', 'organization', 'challenge'],
    typename: 'all',
  },
  user: {
    title: 'Users only',
    value: ['user'],
    typename: 'User',
  },
  group: {
    title: 'Opportunities only',
    value: ['opportunity'],
    typename: 'Opportunity',
  },
  organization: {
    title: 'Organizations only',
    value: ['organization'],
    typename: 'Organization',
  },
  challenge: {
    title: 'Challenges only',
    value: ['challenge'],
    typename: 'Challenge',
  },
};
// TODO [ATS]: Read most used tags from backend
const _tags: MultiSelectElement[] = [
  {
    name: 'innovation',
  },
  {
    name: 'non-profit',
  },
  {
    name: 'blockchain',
  },
  {
    name: 'AI',
  },
  {
    name: 'good',
  },
  {
    name: 'data',
  },
  {
    name: 'api',
  },
  {
    name: 'artificial intelligence',
  },
  {
    name: 'incubator',
  },
];

interface Filter {
  title: string;
  value: string[];
  typename: string;
}

interface FilterConfig {
  [key: string]: Filter;
}

type ResultType = (User | UserGroup | Organization | Challenge | Opportunity) & { score: number; terms: string[] };

const SearchPage: FC<PageProps> = ({ paths }): React.ReactElement => {
  useUpdateNavigation({ currentPaths: paths });

  const { t } = useTranslation();
  const styles = useStyles();

  const [results, setResults] = useState<ResultType[]>();
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [typesFilter, setTypesFilter] = useState<Filter>(filtersConfig.all);

  const resetState = () => {
    setTypesFilter(filtersConfig.all);
    setSearchTerms([]);
    setResults(undefined);
  };

  const handleTermChange = (newValue: MultiSelectElement[]) => {
    const newTerms = newValue.map(x => x.name);
    setSearchTerms(newTerms);

    // avoid sending unnecessary query
    if (!newValue.length) {
      resetState();
    } else {
      searchQuery(newTerms, typesFilter.value);
    }
  };

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    const typename = event.target.value;
    const filterKey = Object.keys(filtersConfig).find(x => filtersConfig[x].typename === typename);

    if (filterKey) {
      const filter = filtersConfig[filterKey];
      setTypesFilter(filter);

      searchQuery(searchTerms, filter.value);
    }
  };

  const [search, { loading: isSearching }] = useSearchLazyQuery({
    fetchPolicy: 'no-cache',
    onCompleted: data => {
      const updatedResult = toResultType(data);
      setResults(updatedResult);
    },
  });

  const searchQuery = (terms: string[], filters: string[]) => {
    search({
      variables: {
        searchData: {
          terms,
          tagsetNames,
          typesFilter: filters,
        },
      },
    });
  };

  return (
    <>
      <Section hideDetails avatar={<Icon component={PatchQuestionIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('search.header')} />
        <Box marginBottom={2}>
          <SubHeader text={t('search.alternativesubheader')} />
        </Box>
        <MultipleSelect label={'search for skills'} onChange={handleTermChange} elements={_tags} allowUnknownValues />
      </Section>
      <Divider />
      {isSearching && (
        <Container maxWidth="xl">
          <Loading />
        </Container>
      )}
      {results && (
        <>
          <Container maxWidth="xl">
            <Box marginBottom={3}>
              <Grid container spacing={2} justifyContent={'center'}>
                <Grid item lg={3}>
                  <FormControl variant="outlined" className={styles.formControl}>
                    <InputLabel id="filter-select-label">Filter</InputLabel>
                    <Select
                      labelId="filter-select-label"
                      id="filter-select"
                      value={typesFilter.typename}
                      label={typesFilter.title}
                      onChange={handleFilterChange}
                      variant={'outlined'}
                      input={<OutlinedInput notched label={'Filter'} />}
                    >
                      {Object.keys(filtersConfig).map((x, i) => (
                        <MenuItem key={`menu-item-${i}`} value={filtersConfig[x].typename}>
                          {filtersConfig[x].title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item lg={9}>
                  {results.length > 10 && (
                    <Typography>
                      There are more search results. Please use more specific search criteria to narrow down the results
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Container>
          {results.length > 0 && (
            <CardContainer cardHeight={320} xs={12} sm={6} md={6}>
              {results.slice(0, 12).map(el => {
                if (el.__typename === 'User') return <UserCard key={el.id} {...el} />;
                if (el.__typename === 'Opportunity')
                  return <OpportunitySearchCard key={el.id} terms={el.terms} entity={el} />;
                if (el.__typename === 'Organization')
                  return <OrganizationSearchCard key={el.id} terms={el.terms} entity={el} />;
                if (el.__typename === 'Challenge')
                  return <ChallengeSearchCard key={el.id} terms={el.terms} entity={el} />;

                return undefined;
              })}
            </CardContainer>
          )}
        </>
      )}
    </>
  );
};

export { SearchPage };

const toResultType = (query?: SearchQuery): ResultType[] => {
  if (!query) {
    return [];
  }

  return (query.search || [])
    .map<ResultType>(
      ({ result, score, terms }) => ({ ...result, score: score || 0, terms: terms || [] } as ResultType),
      []
    )
    .sort((a, b) => (b?.score || 0) - (a?.score || 0));
};

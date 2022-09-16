import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Box, Container, OutlinedInput } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { makeStyles } from '@mui/styles';
import HelpOutline from '@mui/icons-material/HelpOutline';
import {
  ChallengeSearchCard,
  OpportunitySearchCard,
  OrganizationSearchCard,
  UserCard,
} from '../../common/components/composite/search';
import { Loading } from '../../common/components/core';
import { CardContainer } from '../../common/components/core/CardContainer';
import MultipleSelect, { MultiSelectElement } from '../../common/components/core/MultipleSelect';
import Section, { Header as SectionHeader, SubHeader } from '../../common/components/core/Section';
import WrapperTypography from '../../common/components/core/WrapperTypography';
import { useApolloErrorHandler, useUpdateNavigation, useUserContext } from '../../hooks';
import { useSearchLazyQuery } from '../../hooks/generated/graphql';
import { Challenge, Opportunity, Organization, SearchQuery, User, UserGroup } from '../../models/graphql-schema';
import { PageProps } from '../common';
import { RouterLink } from '../../common/components/core/RouterLink';
import { AUTH_LOGIN_PATH } from '../../models/constants';

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
  const handleError = useApolloErrorHandler();
  useUpdateNavigation({ currentPaths: paths });

  const { t } = useTranslation();
  const styles = useStyles();
  const { isAuthenticated } = useUserContext();

  const { search: params } = useLocation();
  const queryParams = new URLSearchParams(params);
  const queryParam = queryParams.get('terms');

  const termsFromUrl = useMemo(() => (queryParam?.split(',') ?? []).map(x => ({ id: x, name: x })) || [], [queryParam]);
  const [termsFromQuery, setTermsFromQuery] = useState<MultiSelectElement[] | undefined>(undefined);

  const [results, setResults] = useState<ResultType[]>();
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [typesFilter, setTypesFilter] = useState<Filter>(filtersConfig.all);

  useEffect(() => {
    setTermsFromQuery(termsFromUrl);
    setSearchTerms(termsFromUrl.map(x => x.name));
  }, [termsFromUrl, setTermsFromQuery, setSearchTerms]);

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

  const [search, { loading: isSearching }] = useSearchLazyQuery({
    fetchPolicy: 'no-cache',
    onError: handleError,
    onCompleted: data => {
      const updatedResult = toResultType(data);
      setResults(updatedResult);
    },
  });

  const searchQuery = useCallback(
    (terms: string[], filters: string[]) => {
      search({
        variables: {
          searchData: {
            terms,
            tagsetNames,
            typesFilter: filters,
          },
        },
      });
    },
    [search]
  );

  useEffect(() => {
    if (!termsFromQuery || !termsFromQuery.length) {
      return;
    }

    searchQuery(termsFromQuery?.map(x => x.name) || [], typesFilter.value);
  }, [searchQuery, termsFromQuery]);

  useEffect(() => {
    if (!searchTerms.length) {
      return;
    }

    searchQuery(searchTerms, typesFilter.value);
  }, [searchQuery, searchTerms, typesFilter]);

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    const typename = event.target.value;
    const filterKey = Object.keys(filtersConfig).find(x => filtersConfig[x].typename === typename);

    if (filterKey) {
      const filter = filtersConfig[filterKey];
      setTypesFilter(filter);
    }
  };

  return (
    <>
      <Section hideDetails avatar={<HelpOutline color="primary" sx={{ fontSize: 120 }} />}>
        <SectionHeader text={t('pages.search.header')} />
        <Box marginBottom={2}>
          <SubHeader text={t('pages.search.alternativesubheader')} />
        </Box>
        <MultipleSelect
          label={'search for skills'}
          onChange={handleTermChange}
          defaultValue={termsFromQuery}
          elements={_tags}
          allowUnknownValues
        />
      </Section>
      {!isAuthenticated && (
        <Box display="flex" justifyContent="center" paddingBottom={2}>
          <Link component={RouterLink} to={AUTH_LOGIN_PATH}>
            {t('pages.search.user-not-logged')}
          </Link>
        </Box>
      )}
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
                  {results.length > 10 && <WrapperTypography>{t('pages.search.more-results')}</WrapperTypography>}
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
          {!results.length && !isSearching && (
            <Box component={WrapperTypography} display="flex" justifyContent="center">
              {t('pages.search.no-results')}
            </Box>
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

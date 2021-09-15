import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Container, OutlinedInput } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { OrganizationSearchCard, ChallengeSearchCard, UserCard, OpportunitySearchCard } from '../components/search';
import { CardContainer } from '../components/core/CardContainer';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import MultipleSelect from '../components/core/MultipleSelect';
import Section, { Header as SectionHeader, SubHeader } from '../components/core/Section';
import Typography from '../components/core/Typography';
import { useSearchLazyQuery } from '../hooks/generated/graphql';
import { createStyles, useUpdateNavigation } from '../hooks';
import { Challenge, Opportunity, Organisation, User, UserGroup } from '../models/graphql-schema';
import { PageProps } from './common';

const useStyles = createStyles(() => ({
  formControl: {
    minWidth: 150,
  },
}));

interface Filter {
  title: string;
  value: string[];
  typename: string;
}

interface FilterConfig {
  [key: string]: Filter;
}

const SearchPage: FC<PageProps> = ({ paths }): React.ReactElement => {
  const { t } = useTranslation();
  const styles = useStyles();

  const filtersConfig: FilterConfig = {
    all: {
      title: 'All',
      value: ['user', 'opportunity', 'organisation', 'challenge'],
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
      value: ['organisation'],
      typename: 'Organisation',
    },
    challenge: {
      title: 'Challenges only',
      value: ['challenge'],
      typename: 'Challenge',
    },
  };
  // TODO [ATS]: Read most used tags from backend
  const _tags = [
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
      name: 'arificial intelligence',
    },
    {
      name: 'incubator',
    },
  ];

  type CommunityType = (User | UserGroup | Organisation | Challenge | Opportunity) & { score: number; terms: string[] };
  const [community, setCommunity] = useState<Array<CommunityType>>([]);
  const [tags, setTags] = useState<Array<{ name: string }>>([]);
  const [typesFilter, setTypesFilter] = useState<Filter>(filtersConfig.all);

  let searchTerm = '';

  useEffect(() => handleSearch(), [tags]);
  useEffect(() => handleSearch(), [typesFilter.value]);
  useUpdateNavigation({ currentPaths: paths });

  const [search] = useSearchLazyQuery({
    onCompleted: data => {
      const searchData = data?.search || [];
      const updatedCommunity: CommunityType[] = searchData
        .reduce((acc, curr) => {
          return [...acc, { score: curr.score, ...curr.result, terms: curr.terms } as CommunityType];
        }, [] as CommunityType[])
        .sort((a, b) => {
          if (a.score > b.score) {
            return -1;
          }
          if (a.score < b.score) {
            return 1;
          }
          return 0;
        });
      setCommunity(updatedCommunity);
    },
  });

  const handleSearch = () => {
    const tagNames = tags.map(t => t.name);
    search({
      variables: {
        searchData: {
          terms: searchTerm === '' ? tagNames : [searchTerm, ...tagNames],
          tagsetNames: ['skills', 'keywords'],
          ...(typesFilter.value && { typesFilter: typesFilter.value }),
        },
      },
    });
  };

  const handleFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const typename = event.target.value;
    const filterKey = Object.keys(filtersConfig).find(x => filtersConfig[x].typename === typename);

    if (filterKey) {
      const filter = filtersConfig[filterKey];
      setTypesFilter(filter);
    }
  };

  return (
    <>
      <Section hideDetails avatar={<Icon component={PatchQuestionIcon} color="primary" size="xl" />}>
        <SectionHeader text={t('search.route.tsx.header')} />
        <Box marginBottom={2}>
          <SubHeader text={t('search.route.tsx.alternativesubheader')} />
        </Box>
        <MultipleSelect
          label={'search for skills'}
          onChange={value => setTags(value)}
          onInput={value => (searchTerm = value)}
          onSearch={handleSearch}
          elements={_tags}
          allowUnknownValues
        />
      </Section>
      <Divider />
      {tags.length > 0 && (
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
                {community.length > 10 && (
                  <Typography>
                    There are more search results. Please use more specific search criteria to narrow down the results
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>
        </Container>
      )}
      {community.length > 0 && (
        <CardContainer cardHeight={320} xs={12} sm={6} md={6}>
          {community.slice(0, 12).map(el => {
            if (el.__typename === 'User') return <UserCard key={el.id} {...el} />;
            if (el.__typename === 'Opportunity')
              return <OpportunitySearchCard key={el.id} terms={el.terms} entity={el} />;
            if (el.__typename === 'Organisation')
              return <OrganizationSearchCard key={el.id} terms={el.terms} entity={el} />;
            if (el.__typename === 'Challenge') return <ChallengeSearchCard key={el.id} terms={el.terms} entity={el} />;

            return undefined;
          })}
        </CardContainer>
      )}
    </>
  );
};

export { SearchPage };

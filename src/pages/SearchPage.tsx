import { useLazyQuery } from '@apollo/client';
import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { GroupCard } from '../components/Community/GroupCard';
import { OrganizationCard } from '../components/Community/OrganizationCard';
import { ChallengeCard } from '../components/Community/ChallengeCard';
import { UserCard } from '../components/Community/UserCard';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import MultipleSelect from '../components/core/MultipleSelect';
import Section, { Header as SectionHeader, SubHeader } from '../components/core/Section';
import Typography from '../components/core/Typography';
import { SearchDocument } from '../hooks/generated/graphql';
import { createStyles, useUpdateNavigation } from '../hooks';
import { Challenge, Organisation, User, UserGroup } from '../models/graphql-schema';
import { PageProps } from './common';

const useStyles = createStyles(() => ({
  formControl: {
    minWidth: 150,
  },
}));

interface Filter {
  title: string;
  value: string;
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
      value: '',
      typename: 'all',
    },
    user: {
      title: 'Users only',
      value: 'user',
      typename: 'User',
    },
    group: {
      title: 'Groups only',
      value: 'group',
      typename: 'UserGroup',
    },
    organization: {
      title: 'Organizations only',
      value: 'organisation',
      typename: 'Organisation',
    },
    challenge: {
      title: 'Challenges only',
      value: 'challenge',
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

  const [community, setCommunity] = useState<Array<User | UserGroup | Organisation | Challenge>>([]);
  const [tags, setTags] = useState<Array<{ name: string }>>([]);
  const [typesFilter, setTypesFilter] = useState<Filter>(filtersConfig.all);

  let searchTerm = '';

  useEffect(() => handleSearch(), [tags]);
  useEffect(() => handleSearch(), [typesFilter.value]);
  useUpdateNavigation({ currentPaths: paths });

  const [search] = useLazyQuery(SearchDocument, {
    onCompleted: data => {
      const searchData = data?.search || [];
      const updatedCommunity = searchData
        .reduce((acc, curr) => {
          return [...acc, { score: curr.score, ...curr.result, terms: curr.terms }];
        }, [])
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
          ...(typesFilter.value && { typesFilter: [typesFilter.value] }),
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
        <SectionHeader text={t('search.header')} />
        <SubHeader text={t('search.alternativesubheader')} className={'mb-4'} />
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
          <Grid container spacing={2} className={'justify-content-md-center mb-5'}>
            <Grid item lg={3}>
              <FormControl variant="outlined" className={styles.formControl}>
                <InputLabel id="filter-select-label">Filter</InputLabel>
                <Select
                  labelId="filter-select-label"
                  id="filter-select"
                  value={typesFilter.typename}
                  label={typesFilter.title}
                  onChange={handleFilterChange}
                >
                  {Object.keys(filtersConfig).map(x => (
                    <MenuItem value={filtersConfig[x].typename}>{filtersConfig[x].title}</MenuItem>
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
        </Container>
      )}
      <CardContainer cardHeight={290} xs={12} sm={6} md={6}>
        {community.slice(0, 12).map(el => {
          if (el.__typename === 'User') return <UserCard key={el.id} {...el} />;
          if (el.__typename === 'UserGroup') return <GroupCard key={el.id} {...el} />;
          if (el.__typename === 'Organisation') return <OrganizationCard key={el.id} {...el} />;
          if (el.__typename === 'Challenge') return <ChallengeCard key={(el.id, el.ecoverseID)} {...el} />;
          return null;
        })}
      </CardContainer>
    </>
  );
};

export { SearchPage };

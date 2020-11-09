import React, { FC, useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { useLazyQuery, useQuery } from '@apollo/client';

import { PeopleCard, ProjectCardProps } from '../components/Community/Cards';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Header as SectionHeader, SubHeader } from '../components/core/Section';
import { useUpdateNavigation } from '../hooks/useNavigation';
import MultipleSelect from '../components/core/MultipleSelect';

import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import { people as _people, tags as _tags } from '../components/core/Typography.dummy.json';
import { QUERY_COMMUNITY_SEARCH, QUERY_COMMUNITY_USERS_LIST } from '../graphql/community';
import { PageProps } from './common';
import { useUsersQuery } from '../generated/graphql';
import { Dropdown, DropdownButton } from 'react-bootstrap';

const Community: FC<PageProps> = ({ paths }): React.ReactElement => {
  const [people, setPeople] = useState<Array<ProjectCardProps>>([]);
  const [defaultPeople, setDefaultPeople] = useState<Array<ProjectCardProps>>([]);
  const [tags, setTags] = useState<Array<{ name: string }>>([]);
  const [searchTerm, setSearch] = useState('');
  const [typesFilter, setTypesFilter] = useState('');

  useUpdateNavigation({ currentPaths: paths });

  const { data: users, loading: isUsersLoading } = useQuery(QUERY_COMMUNITY_USERS_LIST, {
    onCompleted: data => {
      setPeople(data.users);
      setDefaultPeople(data.users);
    },
  });

  const [search] = useLazyQuery(QUERY_COMMUNITY_SEARCH, {
    onCompleted: ({ search: searchData }) => {
      const _people = searchData.reduce((acc, curr) => {
        return [...acc, { score: curr.score, ...curr.result }];
      }, []);
      // .sort((a, b) => a.scrore > b.score);

      setPeople(_people);
    },
    onError: error => console.log('searched error ---> ', error),
  });

  const handleSearch = () => {
    if (searchTerm === '' && tags.length === 0) {
      setPeople(defaultPeople);
      return;
    }
    const tagNames = tags.map(t => t.name);
    search({
      variables: {
        searchData: {
          terms: [searchTerm && searchTerm, ...tagNames],
          // tagsetNames: ['skills'], ------> disabled for now
          // typesFilter: [typesFilter],
        },
      },
    });
  };

  useEffect(() => handleSearch(), [tags]);

  return (
    <>
      <Section hideDetails avatar={<Icon component={PatchQuestionIcon} color="primary" size="xl" />}>
        <SectionHeader text={'Community'} />
        <SubHeader text={'Need help? Find skilled masters within the ecosystem'} className={'mb-4'} />
        <MultipleSelect
          label={'search for skills'}
          onChange={value => setTags(value)}
          onInput={setSearch}
          onSearch={handleSearch}
          elements={_tags.list}
          allowUnknownValues
        />
      </Section>
      <div className={'col-md-3'} />
      {/*<DropdownButton id="dropdown-basic-button" title="Dropdown button" onChange={() => console.log('casdfd')}>*/}
      {/*  <Dropdown.Item onClick={() => setTypesFilter('')}>All</Dropdown.Item>*/}
      {/*  <Dropdown.Item onClick={() => setTypesFilter('users')}>Users only</Dropdown.Item>*/}
      {/*  <Dropdown.Item onClick={() => setTypesFilter('groups')}>Groups only</Dropdown.Item>*/}
      {/*</DropdownButton>*/}
      <Divider />
      <CardContainer cardHeight={320} xs={12} md={6} lg={4} xl={3}>
        {people.map((props, i) => (
          <PeopleCard key={i} {...props} />
        ))}
      </CardContainer>
      <Divider />
    </>
  );
};

export { Community };

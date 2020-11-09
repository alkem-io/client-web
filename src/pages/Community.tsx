import React, { FC, useEffect, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';

import { PeopleCard, ProjectCardProps } from '../components/Community/Cards';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Header as SectionHeader, SubHeader } from '../components/core/Section';
import { useUpdateNavigation } from '../hooks/useNavigation';
import MultipleSelect from '../components/core/MultipleSelect';

import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import { tags as _tags } from '../components/core/Typography.dummy.json';
import { QUERY_COMMUNITY_SEARCH, QUERY_COMMUNITY_LIST } from '../graphql/community';
import { PageProps } from './common';
import { Container, Dropdown, DropdownButton, Row } from 'react-bootstrap';

const Community: FC<PageProps> = ({ paths }): React.ReactElement => {
  const [community, setCommunity] = useState<Array<ProjectCardProps>>([]);
  const [defaultPeople, setDefaultPeople] = useState<Array<ProjectCardProps>>([]);
  const [tags, setTags] = useState<Array<{ name: string }>>([]);
  const [searchTerm, setSearch] = useState('');
  const [typesFilter, setTypesFilter] = useState<{ title: string; value: string }>({ title: 'No filters ', value: '' });

  useUpdateNavigation({ currentPaths: paths });

  const { data } = useQuery(QUERY_COMMUNITY_LIST, {
    onCompleted: data => {
      setCommunity([...data.users, ...data.groups]);
      setDefaultPeople([...data.users, ...data.groups]);
    },
  });

  const [search] = useLazyQuery(QUERY_COMMUNITY_SEARCH, {
    onCompleted: ({ search: searchData }) => {
      const updatedCommunity = searchData
        .reduce((acc, curr) => {
          return [...acc, { score: curr.score, ...curr.result }];
        }, [])
        .sort((a, b) => a.scrore > b.score);
      setCommunity(updatedCommunity);
    },
    onError: error => console.log('searched error ---> ', error),
  });

  const handleSearch = () => {
    if (searchTerm === '' && tags.length === 0) {
      setCommunity(defaultPeople);
      return;
    }
    const tagNames = tags.map(t => t.name);
    search({
      variables: {
        searchData: {
          terms: [searchTerm && searchTerm, ...tagNames],
          // tagsetNames: ['skills'], ------> disabled for now
          ...(typesFilter.value && { typesFilter: [typesFilter.value] }),
        },
      },
    });
  };

  useEffect(() => handleSearch(), [tags]);
  useEffect(() => handleSearch(), [typesFilter.value]);

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
      <Divider />
      <Container>
        <Row className={'justify-content-md-center mb-5'}>
          <DropdownButton title={typesFilter.title} variant={'info'}>
            <Dropdown.Item onClick={() => setTypesFilter({ title: 'No filters ', value: '' })}>All</Dropdown.Item>
            <Dropdown.Item onClick={() => setTypesFilter({ title: 'Users only ', value: 'user' })}>
              Users only
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setTypesFilter({ title: 'Groups only ', value: 'group' })}>
              Groups only
            </Dropdown.Item>
          </DropdownButton>
        </Row>
      </Container>
      <CardContainer cardHeight={320} xs={12} md={6} lg={4} xl={3}>
        {community.map((props, i) => (
          <PeopleCard key={i} {...props} />
        ))}
      </CardContainer>
      <Divider />
    </>
  );
};

export { Community };

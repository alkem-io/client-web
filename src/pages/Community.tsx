import React, { FC, useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';

import { UserCard } from '../components/Community/UserCard';
import { GroupCard } from '../components/Community/GroupCard';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Header as SectionHeader, SubHeader } from '../components/core/Section';
import { useUpdateNavigation } from '../hooks/useNavigation';
import MultipleSelect from '../components/core/MultipleSelect';
import Typography from '../components/core/Typography';

import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import { tags as _tags } from '../components/core/Typography.dummy.json';
import { QUERY_COMMUNITY_SEARCH } from '../graphql/community';
import { PageProps } from './common';
import { Col, Container, Dropdown, DropdownButton, Row } from 'react-bootstrap';
import { Organisation, User, UserGroup } from '../generated/graphql';
import { OrganizationCard } from '../components/Community/OrganizationCard';

const Community: FC<PageProps> = ({ paths }): React.ReactElement => {
  const filtersConfig = {
    all: {
      title: 'No filters',
      value: '',
      typename: '',
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
  };

  const [community, setCommunity] = useState<Array<User | UserGroup | Organisation>>([]);
  const [tags, setTags] = useState<Array<{ name: string }>>([]);
  const [typesFilter, setTypesFilter] = useState<{ title: string; value: string; typename: string }>(filtersConfig.all);

  let searchTerm = '';

  useEffect(() => handleSearch(), [tags]);
  useEffect(() => handleSearch(), [typesFilter.value]);
  useUpdateNavigation({ currentPaths: paths });

  const [search] = useLazyQuery(QUERY_COMMUNITY_SEARCH, {
    onCompleted: ({ search: searchData }) => {
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
    onError: error => console.log('searched error ---> ', error),
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

  return (
    <>
      <Section hideDetails avatar={<Icon component={PatchQuestionIcon} color="primary" size="xl" />}>
        <SectionHeader text={'Community'} />
        <SubHeader text={'Need help? Find skilled masters within the ecosystem'} className={'mb-4'} />
        <MultipleSelect
          label={'search for skills'}
          onChange={value => setTags(value)}
          onInput={value => (searchTerm = value)}
          onSearch={handleSearch}
          elements={_tags.list}
          allowUnknownValues
        />
      </Section>
      <Divider />
      <Container>
        <Row className={'justify-content-md-center mb-5'}>
          <Col lg={3}>
            <DropdownButton title={typesFilter.title} variant={'info'}>
              <Dropdown.Item onClick={() => setTypesFilter(filtersConfig.all)}>{filtersConfig.all.title}</Dropdown.Item>
              <Dropdown.Item onClick={() => setTypesFilter(filtersConfig.user)}>
                {filtersConfig.user.title}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setTypesFilter(filtersConfig.group)}>
                {filtersConfig.group.title}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setTypesFilter(filtersConfig.organization)}>
                {filtersConfig.organization.title}
              </Dropdown.Item>
            </DropdownButton>
          </Col>
          <Col lg={9}>
            {community.length > 10 && (
              <Typography>
                There are more search results. Please use more specific search criteria to narrow down the results
              </Typography>
            )}
          </Col>
        </Row>
      </Container>
      <CardContainer cardHeight={320} xs={12} md={6} lg={3} xl={2}>
        {community.slice(0, 12).map(el => {
          if (el.__typename === 'User') return <UserCard key={el.id} {...el} />;
          if (el.__typename === 'UserGroup') return <GroupCard key={el.id} {...el} />;
          if (el.__typename === 'Organisation') return <OrganizationCard key={el.id} {...el} />;
          return null;
        })}
      </CardContainer>
      <Divider />
    </>
  );
};

export { Community };

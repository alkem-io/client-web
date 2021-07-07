import { useLazyQuery } from '@apollo/client';
import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import React, { FC, useEffect, useState } from 'react';
import { Col, Container, Dropdown, DropdownButton, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
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
import { SearchDocument } from '../generated/graphql';
import { useUpdateNavigation } from '../hooks/useNavigation';
import { Challenge, Organisation, User, UserGroup } from '../types/graphql-schema';
import { PageProps } from './common';

const SearchPage: FC<PageProps> = ({ paths }): React.ReactElement => {
  const { t } = useTranslation();

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
  const [typesFilter, setTypesFilter] = useState<{ title: string; value: string; typename: string }>(filtersConfig.all);

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
              <Dropdown.Item onClick={() => setTypesFilter(filtersConfig.challenge)}>
                {filtersConfig.challenge.title}
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
      <CardContainer cardHeight={290} xs={12} md={6} lg={4} xl={2}>
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

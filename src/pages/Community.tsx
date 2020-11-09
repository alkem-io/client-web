import React, { FC, useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { useLazyQuery } from '@apollo/client';

import { PeopleCard, ProjectCardProps } from '../components/Community/Cards';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Header as SectionHeader, SubHeader } from '../components/core/Section';
import { useUpdateNavigation } from '../hooks/useNavigation';
import MultipleSelect from '../components/core/MultipleSelect';

import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import { people as _people, tags as _tags } from '../components/core/Typography.dummy.json';
import { QUERY_COMMUNITY_SEARCH } from '../graphql/community';
import { PageProps } from './common';
import { useUsersQuery } from '../generated/graphql';

const Community: FC<PageProps> = ({ paths }): React.ReactElement => {
  const [people, setPeople] = useState<Array<ProjectCardProps>>([]);
  const [tags, setTags] = useState<Array<{ name: string }>>([]);
  const [searchTerm, setSearch] = useState('');
  const [typesFilter, setTypesFilter] = useState([]);
  useEffect(() => debounceTagsSearch(searchTerm), [tags]);
  useUpdateNavigation({ currentPaths: paths });

  const { data: users, loading: isUsersLoading } = useUsersQuery({
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    onCompleted: data => setPeople(data.users),
  });

  const [search] = useLazyQuery(QUERY_COMMUNITY_SEARCH, {
    onCompleted: ({ search: searchData }) => {
      const _people = searchData.reduce((acc, curr) => {
        return [...acc, { score: curr.score, ...curr.result }];
      }, []);

      console.log(_people);
      setPeople(_people);
    },
    onError: error => console.log('searched error ---> ', error),
  });

  const debounceTagsSearch = useCallback(
    _.debounce(searchTerm => console.log('api call for new tags'), 500),
    []
  );

  const handleSearch = () => {
    if (searchTerm === '') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      setPeople(people);
      return;
    }
    search({
      variables: {
        searchData: {
          terms: [searchTerm],
          // tagsetNames: ['skills'], ------> disabled for now
          typesFilter: typesFilter,
        },
      },
    });
  };

  console.log(tags);

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

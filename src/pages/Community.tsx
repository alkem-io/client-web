import React, { FC, useCallback, useEffect, useState } from 'react';
import _ from 'lodash';

import { PeopleCard, ProjectCardProps } from '../components/Community/Cards';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Header as SectionHeader, SubHeader } from '../components/core/Section';
import { useUpdateNavigation } from '../hooks/useNavigation';
import MultipleSelect from '../components/core/MultipleSelect';

import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import { people as _people, tags as _tags } from '../components/core/Typography.dummy.json';
import { PageProps } from './common';

const Community: FC<PageProps> = ({ paths }): React.ReactElement => {
  const [people, setPeople] = useState<Array<ProjectCardProps>>(_people.list);
  const [tags, setTags] = useState<Array<{ name: string }>>(_tags.list);
  const [searchTerm, setSearch] = useState('');
  useEffect(() => debouncePeopleSearch(searchTerm), [searchTerm]);
  useEffect(() => debounceTagsSearch(searchTerm), [tags]);
  useUpdateNavigation({ currentPaths: paths });

  // load the ecoverse

  const debouncePeopleSearch = useCallback(
    _.debounce(
      searchTerm => setPeople(_people.list.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))),
      500
    ),
    []
  );

  const debounceTagsSearch = useCallback(
    _.debounce(searchTerm => console.log('api call for new tags'), 500),
    []
  );

  return (
    // the switch breaks the layout
    <>
      <Section hideDetails avatar={<Icon component={PatchQuestionIcon} color="primary" size="xl" />}>
        <SectionHeader text={'Community'} />
        <SubHeader text={'Need help? Find skilled masters within the ecosystem'} className={'mb-4'} />
        <MultipleSelect
          label={'search for skills'}
          onChange={value => setTags(value)}
          onInput={setSearch}
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

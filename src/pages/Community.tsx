import React, { FC } from 'react';

import { PeopleCard } from '../components/Community/Cards';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Header as SectionHeader, SubHeader } from '../components/core/Section';
import { useUpdateNavigation } from '../hooks/useNavigation';
import MultipleSelect from '../components/core/MultipleSelect';

import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import { people } from '../components/core/Typography.dummy.json';
import { PageProps } from './common';

const Community: FC<PageProps> = ({ paths }): React.ReactElement => {
  // load the ecoverse
  useUpdateNavigation({ currentPaths: paths });

  return (
    // the switch breaks the layout
    <>
      <Section hideDetails avatar={<Icon component={PatchQuestionIcon} color="primary" size="xl" />}>
        <SectionHeader text={'Community'} />
        <SubHeader text={'Need help? Find skilled masters within the ecosystem'} className={'mb-4'} />
        <MultipleSelect
          label={'search for skills'}
          onChange={value => console.log('value ---> ', value)} //may be enhanced with debounced callback to fetch new suggestions
          elements={['react', 'typescript', 'sql', 'authentication', 'modules', 'development', 'api', 'backend']} //test data
          allowUnknownValues
        />
      </Section>
      <Divider />
      <CardContainer cardHeight={320} xs={12} md={6} lg={4} xl={3}>
        {people.list.map((props, i) => (
          <PeopleCard key={i} {...props} />
        ))}
      </CardContainer>
      <Divider />
    </>
  );
};

export { Community };

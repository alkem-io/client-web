import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import React, { FC } from 'react';
import { PeopleCard } from '../components/Community/Cards';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Header as SectionHeader, SubHeader } from '../components/core/Section';
import { people } from '../components/core/Typography.dummy.json';

const Community: FC = (): React.ReactElement => {
  // load the ecoverse

  return (
    // the switch breaks the layout
    <>
      <Section hideDetails avatar={<Icon component={PatchQuestionIcon} color="primary" size="xl" />}>
        <SectionHeader text={'Community'} />
        <SubHeader text={'Need help? Find skilled masters within the ecosystem'} />
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

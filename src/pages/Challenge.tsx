import { ReactComponent as GemIcon } from 'bootstrap-icons/icons/gem.svg';
import { ReactComponent as JournalBookmarkIcon } from 'bootstrap-icons/icons/journal-text.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import React, { FC, useRef } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { ActivityCard, OpportunityCard } from '../components/Challenge/Cards';
import Button from '../components/core/Button';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../components/core/Section';
import { challenges, community, opportunities } from '../components/core/Typography.dummy.json';
import { Theme } from '../context/ThemeProvider';
import { useUpdateNavigation } from '../hooks/useNavigation';
import { PageProps } from './common';

const Challenge: FC<PageProps> = ({ paths }): React.ReactElement => {
  const { url } = useRouteMatch();
  const opportunityRef = useRef<HTMLDivElement>(null);
  useUpdateNavigation({ currentPaths: paths });

  return (
    <>
      <Section
        classes={{
          background: theme => theme.palette.neutral,
        }}
        gutters={{
          root: true,
          content: true,
          details: false,
        }}
        details={<ActivityCard />}
      >
        <Body className="d-flex flex-column flex-grow-1">
          <div className="d-flex flex-column flex-grow-1">
            <SectionHeader
              text={challenges.list[0].text}
              className="flex-grow-1"
              classes={{ color: (theme: Theme) => theme.palette.neutralLight }}
            />
          </div>
          <div>
            <Button
              inset
              variant="transparent"
              text="opportunities"
              onClick={() => opportunityRef.current?.scrollIntoView({ behavior: 'smooth' })}
            />
          </div>
        </Body>
      </Section>
      <Section avatar={<Icon component={JournalBookmarkIcon} color="primary" size="xl" />}>
        <SectionHeader text="Challenge details" />
        <SubHeader text={challenges.list[0].subText} />
        <Body text={challenges.list[0].details}>
          <Button inset text="Read more" onClick={ev => console.log(ev)} />
        </Body>
      </Section>
      <Divider />
      <Section avatar={<Icon component={PeopleIcon} color="primary" size="xl" />}>
        <SectionHeader text={community.header} />
        <SubHeader text={community.subheader} />
        <Body text={community.body}>
          <Button variant="primary" text="Explore and connect" onClick={ev => console.log(ev)} />
        </Body>
      </Section>
      <Divider />
      <div ref={opportunityRef}></div>
      <Section avatar={<Icon component={GemIcon} color="primary" size="xl" />}>
        <SectionHeader text="OPPORTUNITIES" />
        <SubHeader text="Potential solutions for this challenge" />
      </Section>
      <CardContainer cardHeight={380} xs={12} md={6} lg={4} xl={3}>
        {opportunities.list.map((props, i) => (
          <OpportunityCard key={i} {...props} url={`${url}/opportunities/${props.id}`} />
        ))}
      </CardContainer>
      <Divider />
    </>
  );
};

export { Challenge };

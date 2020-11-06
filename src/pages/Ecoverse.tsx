/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactComponent as CompassIcon } from 'bootstrap-icons/icons/compass.svg';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import React, { FC, useMemo } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import ActivityCard from '../components/ActivityPanel';
import Button from '../components/core/Button';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../components/core/Section';
import { challenges as challengeLabels, community, projects } from '../components/core/Typography.dummy.json';
import { ChallengeCard, ProjectCard } from '../components/Ecoverse/Cards';
import { EcoverseDetailsQuery } from '../generated/graphql';
import { useUpdateNavigation } from '../hooks/useNavigation';
import { PageProps } from './common';

interface EcoversePageProps extends PageProps {
  ecoverse: EcoverseDetailsQuery;
}

const Ecoverse: FC<EcoversePageProps> = ({ paths, ecoverse }): React.ReactElement => {
  const { url } = useRouteMatch();
  useUpdateNavigation({ currentPaths: paths });

  const { name, context = {}, challenges } = ecoverse;
  const { tagline, impact, vision, background, references } = context;
  const ecoverseProjects = [];
  const more = references?.find(x => x.name === 'website');

  const activitySummary = useMemo(() => {
    return [
      { name: 'Challenges', digit: challenges.length, color: 'neutral' },
      {
        name: 'Opportunities',
        digit: challenges.reduce((sum, c) => sum + (c.opportunities || []).length, 0),
        color: 'primary',
      },
    ];
  }, [ecoverse]);

  return (
    <>
      <Section details={<ActivityCard title={'ecoverse activity'} items={activitySummary as any} />}>
        <SectionHeader text={name} />
        <SubHeader text={tagline} />
        <Body text={`${vision}`}>
          {more && <Button text="Learn more" as={'a'} href={`${more.uri}`} target="_blank" />}
        </Body>
      </Section>
      <Divider />
      <Section avatar={<Icon component={CompassIcon} color="primary" size="xl" />}>
        <SectionHeader text={challengeLabels.header} />
        <SubHeader text={background} />
        <Body text={impact}></Body>
      </Section>
      <CardContainer cardHeight={320} xs={12} md={6} lg={4} xl={3}>
        {ecoverse.challenges.map((challenge, i) => (
          <ChallengeCard key={i} {...(challenge as any)} url={`${url}/challenges/${challenge.textID}`} />
        ))}
      </CardContainer>
      <Divider />
      <Section avatar={<Icon component={PeopleIcon} color="primary" size="xl" />}>
        <SectionHeader text={community.header} />
        <SubHeader text={community.subheader} />
        <Body text={community.body}>
          <Button text="Explore and connect" as={Link} to="/community" />
        </Body>
      </Section>
      <Divider />
      {ecoverseProjects.length > 0 && (
        <>
          <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
            <SectionHeader text={projects.header} tagText={'Work in progress'} />
            <SubHeader text={projects.subheader} />
          </Section>
          <CardContainer cardHeight={480} xs={12} md={6} lg={4} xl={3}>
            {ecoverseProjects.map((props, i) => (
              <ProjectCard key={i} {...props} />
            ))}
          </CardContainer>
          <Divider />
        </>
      )}
    </>
  );
};

export { Ecoverse };

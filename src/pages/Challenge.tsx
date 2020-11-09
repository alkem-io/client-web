import { ReactComponent as GemIcon } from 'bootstrap-icons/icons/gem.svg';
import { ReactComponent as JournalBookmarkIcon } from 'bootstrap-icons/icons/journal-text.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import React, { FC, useMemo, useRef } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import ActivityCard from '../components/ActivityPanel';
import { OpportunityCard } from '../components/Challenge/Cards';
import Avatar from '../components/core/Avatar';
import AvatarContainer from '../components/core/AvatarContainer';
import Button from '../components/core/Button';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Section, { Body, Header as SectionHeader, SubHeader } from '../components/core/Section';
import Typography from '../components/core/Typography';
import { community } from '../components/core/Typography.dummy.json';
import AuthenticationBackdrop from '../components/layout/AuthenticationBackdrop';
import { Theme } from '../context/ThemeProvider';
import { Challenge as ChallengeType, User } from '../generated/graphql';
import { useUpdateNavigation } from '../hooks/useNavigation';
import hexToRGBA from '../utils/hexToRGBA';
import { PageProps } from './common';
import { UserProvider } from './Ecoverse';

interface ChallengePageProps extends PageProps {
  challenge: ChallengeType;
  users: User[] | undefined;
}

const Challenge: FC<ChallengePageProps> = ({ paths, challenge, users = [] }): React.ReactElement => {
  const { url } = useRouteMatch();
  const opportunityRef = useRef<HTMLDivElement>(null);
  useUpdateNavigation({ currentPaths: paths });
  const { name, context, opportunities } = challenge;
  const { references, background, tagline, who } = context || {};
  const visual = references?.find(x => x.name === 'visual');
  const video = references?.find(x => x.name === 'video');

  const activitySummary = useMemo(() => {
    return [
      { name: 'Opportunities', digit: opportunities?.length || 0, color: 'primary' },
      {
        name: 'Projects',
        digit: opportunities?.reduce((sum, c) => sum + (c.projects || []).length, 0),
        color: 'positive',
      },
      {
        name: 'Members',
        digit: users.length,
        color: 'neutralMedium',
      },
    ];
  }, [opportunities]);

  return (
    <>
      <Section
        details={
          <ActivityCard
            title={'challenge activity'}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items={activitySummary as any}
            classes={{ padding: (theme: Theme) => `${theme.shape.spacing(4)}px` }}
          />
        }
        classes={{
          background: (theme: Theme) =>
            visual ? `url("${visual.uri}") no-repeat center center / cover` : theme.palette.neutral,
          coverBackground: (theme: Theme) => hexToRGBA(theme.palette.neutral, 0.7),
        }}
        gutters={{
          root: true,
          content: true,
          details: false,
        }}
      >
        <Body className="d-flex flex-column flex-grow-1">
          <div className="d-flex flex-column flex-grow-1">
            <SectionHeader
              text={name}
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
        <SubHeader text={tagline} />
        <Body text={background}>{video && <Button text="See more" as={'a'} href={video.uri} target="_blank" />}</Body>
      </Section>
      <Divider />
      <AuthenticationBackdrop>
        <Section avatar={<Icon component={PeopleIcon} color="primary" size="xl" />}>
          <SectionHeader text={community.header} />
          <SubHeader text={community.subheader} />
          <Body text={who}>
            <UserProvider users={users}>
              {populated => (
                <>
                  <AvatarContainer className="d-flex" title={'Active community members'}>
                    {populated.map((u, i) => (
                      <Avatar className={'d-inline-flex'} key={i} src={u.profile?.avatar} />
                    ))}
                  </AvatarContainer>
                  <div style={{ flexBasis: '100%' }}></div>
                  {users.length - populated.length > 0 && (
                    <Typography variant="h3" as="h3" color="positive">
                      {`... + ${users.length - populated.length} other contributors`}
                    </Typography>
                  )}
                </>
              )}
            </UserProvider>
            <Button text="Explore and connect" as={Link} to="/community" />
          </Body>
        </Section>
      </AuthenticationBackdrop>
      <Divider />
      <div ref={opportunityRef}></div>
      <Section avatar={<Icon component={GemIcon} color="primary" size="xl" />}>
        <SectionHeader text="OPPORTUNITIES" />
        <SubHeader text="Potential solutions for this challenge" />
        {!opportunities ||
          (opportunities.length === 0 && <Body text={'No opportunities found for this challenge'}></Body>)}
      </Section>
      {opportunities && (
        <CardContainer cardHeight={380} xs={12} md={6} lg={4} xl={3}>
          {opportunities?.map((props, i) => (
            <OpportunityCard key={i} {...props} url={`${url}/opportunities/${props.textID}`} />
          ))}
        </CardContainer>
      )}
      <Divider />
    </>
  );
};

export { Challenge };

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactComponent as CompassIcon } from 'bootstrap-icons/icons/compass.svg';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import { ReactComponent as PeopleIcon } from 'bootstrap-icons/icons/people.svg';
import { ReactComponent as ErrorIcon } from 'bootstrap-icons/icons/exclamation-octagon.svg';
import React, { FC, useMemo } from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import ActivityCard from '../components/ActivityPanel';
import Avatar from '../components/core/Avatar';
import AvatarContainer from '../components/core/AvatarContainer';
import Button from '../components/core/Button';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import Icon from '../components/core/Icon';
import Loading from '../components/core/Loading';
import Section, { Body, Header as SectionHeader, SubHeader } from '../components/core/Section';
import Typography from '../components/core/Typography';
import {
  challenges as challengeLabels,
  community,
  projects as projectTexts,
} from '../components/core/Typography.dummy.json';
import { ChallengeCard, SwitchCardComponent } from '../components/Ecoverse/Cards';
import AuthenticationBackdrop from '../components/layout/AuthenticationBackdrop';
import {
  ChallengesQuery,
  EcoverseInfoQuery,
  useEcoverseHostReferencesQuery,
  User,
  useUserAvatarsQuery,
  useOpportunitiesQuery,
  useProjectsQuery,
  useProjectsChainHistoryQuery,
} from '../generated/graphql';
import { useUpdateNavigation } from '../hooks/useNavigation';
import { PageProps } from './common';
import { useUserContext } from '../hooks/useUserContext';
import { Col } from 'react-bootstrap';
import shuffleCollection from '../utils/shuffleCollection';
import { useAuthenticate } from '../hooks/useAuthenticate';

interface EcoversePageProps extends PageProps {
  ecoverse: EcoverseInfoQuery;
  challenges: {
    data: ChallengesQuery | undefined;
    error: any;
  };

  users: User[] | undefined;
}

interface UserProviderProps {
  users?: User[];
  count?: number;
  children: (users: User[]) => React.ReactNode;
}

// will move it to a separate component later
export const UserProvider: FC<UserProviderProps> = ({ users = [], count = 20, children }) => {
  const targetCount = Math.min(users.length, count);
  const targetIds = users.slice(0, targetCount).map(x => x.id);
  const { data, loading } = useUserAvatarsQuery({ variables: { ids: targetIds } });

  if (loading) {
    return <Loading text={'Loading avatars ...'} />;
  }

  if (!data) {
    return <></>;
  }

  return <>{children(data?.usersById as User[])}</>;
};

const ErrorBlock: FC<{ blockName: string }> = ({ blockName }) => (
  <div className={'d-flex align-items-lg-center justify-content-lg-center'}>
    <Icon component={ErrorIcon} size={'xl'} color={'neutralMedium'} />
    <Typography variant={'h5'} color={'neutralMedium'} className={'ml-3'}>
      Sorry, an error occurred while loading {blockName}
    </Typography>
  </div>
);

const Ecoverse: FC<EcoversePageProps> = ({
  paths,
  ecoverse,
  challenges: challengesQuery,
  users = [],
}): React.ReactElement => {
  const { url } = useRouteMatch();
  const history = useHistory();
  const user = useUserContext();
  const { isAuthenticated } = useAuthenticate();

  const { data: _opportunities } = useOpportunitiesQuery();
  const { data: _projects, error: projectsError } = useProjectsQuery();
  const { data: _projectsNestHistory, error: projectsHistoryError } = useProjectsChainHistoryQuery();
  const { data: hostData } = useEcoverseHostReferencesQuery();

  const challenges = challengesQuery?.data?.challenges || [];
  const challengesError = challengesQuery?.error;
  const projects = _projects?.projects || [];
  const opportunities = _opportunities?.opportunities || [];
  const projectsNestHistory = _projectsNestHistory?.challenges || [];

  useUpdateNavigation({ currentPaths: paths });

  const { name, context = {} } = ecoverse;
  const { tagline, impact, vision, background, references } = context;
  const ecoverseLogo = hostData?.host?.profile?.references?.find(ref => ref.name === 'logo')?.uri;
  // need to create utils for these bits...

  /**
   * getting out all projects and adding url dependency based on project's parents names
   */
  const projectsWithParentData = useMemo(
    () =>
      projectsNestHistory
        ?.flatMap(c =>
          c?.opportunities?.map(x => ({
            challenge: c.name,
            url: `${paths[paths.length - 1].value}/challenges/${c.textID}/opportunities/${x.textID}`,
            ...x,
          }))
        )
        .flatMap(o =>
          o?.projects?.flatMap(p => ({ caption: o?.challenge, url: `${o?.url}/projects/${p.textID}`, ...p }))
        ),
    [_projectsNestHistory]
  );

  /**
   * creating suitable for project card data + 1 mock card at the end
   */
  const ecoverseProjects = useMemo(
    () => [
      ...projects.map(p => {
        const parentsData = projectsWithParentData?.find(ph => ph?.textID === p.textID);

        return {
          title: p?.name || '',
          description: p?.description,
          caption: parentsData?.caption,
          tag: { status: 'positive', text: p?.state || '' },
          type: 'display',
          onSelect: () => history.replace(parentsData?.url || ''),
        };
      }),
      {
        title: 'MORE PROJECTS STARTING SOON',
        type: 'more',
      },
    ],
    [projects]
  );

  const more = references?.find(x => x.name === 'website');

  const activitySummary = useMemo(() => {
    const initial = [
      { name: 'Challenges', digit: challenges.length, color: 'neutral' },
      {
        name: 'Opportunities',
        digit: opportunities.length,
        color: 'primary',
      },
      {
        name: 'Projects',
        digit: projects.length,
        color: 'positive',
      },
    ];
    const withMembers = [
      ...initial,
      {
        name: 'Members',
        digit: users.length,
        color: 'neutralMedium',
      },
    ];
    return isAuthenticated ? withMembers : initial;
  }, [ecoverse, projects, isAuthenticated]);

  return (
    <>
      <Section
        avatar={
          ecoverseLogo ? (
            <img
              src={ecoverseLogo}
              alt={`${name} logo`}
              style={{ maxWidth: 320, height: 'initial', margin: '0 auto' }}
            />
          ) : (
            <div />
          )
        }
        details={<ActivityCard title={'ecoverse activity'} items={activitySummary as any} />}
      >
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
        <Body text={impact} />
      </Section>
      {challengesError ? (
        <Col xs={12}>
          <ErrorBlock blockName={'challenges'} />
        </Col>
      ) : (
        <CardContainer cardHeight={320} xs={12} md={6} lg={4} xl={3}>
          {challenges.map((challenge, i) => (
            <ChallengeCard
              key={i}
              {...(challenge as any)}
              context={{
                ...challenge.context,
                tag: user.user?.ofChallenge(challenge.id)
                  ? 'You are in'
                  : (challenge.context as Record<string, any>)['tag'],
              }}
              url={`${url}/challenges/${challenge.textID}`}
            />
          ))}
        </CardContainer>
      )}

      <Divider />
      <AuthenticationBackdrop>
        <Section avatar={<Icon component={PeopleIcon} color="primary" size="xl" />}>
          <SectionHeader text={community.header} />
          <SubHeader text={'The heroes working on this challenge'} />
          <Body text={community.body}>
            <UserProvider users={users}>
              {populated => (
                <>
                  <AvatarContainer className="d-flex" title={'Active community members'}>
                    {shuffleCollection(populated).map((u, i) => (
                      <Avatar className={'d-inline-flex'} key={i} src={u.profile?.avatar} />
                    ))}
                  </AvatarContainer>
                  <div style={{ flexBasis: '100%' }} />
                  {users.length - populated.length > 0 && (
                    <Typography variant="h3" as="h3" color="positive">
                      {`... + ${users.length - populated.length} other members`}
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
      {ecoverseProjects.length > 0 && (
        <>
          <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
            <SectionHeader text={projectTexts.header} tagText={'Work in progress'} />
            <SubHeader text={`${projectTexts.subheader} ${name} Evoverse`} />
          </Section>
          {projectsError || projectsHistoryError ? (
            <Col xs={12}>
              <ErrorBlock blockName={'projects'} />
            </Col>
          ) : (
            <CardContainer cardHeight={380} xs={12} md={6} lg={4} xl={3}>
              {ecoverseProjects.map(({ type, ...rest }, i) => {
                const Component = SwitchCardComponent({ type });
                return <Component {...rest} key={i} />;
              })}
            </CardContainer>
          )}

          <Divider />
        </>
      )}
    </>
  );
};

export { Ecoverse };

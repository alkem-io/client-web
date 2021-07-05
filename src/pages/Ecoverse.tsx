import { ReactComponent as CompassIcon } from 'bootstrap-icons/icons/compass.svg';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import React, { FC, useMemo } from 'react';
import { Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory, useRouteMatch } from 'react-router-dom';
import ActivityCard, { ActivityCardItem } from '../components/ActivityPanel';
import CommunitySection from '../components/Community/CommunitySection';
import Button from '../components/core/Button';
import { CardContainer } from '../components/core/Container';
import Divider from '../components/core/Divider';
import ErrorBlock from '../components/core/ErrorBlock';
import Icon from '../components/core/Icon';
import { Image } from '../components/core/Image';
import Markdown from '../components/core/Markdown';
import Section, { Body, Header as SectionHeader, SubHeader } from '../components/core/Section';
import { SwitchCardComponent } from '../components/Ecoverse/Cards';
import {
  useChallengesWithActivityQuery,
  useEcoverseActivityQuery,
  useEcoverseVisualQuery,
  useProjectsChainHistoryQuery,
  useProjectsQuery,
} from '../generated/graphql';
import { useAuthenticationContext } from '../hooks/useAuthenticationContext';
import { useUpdateNavigation } from '../hooks/useNavigation';
import { useUserContext } from '../hooks/useUserContext';
import { Context, EcoverseInfoQuery, User } from '../types/graphql-schema';
import { PageProps } from './common';
import AuthenticationBackdrop from '../components/layout/AuthenticationBackdrop';
import MembershipBackdrop from '../components/layout/MembershipBackdrop';
import getActivityCount from '../utils/get-activity-count';
import ChallengeCard from '../components/Ecoverse/ChallengeCard';
import Loading from '../components/core/Loading';

interface EcoversePageProps extends PageProps {
  ecoverse: EcoverseInfoQuery;
  users: User[] | undefined;
}

const EcoversePage: FC<EcoversePageProps> = ({ paths, ecoverse, users = [] }): React.ReactElement => {
  const { t } = useTranslation();
  const { url } = useRouteMatch();
  const history = useHistory();
  const { isAuthenticated } = useAuthenticationContext();
  const { user } = useUserContext();
  const { displayName: name, context, nameID: ecoverseId } = ecoverse.ecoverse;

  const { data: _projectsNestHistory } = useProjectsChainHistoryQuery({ variables: { ecoverseId } });

  const { data: _challenges, error: challengesError, loading: isChallengeLoading } = useChallengesWithActivityQuery({
    variables: { ecoverseId },
  });
  const challenges = _challenges?.ecoverse?.challenges || [];

  const { data: _projects } = useProjectsQuery({ variables: { ecoverseId } });
  const projects = _projects?.ecoverse?.projects || [];
  const projectsNestHistory = _projectsNestHistory?.ecoverse?.challenges || [];

  const { data: _visual } = useEcoverseVisualQuery({ variables: { ecoverseId } });
  const visual = _visual?.ecoverse?.context?.visual;

  const { data: _activity } = useEcoverseActivityQuery({ variables: { ecoverseId } });
  const activity = _activity?.ecoverse?.activity || [];

  useUpdateNavigation({ currentPaths: paths });

  const { tagline = '', impact = '', vision = '', background = '', references = [] } = context || ({} as Context);
  const ecoverseBanner = visual?.banner;
  // need to create utils for these bits...

  /**
   * getting out all projects and adding url dependency based on project's parents names
   */
  const projectsWithParentData = useMemo(
    () =>
      projectsNestHistory
        ?.flatMap(c =>
          c?.opportunities?.map(x => ({
            challenge: c.displayName,
            url: `${paths[paths.length - 1].value}/challenges/${c.nameID}/opportunities/${x.nameID}`,
            ...x,
          }))
        )
        .flatMap(o =>
          o?.projects?.flatMap(p => ({ caption: o?.challenge, url: `${o?.url}/projects/${p.nameID}`, ...p }))
        ),
    [_projectsNestHistory]
  );

  /**
   * creating suitable for project card data + 1 mock card at the end
   */
  const ecoverseProjects = useMemo(
    () => [
      ...projects.map(p => {
        const parentsData = projectsWithParentData?.find(ph => ph?.nameID === p.nameID);

        return {
          title: p?.displayName || '',
          description: p?.description,
          caption: parentsData?.caption,
          tag: { status: 'positive', text: p?.lifecycle?.state || '' },
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

  const activitySummary: ActivityCardItem[] = useMemo(
    () => [
      {
        name: t('pages.activity.challenges'),
        digit: getActivityCount(activity, 'challenges') || 0,
        color: 'neutral',
      },
      {
        name: t('pages.activity.opportunities'),
        digit: getActivityCount(activity, 'opportunities') || 0,
        color: 'primary',
      },
      {
        name: t('pages.activity.projects'),
        digit: getActivityCount(activity, 'projects') || 0,
        color: 'positive',
      },
      {
        name: t('pages.activity.members'),
        digit: getActivityCount(activity, 'members') || 0,
        color: 'neutralMedium',
      },
    ],
    [activity]
  );

  return (
    <>
      <Section
        avatar={
          ecoverseBanner ? (
            <Image
              src={ecoverseBanner}
              alt={`${name} logo`}
              style={{ maxWidth: 320, height: 'initial', margin: '0 auto' }}
            />
          ) : (
            <div />
          )
        }
        details={
          <ActivityCard
            title={t('pages.activity.title', { blockName: t('pages.ecoverse.title') })}
            items={activitySummary}
          />
        }
      >
        <SectionHeader text={name} />
        <SubHeader text={tagline} />
        <Body>
          <Markdown children={vision} />
          {more && <Button text={t('buttons.learn-more')} as={'a'} href={`${more.uri}`} target="_blank" />}
        </Body>
      </Section>
      <Divider />
      <MembershipBackdrop
        show={!user?.ofEcoverse(ecoverseId) || false}
        blockName={t('pages.ecoverse.sections.challenges.header')}
      >
        <Section avatar={<Icon component={CompassIcon} color="primary" size="xl" />}>
          <SectionHeader text={t('pages.ecoverse.sections.challenges.header')} />
          <SubHeader text={background} />
          <Body>
            <Markdown children={impact} />
          </Body>
        </Section>
        {isChallengeLoading && (
          <Loading
            text={t('components.loading.message', { blockName: t('pages.ecoverse.sections.challenges.header') })}
          />
        )}
        {challengesError ? (
          <Col xs={12}>
            <ErrorBlock blockName={t('pages.ecoverse.sections.challenges.header')} />
          </Col>
        ) : (
          <CardContainer>
            {challenges.map((challenge, i) => (
              <ChallengeCard
                key={i}
                id={challenge.id}
                displayName={challenge.displayName}
                activity={challenge?.activity || []}
                context={{
                  tagline: challenge?.context?.tagline || '',
                  visual: { background: challenge?.context?.visual?.background || '' },
                }}
                isMember={user?.ofChallenge(challenge.id) || false}
                tags={challenge?.tagset?.tags || []}
                url={`${url}/challenges/${challenge.nameID}`}
              />
            ))}
          </CardContainer>
        )}
      </MembershipBackdrop>

      <Divider />
      <AuthenticationBackdrop blockName={t('pages.ecoverse.sections.community.header')} show={!!user}>
        <CommunitySection
          title={t('pages.ecoverse.sections.community.header')}
          subTitle={t('pages.ecoverse.sections.community.subheader')}
          users={users}
          body={t('pages.ecoverse.sections.community.body')}
          shuffle={true}
          onExplore={() => history.push('/community')}
        />
      </AuthenticationBackdrop>
      <Divider />
      <AuthenticationBackdrop blockName={t('pages.ecoverse.sections.projects.header')} show={!!user}>
        {ecoverseProjects.length > 0 && (
          <>
            <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
              <SectionHeader text={t('pages.ecoverse.sections.projects.header')} tagText={'Work in progress'} />
              <SubHeader text={t('pages.ecoverse.sections.projects.subheader', { ecoverse: name })} />
            </Section>
            {isAuthenticated && (
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
      </AuthenticationBackdrop>
    </>
  );
};

export { EcoversePage as Ecoverse };
